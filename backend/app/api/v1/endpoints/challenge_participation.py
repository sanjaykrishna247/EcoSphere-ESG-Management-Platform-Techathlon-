import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.enums import ChallengeStatus, NotificationType
from app.repositories.challenge import challenge_repository
from app.repositories.challenge_participation import challenge_participation_repository
from app.schemas.challenge_participation import (
    ChallengeParticipationCreate,
    ChallengeParticipationOut,
    ChallengeParticipationSubmit,
)
from app.schemas.common import SuccessResponse
from app.services.badge_service import badge_service
from app.services.notification_service import notification_service

router = APIRouter(prefix="/challenge-participations", tags=["challenge-participations"])


@router.post("", response_model=SuccessResponse[ChallengeParticipationOut], status_code=status.HTTP_201_CREATED)
async def join_challenge(
    data: ChallengeParticipationCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    challenge = await challenge_repository.get_by_id(db, data.challenge_id)
    if challenge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")
    if challenge.status != ChallengeStatus.active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can only join challenges that are currently active",
        )

    try:
        participation = await challenge_participation_repository.create(db, current_user.id, data.challenge_id)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="You have already joined this challenge"
        )
    return SuccessResponse(data=ChallengeParticipationOut.model_validate(participation))


@router.get("/mine", response_model=SuccessResponse[list[ChallengeParticipationOut]])
async def list_my_participations(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items = await challenge_participation_repository.list_mine(db, current_user.id)
    return SuccessResponse(data=[ChallengeParticipationOut.model_validate(i) for i in items])


@router.patch("/{id}/submit", response_model=SuccessResponse[ChallengeParticipationOut])
async def submit_participation(
    id: uuid.UUID,
    data: ChallengeParticipationSubmit,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    participation = await challenge_participation_repository.get_by_id(db, id)
    if participation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participation not found")
    if participation.employee_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="You can only submit your own participation"
        )

    challenge = await challenge_repository.get_by_id(db, participation.challenge_id)
    proof_url = data.proof_url
    if challenge is not None and challenge.evidence_required and not proof_url and not participation.proof_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Proof is required for this challenge before submitting",
        )

    participation = await challenge_participation_repository.submit(db, participation, data.progress, proof_url)
    return SuccessResponse(data=ChallengeParticipationOut.model_validate(participation))


@router.patch("/{id}/approve", response_model=SuccessResponse[ChallengeParticipationOut])
async def approve_participation(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    participation = await challenge_participation_repository.get_by_id(db, id)
    if participation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participation not found")

    challenge = await challenge_repository.get_by_id(db, participation.challenge_id)
    if challenge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")

    participation = await challenge_participation_repository.approve(
        db, participation, xp_awarded=challenge.xp_reward, reviewed_by=current_user.id
    )
    await badge_service.check_and_award(db, participation.employee_id)
    await notification_service.create_and_send(
        db,
        recipient_id=participation.employee_id,
        type=NotificationType.challenge_approval,
        title="Challenge Approved",
        message=f"Your participation in '{challenge.title}' was approved. You earned {participation.xp_awarded} XP.",
        reference_type="challenge",
        reference_id=challenge.id,
    )
    return SuccessResponse(data=ChallengeParticipationOut.model_validate(participation))


@router.patch("/{id}/reject", response_model=SuccessResponse[ChallengeParticipationOut])
async def reject_participation(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    participation = await challenge_participation_repository.get_by_id(db, id)
    if participation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participation not found")

    challenge = await challenge_repository.get_by_id(db, participation.challenge_id)

    participation = await challenge_participation_repository.reject(db, participation, reviewed_by=current_user.id)
    await notification_service.create_and_send(
        db,
        recipient_id=participation.employee_id,
        type=NotificationType.challenge_approval,
        title="Challenge Submission Rejected",
        message=(
            f"Your participation in '{challenge.title}' was rejected."
            if challenge is not None
            else "Your challenge participation was rejected."
        ),
        reference_type="challenge",
        reference_id=participation.challenge_id,
    )
    return SuccessResponse(data=ChallengeParticipationOut.model_validate(participation))


@router.post("/{id}/upload-proof", response_model=SuccessResponse[ChallengeParticipationOut])
async def upload_participation_proof(
    id: uuid.UUID,
    file: UploadFile,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    participation = await challenge_participation_repository.get_by_id(db, id)
    if participation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participation not found")
    if participation.employee_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="You can only upload proof for your own participation"
        )

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    contents = await file.read()
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum upload size of {settings.MAX_UPLOAD_SIZE_MB}MB",
        )

    upload_dir = Path(settings.UPLOAD_DIR) / "challenge-proofs"
    upload_dir.mkdir(parents=True, exist_ok=True)

    original_name = file.filename or "upload"
    extension = Path(original_name).suffix
    stored_name = f"{uuid.uuid4()}{extension}"
    file_path = upload_dir / stored_name
    with open(file_path, "wb") as f:
        f.write(contents)

    proof_url = f"uploads/challenge-proofs/{stored_name}"
    participation = await challenge_participation_repository.set_proof_url(db, participation, proof_url)
    return SuccessResponse(data=ChallengeParticipationOut.model_validate(participation))
