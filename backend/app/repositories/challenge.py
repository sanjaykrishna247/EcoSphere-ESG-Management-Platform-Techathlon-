from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.challenge import Challenge
from app.models.challenge_participation import ChallengeParticipation
from app.models.enums import ChallengeDifficulty, ChallengeStatus
from app.schemas.challenge import ChallengeCreate, ChallengeUpdate

# Explicit challenge lifecycle transition table.
# Any status may transition to `archived` (soft "cancel" from anywhere),
# but otherwise the lifecycle must proceed strictly in order with no skipping.
ALLOWED_TRANSITIONS: dict[ChallengeStatus, set[ChallengeStatus]] = {
    ChallengeStatus.draft: {ChallengeStatus.active, ChallengeStatus.archived},
    ChallengeStatus.active: {ChallengeStatus.under_review, ChallengeStatus.archived},
    ChallengeStatus.under_review: {ChallengeStatus.completed, ChallengeStatus.archived},
    ChallengeStatus.completed: {ChallengeStatus.archived},
    ChallengeStatus.archived: set(),
}


class ChallengeRepository:
    async def list(
        self,
        db: AsyncSession,
        page: int,
        per_page: int,
        status: ChallengeStatus | None = None,
        difficulty: ChallengeDifficulty | None = None,
        category_id: uuid.UUID | None = None,
    ) -> tuple[list[Challenge], int]:
        base = select(Challenge).where(Challenge.is_deleted.is_(False))
        if status is not None:
            base = base.where(Challenge.status == status)
        if difficulty is not None:
            base = base.where(Challenge.difficulty == difficulty)
        if category_id is not None:
            base = base.where(Challenge.category_id == category_id)

        total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar_one()
        result = await db.execute(
            base.order_by(Challenge.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
        )
        return list(result.scalars().all()), total

    async def get_by_id(self, db: AsyncSession, id: uuid.UUID) -> Challenge | None:
        result = await db.execute(
            select(Challenge).where(Challenge.id == id, Challenge.is_deleted.is_(False))
        )
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, data: ChallengeCreate, created_by: uuid.UUID) -> Challenge:
        challenge = Challenge(**data.model_dump(), created_by=created_by, status=ChallengeStatus.draft)
        db.add(challenge)
        await db.commit()
        await db.refresh(challenge)
        return challenge

    async def update(self, db: AsyncSession, challenge: Challenge, data: ChallengeUpdate) -> Challenge:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(challenge, field, value)
        await db.commit()
        await db.refresh(challenge)
        return challenge

    async def soft_delete(self, db: AsyncSession, challenge: Challenge) -> None:
        challenge.is_deleted = True
        await db.commit()

    def is_transition_allowed(self, current: ChallengeStatus, target: ChallengeStatus) -> bool:
        return target in ALLOWED_TRANSITIONS.get(current, set())

    async def set_status(
        self, db: AsyncSession, challenge: Challenge, new_status: ChallengeStatus
    ) -> Challenge:
        challenge.status = new_status
        await db.commit()
        await db.refresh(challenge)
        return challenge

    async def list_participants(self, db: AsyncSession, challenge_id: uuid.UUID) -> list[ChallengeParticipation]:
        result = await db.execute(
            select(ChallengeParticipation)
            .where(ChallengeParticipation.challenge_id == challenge_id)
            .order_by(ChallengeParticipation.created_at.desc())
        )
        return list(result.scalars().all())


challenge_repository = ChallengeRepository()
