from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.csr_activity import CsrActivity
from app.models.enums import CsrActivityStatus
from app.models.user import User
from app.models.employee_participation import EmployeeParticipation
from app.schemas.csr_activity import CsrActivityCreate, CsrActivityUpdate


class CsrActivityRepository:
    async def list(
        self,
        db: AsyncSession,
        page: int,
        per_page: int,
        status: CsrActivityStatus | None = None,
        department_id: uuid.UUID | None = None,
        category_id: uuid.UUID | None = None,
    ) -> tuple[list[CsrActivity], int]:
        base = select(CsrActivity).where(CsrActivity.is_deleted.is_(False))
        if status is not None:
            base = base.where(CsrActivity.status == status)
        if department_id is not None:
            base = base.where(CsrActivity.department_id == department_id)
        if category_id is not None:
            base = base.where(CsrActivity.category_id == category_id)

        total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar_one()
        result = await db.execute(
            base.order_by(CsrActivity.start_date.desc()).offset((page - 1) * per_page).limit(per_page)
        )
        return list(result.scalars().all()), total

    async def get_by_id(self, db: AsyncSession, id: uuid.UUID) -> CsrActivity | None:
        result = await db.execute(
            select(CsrActivity).where(CsrActivity.id == id, CsrActivity.is_deleted.is_(False))
        )
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, data: CsrActivityCreate, created_by: uuid.UUID | None) -> CsrActivity:
        activity = CsrActivity(**data.model_dump(), created_by=created_by)
        db.add(activity)
        await db.commit()
        await db.refresh(activity)
        return activity

    async def update(self, db: AsyncSession, activity: CsrActivity, data: CsrActivityUpdate) -> CsrActivity:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(activity, field, value)
        await db.commit()
        await db.refresh(activity)
        return activity

    async def soft_delete(self, db: AsyncSession, activity: CsrActivity) -> None:
        activity.is_deleted = True
        await db.commit()

    async def list_participants(self, db: AsyncSession, activity_id: uuid.UUID) -> list[dict]:
        result = await db.execute(
            select(EmployeeParticipation, User.full_name)
            .join(User, User.id == EmployeeParticipation.employee_id)
            .where(EmployeeParticipation.activity_id == activity_id)
            .order_by(EmployeeParticipation.created_at.desc())
        )
        rows = []
        for participation, full_name in result.all():
            rows.append(
                {
                    "id": participation.id,
                    "employee_id": participation.employee_id,
                    "employee_name": full_name,
                    "activity_id": participation.activity_id,
                    "proof_url": participation.proof_url,
                    "approval_status": participation.approval_status,
                    "points_earned": participation.points_earned,
                    "completion_date": participation.completion_date,
                    "created_at": participation.created_at,
                }
            )
        return rows


csr_activity_repository = CsrActivityRepository()
