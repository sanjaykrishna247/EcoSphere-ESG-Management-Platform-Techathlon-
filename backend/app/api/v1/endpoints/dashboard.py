from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.carbon_transaction import CarbonTransaction
from app.models.challenge import Challenge
from app.models.compliance_issue import ComplianceIssue
from app.models.csr_activity import CsrActivity
from app.models.department_score import DepartmentScore
from app.models.employee_participation import EmployeeParticipation
from app.models.enums import ApprovalStatus, ChallengeStatus, IssueStatus
from app.models.esg_policy import EsgPolicy
from app.models.policy_acknowledgement import PolicyAcknowledgement
from app.schemas.common import SuccessResponse

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/org-overview", response_model=SuccessResponse[dict])
async def org_overview(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    year_start = date(date.today().year, 1, 1)

    total_co2 = (
        await db.execute(
            select(func.coalesce(func.sum(CarbonTransaction.co2_equivalent), 0)).where(
                CarbonTransaction.transaction_date >= year_start, CarbonTransaction.is_deleted.is_(False)
            )
        )
    ).scalar_one()

    active_challenges = (
        await db.execute(
            select(func.count()).select_from(Challenge).where(
                Challenge.status == ChallengeStatus.active, Challenge.is_deleted.is_(False)
            )
        )
    ).scalar_one()

    csr_participants = (
        await db.execute(
            select(func.count(func.distinct(EmployeeParticipation.employee_id))).where(
                EmployeeParticipation.approval_status == ApprovalStatus.approved
            )
        )
    ).scalar_one()

    open_issues = (
        await db.execute(
            select(func.count()).select_from(ComplianceIssue).where(
                ComplianceIssue.status.in_([IssueStatus.open, IssueStatus.in_progress]),
                ComplianceIssue.is_deleted.is_(False),
            )
        )
    ).scalar_one()

    org_score = (
        await db.execute(select(func.avg(DepartmentScore.total_score)))
    ).scalar_one_or_none()

    challenge_status_counts = dict(
        (
            await db.execute(
                select(Challenge.status, func.count()).where(Challenge.is_deleted.is_(False)).group_by(Challenge.status)
            )
        ).all()
    )

    return SuccessResponse(
        data={
            "total_co2_ytd": float(total_co2),
            "active_challenges": active_challenges,
            "csr_participants": csr_participants,
            "open_compliance_issues": open_issues,
            "org_esg_score": float(org_score) if org_score is not None else None,
            "challenge_status_breakdown": {k.value: v for k, v in challenge_status_counts.items()},
        }
    )


@router.get("/environmental", response_model=SuccessResponse[dict])
async def environmental_stats(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    twelve_months_ago = date.today() - timedelta(days=365)
    monthly = (
        await db.execute(
            select(
                func.date_trunc("month", CarbonTransaction.transaction_date).label("month"),
                func.sum(CarbonTransaction.co2_equivalent),
            )
            .where(CarbonTransaction.transaction_date >= twelve_months_ago, CarbonTransaction.is_deleted.is_(False))
            .group_by("month")
            .order_by("month")
        )
    ).all()
    return SuccessResponse(
        data={"monthly_co2_trend": [{"month": str(m), "co2_equivalent": float(v)} for m, v in monthly]}
    )


@router.get("/social", response_model=SuccessResponse[dict])
async def social_stats(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    upcoming_active_csr = (
        await db.execute(
            select(func.count()).select_from(CsrActivity).where(
                CsrActivity.status.in_(["upcoming", "active"]), CsrActivity.is_deleted.is_(False)
            )
        )
    ).scalar_one()
    approved_participations = (
        await db.execute(
            select(func.count()).select_from(EmployeeParticipation).where(
                EmployeeParticipation.approval_status == ApprovalStatus.approved
            )
        )
    ).scalar_one()
    return SuccessResponse(
        data={
            "upcoming_or_active_csr_activities": upcoming_active_csr,
            "approved_participations": approved_participations,
        }
    )


@router.get("/governance", response_model=SuccessResponse[dict])
async def governance_stats(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    required_policies = (
        await db.execute(
            select(func.count()).select_from(EsgPolicy).where(
                EsgPolicy.acknowledgement_required.is_(True), EsgPolicy.is_active.is_(True), EsgPolicy.is_deleted.is_(False)
            )
        )
    ).scalar_one()
    total_acknowledgements = (
        await db.execute(select(func.count()).select_from(PolicyAcknowledgement))
    ).scalar_one()
    open_by_severity = dict(
        (
            await db.execute(
                select(ComplianceIssue.severity, func.count())
                .where(
                    ComplianceIssue.status.in_([IssueStatus.open, IssueStatus.in_progress]),
                    ComplianceIssue.is_deleted.is_(False),
                )
                .group_by(ComplianceIssue.severity)
            )
        ).all()
    )
    return SuccessResponse(
        data={
            "required_active_policies": required_policies,
            "total_policy_acknowledgements": total_acknowledgements,
            "open_issues_by_severity": {k.value: v for k, v in open_by_severity.items()},
        }
    )
