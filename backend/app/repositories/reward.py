from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import RewardStatus
from app.models.reward import Reward
from app.models.reward_redemption import RewardRedemption
from app.schemas.reward import RewardCreate, RewardUpdate


class RewardRepository:
    async def list(self, db: AsyncSession, status: RewardStatus | None = None) -> list[Reward]:
        stmt = select(Reward).where(Reward.is_deleted.is_(False))
        if status is not None:
            stmt = stmt.where(Reward.status == status)
        result = await db.execute(stmt.order_by(Reward.name))
        return list(result.scalars().all())

    async def get_by_id(self, db: AsyncSession, id: uuid.UUID) -> Reward | None:
        result = await db.execute(select(Reward).where(Reward.id == id, Reward.is_deleted.is_(False)))
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, data: RewardCreate) -> Reward:
        reward = Reward(**data.model_dump())
        db.add(reward)
        await db.commit()
        await db.refresh(reward)
        return reward

    async def update(self, db: AsyncSession, reward: Reward, data: RewardUpdate) -> Reward:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(reward, field, value)
        await db.commit()
        await db.refresh(reward)
        return reward

    async def soft_delete(self, db: AsyncSession, reward: Reward) -> None:
        reward.is_deleted = True
        await db.commit()

    async def list_redemptions_mine(self, db: AsyncSession, employee_id: uuid.UUID) -> list[RewardRedemption]:
        result = await db.execute(
            select(RewardRedemption)
            .where(RewardRedemption.employee_id == employee_id)
            .order_by(RewardRedemption.redeemed_at.desc())
        )
        return list(result.scalars().all())


reward_repository = RewardRepository()
