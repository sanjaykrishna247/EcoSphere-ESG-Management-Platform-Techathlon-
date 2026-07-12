from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.policy_acknowledgement import PolicyAcknowledgement


class PolicyAcknowledgementRepository:
    async def create(
        self,
        db: AsyncSession,
        policy_id: uuid.UUID,
        employee_id: uuid.UUID,
        ip_address: str | None,
    ) -> PolicyAcknowledgement:
        ack = PolicyAcknowledgement(policy_id=policy_id, employee_id=employee_id, ip_address=ip_address)
        db.add(ack)
        await db.commit()
        await db.refresh(ack)
        return ack

    async def list_for_employee(self, db: AsyncSession, employee_id: uuid.UUID) -> list[PolicyAcknowledgement]:
        result = await db.execute(
            select(PolicyAcknowledgement)
            .where(PolicyAcknowledgement.employee_id == employee_id)
            .order_by(PolicyAcknowledgement.acknowledged_at.desc())
        )
        return list(result.scalars().all())

    async def list(
        self,
        db: AsyncSession,
        page: int,
        per_page: int,
        policy_id: uuid.UUID | None = None,
    ) -> tuple[list[PolicyAcknowledgement], int]:
        base = select(PolicyAcknowledgement)
        if policy_id is not None:
            base = base.where(PolicyAcknowledgement.policy_id == policy_id)
        total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar_one()
        result = await db.execute(
            base.order_by(PolicyAcknowledgement.acknowledged_at.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
        )
        return list(result.scalars().all()), total

    async def count_for_policy(self, db: AsyncSession, policy_id: uuid.UUID) -> int:
        result = await db.execute(
            select(func.count()).select_from(PolicyAcknowledgement).where(
                PolicyAcknowledgement.policy_id == policy_id
            )
        )
        return result.scalar_one()


policy_acknowledgement_repository = PolicyAcknowledgementRepository()
