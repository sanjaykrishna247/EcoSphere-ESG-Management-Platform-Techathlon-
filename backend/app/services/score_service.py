from datetime import date, timedelta
from uuid import UUID

from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.carbon_transaction import CarbonTransaction
from app.models.compliance_issue import ComplianceIssue
from app.models.department import Department
from app.models.department_score import DepartmentScore
from app.models.employee_participation import EmployeeParticipation
from app.models.challenge_participation import ChallengeParticipation
from app.models.enums import ApprovalStatus, IssueSeverity, IssueStatus
from app.models.environmental_goal import EnvironmentalGoal
from app.models.esg_configuration import EsgConfiguration
from app.models.esg_policy import EsgPolicy
from app.models.policy_acknowledgement import PolicyAcknowledgement
from app.models.user import User
from app.repositories.department_score import department_score_repository


def _clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, value))


class ScoreService:
    async def _get_weights(self, db: AsyncSession) -> tuple[float, float, float]:
        result = await db.execute(select(EsgConfiguration).limit(1))
        config = result.scalar_one_or_none()
        if config is None:
            # No org configuration row yet: fall back to the platform default
            # weighting used elsewhere (40/30/30).
            return 40.0, 30.0, 30.0
        return (
            float(config.environmental_weight),
            float(config.social_weight),
            float(config.governance_weight),
        )

    async def _employee_ids(self, db: AsyncSession, dept_id: UUID) -> list[UUID]:
        result = await db.execute(
            select(User.id).where(User.department_id == dept_id, User.is_deleted.is_(False))
        )
        return [row[0] for row in result.all()]

    async def _environmental_score(
        self, db: AsyncSession, dept_id: UUID, period_start: date, period_end: date
    ) -> float:
        actual = (
            await db.execute(
                select(func.coalesce(func.sum(CarbonTransaction.co2_equivalent), 0)).where(
                    CarbonTransaction.department_id == dept_id,
                    CarbonTransaction.transaction_date >= period_start,
                    CarbonTransaction.transaction_date <= period_end,
                )
            )
        ).scalar_one()

        target = (
            await db.execute(
                select(func.coalesce(func.sum(EnvironmentalGoal.target_value), 0)).where(
                    or_(
                        EnvironmentalGoal.department_id == dept_id,
                        EnvironmentalGoal.department_id.is_(None),
                    ),
                    # "active in that period" == goal window overlaps the requested period
                    EnvironmentalGoal.start_date <= period_end,
                    EnvironmentalGoal.end_date >= period_start,
                )
            )
        ).scalar_one()

        actual = float(actual)
        target = float(target)
        if target <= 0:
            # No goals to measure against: nothing to penalize, so default to a
            # perfect environmental score.
            return 100.0
        return _clamp(100.0 - (actual / target * 100.0))

    async def _social_score(
        self, db: AsyncSession, dept_id: UUID, employee_ids: list[UUID], period_start: date, period_end: date
    ) -> float:
        employee_count = len(employee_ids)
        if employee_count == 0:
            return 0.0

        csr_approved = (
            await db.execute(
                select(func.count(func.distinct(EmployeeParticipation.employee_id))).where(
                    EmployeeParticipation.employee_id.in_(employee_ids),
                    EmployeeParticipation.approval_status == ApprovalStatus.approved,
                    EmployeeParticipation.completion_date.is_not(None),
                    EmployeeParticipation.completion_date >= period_start,
                    EmployeeParticipation.completion_date <= period_end,
                )
            )
        ).scalar_one()
        csr_rate = _clamp(csr_approved / employee_count * 100.0)

        challenge_approved = (
            await db.execute(
                select(func.count(func.distinct(ChallengeParticipation.employee_id))).where(
                    ChallengeParticipation.employee_id.in_(employee_ids),
                    ChallengeParticipation.approval_status == ApprovalStatus.approved,
                    ChallengeParticipation.updated_at >= period_start,
                    ChallengeParticipation.updated_at <= period_end + timedelta(days=1),
                )
            )
        ).scalar_one()
        challenge_rate = _clamp(challenge_approved / employee_count * 100.0)

        # Both rates are always computable once there is at least one employee,
        # so we average CSR participation with challenge completion.
        return _clamp((csr_rate + challenge_rate) / 2.0)

    async def _governance_score(self, db: AsyncSession, dept_id: UUID, employee_ids: list[UUID]) -> float:
        if not employee_ids:
            return 0.0

        active_required_policy_ids = (
            (
                await db.execute(
                    select(EsgPolicy.id).where(
                        EsgPolicy.is_active.is_(True),
                        EsgPolicy.acknowledgement_required.is_(True),
                    )
                )
            )
            .scalars()
            .all()
        )
        policy_count = len(active_required_policy_ids)
        employee_count = len(employee_ids)

        if policy_count == 0:
            # Nothing currently requires acknowledgement, so there is nothing to
            # be delinquent on.
            ack_rate = 100.0
        else:
            ack_count = (
                await db.execute(
                    select(func.count()).select_from(PolicyAcknowledgement).where(
                        PolicyAcknowledgement.employee_id.in_(employee_ids),
                        PolicyAcknowledgement.policy_id.in_(active_required_policy_ids),
                    )
                )
            ).scalar_one()
            ack_rate = _clamp(ack_count / (policy_count * employee_count) * 100.0)

        open_statuses = (IssueStatus.open, IssueStatus.in_progress)
        critical_count = (
            await db.execute(
                select(func.count()).select_from(ComplianceIssue).where(
                    ComplianceIssue.owner_id.in_(employee_ids),
                    ComplianceIssue.status.in_(open_statuses),
                    ComplianceIssue.severity == IssueSeverity.critical,
                )
            )
        ).scalar_one()
        high_count = (
            await db.execute(
                select(func.count()).select_from(ComplianceIssue).where(
                    ComplianceIssue.owner_id.in_(employee_ids),
                    ComplianceIssue.status.in_(open_statuses),
                    ComplianceIssue.severity == IssueSeverity.high,
                )
            )
        ).scalar_one()

        issue_penalty = critical_count * 10 + high_count * 5
        return _clamp(ack_rate - issue_penalty)

    async def calculate_department_score(
        self, db: AsyncSession, dept_id: UUID, period_start: date, period_end: date
    ) -> DepartmentScore:
        employee_ids = await self._employee_ids(db, dept_id)

        environmental_score = await self._environmental_score(db, dept_id, period_start, period_end)
        social_score = await self._social_score(db, dept_id, employee_ids, period_start, period_end)
        governance_score = await self._governance_score(db, dept_id, employee_ids)

        env_weight, social_weight, gov_weight = await self._get_weights(db)
        total_score = (
            env_weight / 100.0 * environmental_score
            + social_weight / 100.0 * social_score
            + gov_weight / 100.0 * governance_score
        )

        return await department_score_repository.upsert(
            db,
            department_id=dept_id,
            period_start=period_start,
            period_end=period_end,
            environmental_score=round(environmental_score, 2),
            social_score=round(social_score, 2),
            governance_score=round(governance_score, 2),
            total_score=round(total_score, 2),
        )

    async def calculate_org_score(self, db: AsyncSession) -> float:
        departments = (await db.execute(select(Department))).scalars().all()
        if not departments:
            return 0.0

        weighted_sum = 0.0
        weight_total = 0
        unweighted_scores: list[float] = []
        for dept in departments:
            latest = await department_score_repository.get_latest_for_department(db, dept.id)
            if latest is None:
                continue
            score = float(latest.total_score)
            unweighted_scores.append(score)
            weight = dept.employee_count or 0
            weighted_sum += score * weight
            weight_total += weight

        if weight_total > 0:
            return round(weighted_sum / weight_total, 2)
        if unweighted_scores:
            # No usable employee_count weighting (e.g. all zero): fall back to a
            # simple average of the departments' latest scores.
            return round(sum(unweighted_scores) / len(unweighted_scores), 2)
        return 0.0


score_service = ScoreService()
