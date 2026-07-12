from __future__ import annotations

import uuid
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.department_score import DepartmentScore


class DepartmentScoreRepository:
    async def list(
        self,
        db: AsyncSession,
        department_id: uuid.UUID | None = None,
        period_start: date | None = None,
        period_end: date | None = None,
    ) -> list[DepartmentScore]:
        stmt = select(DepartmentScore)
        if department_id is not None:
            stmt = stmt.where(DepartmentScore.department_id == department_id)
        if period_start is not None:
            stmt = stmt.where(DepartmentScore.period_start == period_start)
        if period_end is not None:
            stmt = stmt.where(DepartmentScore.period_end == period_end)
        result = await db.execute(stmt.order_by(DepartmentScore.period_end.desc()))
        return list(result.scalars().all())

    async def get_for_period(
        self, db: AsyncSession, department_id: uuid.UUID, period_start: date, period_end: date
    ) -> DepartmentScore | None:
        result = await db.execute(
            select(DepartmentScore).where(
                DepartmentScore.department_id == department_id,
                DepartmentScore.period_start == period_start,
                DepartmentScore.period_end == period_end,
            )
        )
        return result.scalar_one_or_none()

    async def get_latest_for_department(
        self, db: AsyncSession, department_id: uuid.UUID
    ) -> DepartmentScore | None:
        result = await db.execute(
            select(DepartmentScore)
            .where(DepartmentScore.department_id == department_id)
            .order_by(DepartmentScore.period_end.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def upsert(
        self,
        db: AsyncSession,
        department_id: uuid.UUID,
        period_start: date,
        period_end: date,
        environmental_score: float,
        social_score: float,
        governance_score: float,
        total_score: float,
    ) -> DepartmentScore:
        existing = await self.get_for_period(db, department_id, period_start, period_end)
        if existing is not None:
            existing.environmental_score = environmental_score
            existing.social_score = social_score
            existing.governance_score = governance_score
            existing.total_score = total_score
            await db.commit()
            await db.refresh(existing)
            return existing

        score = DepartmentScore(
            department_id=department_id,
            period_start=period_start,
            period_end=period_end,
            environmental_score=environmental_score,
            social_score=social_score,
            governance_score=governance_score,
            total_score=total_score,
        )
        db.add(score)
        await db.commit()
        await db.refresh(score)
        return score


department_score_repository = DepartmentScoreRepository()
