import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.badge import Badge, EmployeeBadge
from app.models.challenge_participation import ChallengeParticipation
from app.models.employee_participation import EmployeeParticipation
from app.models.enums import ApprovalStatus, NotificationType
from app.models.esg_configuration import EsgConfiguration
from app.models.user import User
from app.services.notification_service import notification_service


class BadgeService:
    async def _auto_award_enabled(self, db: AsyncSession) -> bool:
        result = await db.execute(select(EsgConfiguration).limit(1))
        config = result.scalar_one_or_none()
        return config is None or config.badge_auto_award

    async def _user_stats(self, db: AsyncSession, user_id: uuid.UUID) -> dict:
        user = await db.get(User, user_id)
        challenge_count = (
            await db.execute(
                select(func.count()).select_from(ChallengeParticipation).where(
                    ChallengeParticipation.employee_id == user_id,
                    ChallengeParticipation.approval_status == ApprovalStatus.approved,
                )
            )
        ).scalar_one()
        csr_count = (
            await db.execute(
                select(func.count()).select_from(EmployeeParticipation).where(
                    EmployeeParticipation.employee_id == user_id,
                    EmployeeParticipation.approval_status == ApprovalStatus.approved,
                )
            )
        ).scalar_one()
        return {
            "xp": user.xp_points if user else 0,
            "completed_challenges": challenge_count,
            "approved_csr": csr_count,
        }

    def evaluate_rule(self, rule: dict, user_stats: dict) -> bool:
        rule_type = rule.get("type")
        value = rule.get("value", 0)
        if rule_type == "xp_threshold":
            return user_stats["xp"] >= value
        if rule_type == "challenge_count":
            return user_stats["completed_challenges"] >= value
        if rule_type == "csr_count":
            return user_stats["approved_csr"] >= value
        return False

    async def check_and_award(self, db: AsyncSession, user_id: uuid.UUID) -> list[Badge]:
        if not await self._auto_award_enabled(db):
            return []

        already_awarded_ids = set(
            (
                await db.execute(
                    select(EmployeeBadge.badge_id).where(EmployeeBadge.employee_id == user_id)
                )
            ).scalars().all()
        )
        all_badges = (
            (await db.execute(select(Badge).where(Badge.is_active.is_(True)))).scalars().all()
        )
        candidates = [b for b in all_badges if b.id not in already_awarded_ids]
        if not candidates:
            return []

        user_stats = await self._user_stats(db, user_id)
        awarded: list[Badge] = []
        for badge in candidates:
            if self.evaluate_rule(badge.unlock_rule, user_stats):
                db.add(EmployeeBadge(employee_id=user_id, badge_id=badge.id))
                awarded.append(badge)

        if awarded:
            await db.commit()
            for badge in awarded:
                await notification_service.create_and_send(
                    db,
                    recipient_id=user_id,
                    type=NotificationType.badge_unlocked,
                    title="Badge Unlocked!",
                    message=f"You unlocked the '{badge.name}' badge.",
                    reference_type="badge",
                    reference_id=badge.id,
                )
        return awarded


badge_service = BadgeService()
