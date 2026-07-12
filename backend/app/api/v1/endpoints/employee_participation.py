import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.enums import ApprovalStatus, NotificationType
from app.models.esg_configuration import EsgConfiguration
from app.repositories.csr_activity import csr_activity_repository
from app.repositories.employee_participation import employee_participation_repository
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.schemas.employee_participation import (
    EmployeeParticipationCreate,
    EmployeeParticipationOut,
    EmployeeParticipationRejectRequest,
)
from app.services.badge_service import badge_service
from app.services.notification_service import notification_service

router = APIRouter(prefix="/employee-participations", tags=["employee-participations"])


@router.post("", response_model=SuccessResponse[EmployeeParticipationOut], status_code=status.HTTP_201_CREATED)
async def join_csr_activity(
    data: EmployeeParticipationCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    activity = await csr_activity_repository.get_by_id(db, data.activity_id)
    if activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CSR activity not found")

    try:
        participation = await employee_participation_repository.create(db, current_user.id, data)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="You have already joined this activity"
        )
    return SuccessResponse(data=EmployeeParticipationOut.model_validate(participation))


@router.get("/mine", response_model=SuccessResponse[list[EmployeeParticipationOut]])
async def list_my_participations(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items = await employee_participation_repository.list_mine(db, current_user.id)
    return SuccessResponse(data=[EmployeeParticipationOut.model_validate(i) for i in items])


@router.get("", response_model=SuccessResponse[PaginatedResponse[EmployeeParticipationOut]])
async def list_participations(
    activity_id: uuid.UUID | None = Query(default=None),
    approval_status: ApprovalStatus | None = Query(default=None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    items, total = await employee_participation_repository.list(
        db, page, per_page, activity_id=activity_id, approval_status=approval_status
    )
    return SuccessResponse(
        data=PaginatedResponse(
            items=[EmployeeParticipationOut.model_validate(i) for i in items],
            total=total,
            page=page,
            per_page=per_page,
            total_pages=(total + per_page - 1) // per_page,
        )
    )


@router.patch("/{id}/approve", response_model=SuccessResponse[EmployeeParticipationOut])
async def approve_participation(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    participation = await employee_participation_repository.get_by_id(db, id)
    if participation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participation not found")

    activity = await csr_activity_repository.get_by_id(db, participation.activity_id)
    if activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CSR activity not found")

    config_result = await db.execute(select(EsgConfiguration).limit(1))
    config = config_result.scalar_one_or_none()
    evidence_required = config is None or config.evidence_requirement
    if evidence_required and not participation.proof_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Proof of participation is required before approval",
        )

    participation = await employee_participation_repository.approve(
        db, participation, points_earned=activity.points_value, reviewed_by=current_user.id
    )
    await badge_service.check_and_award(db, participation.employee_id)
    await notification_service.create_and_send(
        db,
        recipient_id=participation.employee_id,
        type=NotificationType.csr_approval,
        title="CSR Participation Approved",
        message=f"Your participation in '{activity.title}' was approved. You earned {participation.points_earned} points.",
        reference_type="csr_activity",
        reference_id=activity.id,
    )
    return SuccessResponse(data=EmployeeParticipationOut.model_validate(participation))


@router.patch("/{id}/reject", response_model=SuccessResponse[EmployeeParticipationOut])
async def reject_participation(
    id: uuid.UUID,
    data: EmployeeParticipationRejectRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    participation = await employee_participation_repository.get_by_id(db, id)
    if participation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participation not found")

    activity = await csr_activity_repository.get_by_id(db, participation.activity_id)

    participation = await employee_participation_repository.reject(
        db, participation, reviewed_by=current_user.id, review_notes=data.review_notes
    )
    await notification_service.create_and_send(
        db,
        recipient_id=participation.employee_id,
        type=NotificationType.csr_approval,
        title="CSR Participation Rejected",
        message=(
            f"Your participation in '{activity.title}' was rejected."
            if activity is not None
            else "Your CSR participation was rejected."
        ),
        reference_type="csr_activity",
        reference_id=participation.activity_id,
    )
    return SuccessResponse(data=EmployeeParticipationOut.model_validate(participation))


@router.post("/{id}/upload-proof", response_model=SuccessResponse[EmployeeParticipationOut])
async def upload_participation_proof(
    id: uuid.UUID,
    file: UploadFile,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    participation = await employee_participation_repository.get_by_id(db, id)
    if participation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participation not found")
    if participation.employee_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only upload proof for your own participation")

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    contents = await file.read()
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum upload size of {settings.MAX_UPLOAD_SIZE_MB}MB",
        )

    upload_dir = Path(settings.UPLOAD_DIR) / "csr-proofs"
    upload_dir.mkdir(parents=True, exist_ok=True)

    original_name = file.filename or "upload"
    extension = Path(original_name).suffix
    stored_name = f"{uuid.uuid4()}{extension}"
    file_path = upload_dir / stored_name
    with open(file_path, "wb") as f:
        f.write(contents)

    proof_url = f"uploads/csr-proofs/{stored_name}"
    participation = await employee_participation_repository.set_proof_url(db, participation, proof_url)
    return SuccessResponse(data=EmployeeParticipationOut.model_validate(participation))
