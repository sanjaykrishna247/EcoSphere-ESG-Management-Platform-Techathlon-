import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.enums import CsrActivityStatus
from app.repositories.csr_activity import csr_activity_repository
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.schemas.csr_activity import (
    CsrActivityCreate,
    CsrActivityOut,
    CsrActivityParticipantOut,
    CsrActivityUpdate,
)

router = APIRouter(prefix="/csr-activities", tags=["csr-activities"])


@router.get("", response_model=SuccessResponse[PaginatedResponse[CsrActivityOut]])
async def list_csr_activities(
    status_filter: CsrActivityStatus | None = Query(default=None, alias="status"),
    department_id: uuid.UUID | None = Query(default=None),
    category_id: uuid.UUID | None = Query(default=None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items, total = await csr_activity_repository.list(
        db, page, per_page, status=status_filter, department_id=department_id, category_id=category_id
    )
    return SuccessResponse(
        data=PaginatedResponse(
            items=[CsrActivityOut.model_validate(i) for i in items],
            total=total,
            page=page,
            per_page=per_page,
            total_pages=(total + per_page - 1) // per_page,
        )
    )


@router.post("", response_model=SuccessResponse[CsrActivityOut], status_code=status.HTTP_201_CREATED)
async def create_csr_activity(
    data: CsrActivityCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    activity = await csr_activity_repository.create(db, data, created_by=current_user.id)
    return SuccessResponse(data=CsrActivityOut.model_validate(activity))


@router.get("/{id}", response_model=SuccessResponse[CsrActivityOut])
async def get_csr_activity(
    id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)
):
    activity = await csr_activity_repository.get_by_id(db, id)
    if activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CSR activity not found")
    return SuccessResponse(data=CsrActivityOut.model_validate(activity))


@router.patch("/{id}", response_model=SuccessResponse[CsrActivityOut])
async def update_csr_activity(
    id: uuid.UUID,
    data: CsrActivityUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    activity = await csr_activity_repository.get_by_id(db, id)
    if activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CSR activity not found")
    activity = await csr_activity_repository.update(db, activity, data)
    return SuccessResponse(data=CsrActivityOut.model_validate(activity))


@router.delete("/{id}", response_model=SuccessResponse[None])
async def delete_csr_activity(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    activity = await csr_activity_repository.get_by_id(db, id)
    if activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CSR activity not found")
    await csr_activity_repository.soft_delete(db, activity)
    return SuccessResponse(data=None, message="CSR activity deleted")


@router.get("/{id}/participants", response_model=SuccessResponse[list[CsrActivityParticipantOut]])
async def list_csr_activity_participants(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    activity = await csr_activity_repository.get_by_id(db, id)
    if activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CSR activity not found")
    rows = await csr_activity_repository.list_participants(db, id)
    return SuccessResponse(data=[CsrActivityParticipantOut.model_validate(r) for r in rows])
