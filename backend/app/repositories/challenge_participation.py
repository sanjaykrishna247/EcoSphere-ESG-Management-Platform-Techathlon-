from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.challenge_participation import ChallengeParticipation
from app.models.enums import ApprovalStatus
from app.models.user import User


class ChallengeParticipationRepository:
    async def list_mine(self, db: AsyncSession, employee_id: uuid.UUID) -> list[ChallengeParticipation]:
        result = await db.execute(
            select(ChallengeParticipation)
            .where(ChallengeParticipation.employee_id == employee_id)
            .order_by(ChallengeParticipation.created_at.desc())
        )
        return list(result.scalars().all())

    async def list(
        self,
        db: AsyncSession,
        page: int,
        per_page: int,
        challenge_id: uuid.UUID | None = None,
        approval_status: ApprovalStatus | None = None,
    ) -> tuple[list[ChallengeParticipation], int]:
        base = select(ChallengeParticipation)
        if challenge_id is not None:
            base = base.where(ChallengeParticipation.challenge_id == challenge_id)
        if approval_status is not None:
            base = base.where(ChallengeParticipation.approval_status == approval_status)

        total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar_one()
        result = await db.execute(
            base.order_by(ChallengeParticipation.created_at.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
        )
        return list(result.scalars().all()), total

    async def get_by_id(self, db: AsyncSession, id: uuid.UUID) -> ChallengeParticipation | None:
        result = await db.execute(select(ChallengeParticipation).where(ChallengeParticipation.id == id))
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, employee_id: uuid.UUID, challenge_id: uuid.UUID) -> ChallengeParticipation:
        participation = ChallengeParticipation(employee_id=employee_id, challenge_id=challenge_id)
        db.add(participation)
        await db.commit()
        await db.refresh(participation)
        return participation

    async def submit(
        self,
        db: AsyncSession,
        participation: ChallengeParticipation,
        progress: int,
        proof_url: str | None,
    ) -> ChallengeParticipation:
        participation.progress = progress
        if proof_url is not None:
            participation.proof_url = proof_url
        participation.submitted_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(participation)
        return participation

    async def approve(
        self,
        db: AsyncSession,
        participation: ChallengeParticipation,
        xp_awarded: int,
        reviewed_by: uuid.UUID,
    ) -> ChallengeParticipation:
        participation.approval_status = ApprovalStatus.approved
        participation.xp_awarded = xp_awarded
        participation.reviewed_by = reviewed_by

        employee = await db.get(User, participation.employee_id)
        if employee is not None:
            employee.xp_points = employee.xp_points + xp_awarded

        await db.commit()
        await db.refresh(participation)
        return participation

    async def reject(
        self, db: AsyncSession, participation: ChallengeParticipation, reviewed_by: uuid.UUID
    ) -> ChallengeParticipation:
        participation.approval_status = ApprovalStatus.rejected
        participation.reviewed_by = reviewed_by
        await db.commit()
        await db.refresh(participation)
        return participation

    async def set_proof_url(
        self, db: AsyncSession, participation: ChallengeParticipation, proof_url: str
    ) -> ChallengeParticipation:
        participation.proof_url = proof_url
        await db.commit()
        await db.refresh(participation)
        return participation


challenge_participation_repository = ChallengeParticipationRepository()
