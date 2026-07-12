from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.environmental_goal import EnvironmentalGoal
from app.models.enums import GoalStatus
from app.schemas.environmental_goal import EnvironmentalGoalCreate, EnvironmentalGoalUpdate


class EnvironmentalGoalRepository:
    async def list(
        self,
        db: AsyncSession,
        page: int,
        per_page: int,
        department_id: uuid.UUID | None = None,
        status: GoalStatus | None = None,
    ) -> tuple[list[EnvironmentalGoal], int]:
        base = select(EnvironmentalGoal).where(EnvironmentalGoal.is_deleted.is_(False))
        if department_id is not None:
            base = base.where(EnvironmentalGoal.department_id == department_id)
        if status is not None:
            base = base.where(EnvironmentalGoal.status == status)

        total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar_one()
        result = await db.execute(
            base.order_by(EnvironmentalGoal.end_date).offset((page - 1) * per_page).limit(per_page)
        )
        return list(result.scalars().all()), total

    async def get_by_id(self, db: AsyncSession, id: uuid.UUID) -> EnvironmentalGoal | None:
        result = await db.execute(
            select(EnvironmentalGoal).where(
                EnvironmentalGoal.id == id, EnvironmentalGoal.is_deleted.is_(False)
            )
        )
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, data: EnvironmentalGoalCreate) -> EnvironmentalGoal:
        goal = EnvironmentalGoal(**data.model_dump())
        db.add(goal)
        await db.commit()
        await db.refresh(goal)
        return goal

    async def update(
        self, db: AsyncSession, goal: EnvironmentalGoal, data: EnvironmentalGoalUpdate
    ) -> EnvironmentalGoal:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(goal, field, value)
        await db.commit()
        await db.refresh(goal)
        return goal

    async def soft_delete(self, db: AsyncSession, goal: EnvironmentalGoal) -> None:
        goal.is_deleted = True
        await db.commit()


environmental_goal_repository = EnvironmentalGoalRepository()
