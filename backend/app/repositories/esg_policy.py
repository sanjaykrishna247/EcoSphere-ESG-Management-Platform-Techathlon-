from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import PolicyCategory
from app.models.esg_policy import EsgPolicy
from app.schemas.esg_policy import EsgPolicyCreate, EsgPolicyUpdate


class EsgPolicyRepository:
    async def list(
        self,
        db: AsyncSession,
        page: int,
        per_page: int,
        category: PolicyCategory | None = None,
        is_active: bool | None = None,
    ) -> tuple[list[EsgPolicy], int]:
        base = select(EsgPolicy).where(EsgPolicy.is_deleted.is_(False))
        if category is not None:
            base = base.where(EsgPolicy.category == category)
        if is_active is not None:
            base = base.where(EsgPolicy.is_active == is_active)
        total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar_one()
        result = await db.execute(
            base.order_by(EsgPolicy.effective_date.desc()).offset((page - 1) * per_page).limit(per_page)
        )
        return list(result.scalars().all()), total

    async def get_by_id(self, db: AsyncSession, id: uuid.UUID) -> EsgPolicy | None:
        result = await db.execute(select(EsgPolicy).where(EsgPolicy.id == id, EsgPolicy.is_deleted.is_(False)))
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, data: EsgPolicyCreate) -> EsgPolicy:
        policy = EsgPolicy(**data.model_dump())
        db.add(policy)
        await db.commit()
        await db.refresh(policy)
        return policy

    async def update(self, db: AsyncSession, policy: EsgPolicy, data: EsgPolicyUpdate) -> EsgPolicy:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(policy, field, value)
        await db.commit()
        await db.refresh(policy)
        return policy

    async def soft_delete(self, db: AsyncSession, policy: EsgPolicy) -> None:
        policy.is_deleted = True
        await db.commit()


esg_policy_repository = EsgPolicyRepository()
