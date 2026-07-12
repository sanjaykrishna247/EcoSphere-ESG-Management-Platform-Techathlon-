from __future__ import annotations

import uuid
from datetime import date

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee_participation import EmployeeParticipation
from app.models.enums import ApprovalStatus
from app.models.user import User
from app.schemas.employee_participation import EmployeeParticipationCreate


class EmployeeParticipationRepository:
    async def list_mine(self, db: AsyncSession, employee_id: uuid.UUID) -> list[EmployeeParticipation]:
        result = await db.execute(
            select(EmployeeParticipation)
            .where(EmployeeParticipation.employee_id == employee_id)
            .order_by(EmployeeParticipation.created_at.desc())
        )
        return list(result.scalars().all())

    async def list(
        self,
        db: AsyncSession,
        page: int,
        per_page: int,
        activity_id: uuid.UUID | None = None,
        approval_status: ApprovalStatus | None = None,
    ) -> tuple[list[EmployeeParticipation], int]:
        base = select(EmployeeParticipation)
        if activity_id is not None:
            base = base.where(EmployeeParticipation.activity_id == activity_id)
        if approval_status is not None:
            base = base.where(EmployeeParticipation.approval_status == approval_status)

        total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar_one()
        result = await db.execute(
            base.order_by(EmployeeParticipation.created_at.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
        )
        return list(result.scalars().all()), total

    async def get_by_id(self, db: AsyncSession, id: uuid.UUID) -> EmployeeParticipation | None:
        result = await db.execute(select(EmployeeParticipation).where(EmployeeParticipation.id == id))
        return result.scalar_one_or_none()

    async def create(
        self, db: AsyncSession, employee_id: uuid.UUID, data: EmployeeParticipationCreate
    ) -> EmployeeParticipation:
        participation = EmployeeParticipation(employee_id=employee_id, activity_id=data.activity_id)
        db.add(participation)
        await db.commit()
        await db.refresh(participation)
        return participation

    async def approve(
        self,
        db: AsyncSession,
        participation: EmployeeParticipation,
        points_earned: int,
        reviewed_by: uuid.UUID,
    ) -> EmployeeParticipation:
        participation.approval_status = ApprovalStatus.approved
        participation.points_earned = points_earned
        participation.reviewed_by = reviewed_by
        participation.completion_date = date.today()

        employee = await db.get(User, participation.employee_id)
        if employee is not None:
            employee.total_points = employee.total_points + points_earned

        await db.commit()
        await db.refresh(participation)
        return participation

    async def reject(
        self,
        db: AsyncSession,
        participation: EmployeeParticipation,
        reviewed_by: uuid.UUID,
        review_notes: str | None,
    ) -> EmployeeParticipation:
        participation.approval_status = ApprovalStatus.rejected
        participation.reviewed_by = reviewed_by
        participation.review_notes = review_notes
        await db.commit()
        await db.refresh(participation)
        return participation

    async def set_proof_url(self, db: AsyncSession, participation: EmployeeParticipation, proof_url: str) -> EmployeeParticipation:
        participation.proof_url = proof_url
        await db.commit()
        await db.refresh(participation)
        return participation


employee_participation_repository = EmployeeParticipationRepository()
