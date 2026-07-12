from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit import Audit
from app.models.enums import AuditStatus, AuditType
from app.schemas.audit import AuditCreate, AuditUpdate


class AuditRepository:
    async def list(
        self,
        db: AsyncSession,
        page: int,
        per_page: int,
        status: AuditStatus | None = None,
        department_id: uuid.UUID | None = None,
        audit_type: AuditType | None = None,
    ) -> tuple[list[Audit], int]:
        base = select(Audit).where(Audit.is_deleted.is_(False))
        if status is not None:
            base = base.where(Audit.status == status)
        if department_id is not None:
            base = base.where(Audit.department_id == department_id)
        if audit_type is not None:
            base = base.where(Audit.audit_type == audit_type)
        total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar_one()
        result = await db.execute(
            base.order_by(Audit.scheduled_date.desc()).offset((page - 1) * per_page).limit(per_page)
        )
        return list(result.scalars().all()), total

    async def get_by_id(self, db: AsyncSession, id: uuid.UUID) -> Audit | None:
        result = await db.execute(select(Audit).where(Audit.id == id, Audit.is_deleted.is_(False)))
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, data: AuditCreate) -> Audit:
        audit = Audit(**data.model_dump())
        db.add(audit)
        await db.commit()
        await db.refresh(audit)
        return audit

    async def update(self, db: AsyncSession, audit: Audit, data: AuditUpdate) -> Audit:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(audit, field, value)
        await db.commit()
        await db.refresh(audit)
        return audit

    async def soft_delete(self, db: AsyncSession, audit: Audit) -> None:
        audit.is_deleted = True
        await db.commit()


audit_repository = AuditRepository()
