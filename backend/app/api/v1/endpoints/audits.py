import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.enums import AuditStatus, AuditType
from app.repositories.audit import audit_repository
from app.schemas.audit import AuditCreate, AuditOut, AuditUpdate
from app.schemas.common import PaginatedResponse, SuccessResponse

router = APIRouter(prefix="/audits", tags=["audits"])


@router.get("", response_model=SuccessResponse[PaginatedResponse[AuditOut]])
async def list_audits(
    status_: AuditStatus | None = Query(default=None, alias="status"),
    department_id: uuid.UUID | None = Query(default=None),
    audit_type: AuditType | None = Query(default=None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items, total = await audit_repository.list(db, page, per_page, status_, department_id, audit_type)
    return SuccessResponse(
        data=PaginatedResponse(
            items=[AuditOut.model_validate(i) for i in items],
            total=total,
            page=page,
            per_page=per_page,
            total_pages=(total + per_page - 1) // per_page,
        )
    )


@router.post("", response_model=SuccessResponse[AuditOut], status_code=status.HTTP_201_CREATED)
async def create_audit(
    data: AuditCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    audit = await audit_repository.create(db, data)
    return SuccessResponse(data=AuditOut.model_validate(audit))


@router.get("/{id}", response_model=SuccessResponse[AuditOut])
async def get_audit(
    id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)
):
    audit = await audit_repository.get_by_id(db, id)
    if audit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audit not found")
    return SuccessResponse(data=AuditOut.model_validate(audit))


@router.patch("/{id}", response_model=SuccessResponse[AuditOut])
async def update_audit(
    id: uuid.UUID,
    data: AuditUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    audit = await audit_repository.get_by_id(db, id)
    if audit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audit not found")
    audit = await audit_repository.update(db, audit, data)
    return SuccessResponse(data=AuditOut.model_validate(audit))


@router.delete("/{id}", response_model=SuccessResponse[None])
async def delete_audit(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    audit = await audit_repository.get_by_id(db, id)
    if audit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audit not found")
    await audit_repository.soft_delete(db, audit)
    return SuccessResponse(data=None, message="Audit deleted")
