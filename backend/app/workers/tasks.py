import asyncio
from datetime import date, timedelta

from sqlalchemy import func, select

from app.core.database import AsyncSessionLocal, engine
from app.models.compliance_issue import ComplianceIssue
from app.models.department import Department
from app.models.enums import IssueStatus, NotificationType, UserRole
from app.models.environmental_goal import EnvironmentalGoal
from app.models.esg_policy import EsgPolicy
from app.models.policy_acknowledgement import PolicyAcknowledgement
from app.models.user import User
from app.workers.celery_app import celery_app


async def _check_overdue_compliance_issues() -> None:
    from app.services.notification_service import notification_service

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(ComplianceIssue).where(
                ComplianceIssue.status.in_([IssueStatus.open, IssueStatus.in_progress]),
                ComplianceIssue.due_date < date.today(),
                ComplianceIssue.is_deleted.is_(False),
            )
        )
        overdue_issues = result.scalars().all()

        admin_ids = (
            (await db.execute(select(User.id).where(User.role == UserRole.admin, User.is_active.is_(True))))
            .scalars()
            .all()
        )

        for issue in overdue_issues:
            issue.status = IssueStatus.overdue
        await db.commit()

        for issue in overdue_issues:
            await notification_service.create_and_send(
                db,
                recipient_id=issue.owner_id,
                type=NotificationType.overdue_issue,
                title="Compliance Issue Overdue",
                message=f"Compliance issue '{issue.description[:100]}' is now overdue.",
                reference_type="compliance_issue",
                reference_id=issue.id,
            )
            for admin_id in admin_ids:
                await notification_service.create_and_send(
                    db,
                    recipient_id=admin_id,
                    type=NotificationType.overdue_issue,
                    title="Compliance Issue Overdue",
                    message=f"Compliance issue '{issue.description[:100]}' owned by user {issue.owner_id} is overdue.",
                    reference_type="compliance_issue",
                    reference_id=issue.id,
                )


async def _send_policy_reminders() -> None:
    from app.services.notification_service import notification_service

    async with AsyncSessionLocal() as db:
        policies = (
            (
                await db.execute(
                    select(EsgPolicy).where(
                        EsgPolicy.acknowledgement_required.is_(True),
                        EsgPolicy.is_active.is_(True),
                        EsgPolicy.is_deleted.is_(False),
                    )
                )
            )
            .scalars()
            .all()
        )
        active_users = (
            (await db.execute(select(User.id).where(User.is_active.is_(True), User.is_deleted.is_(False))))
            .scalars()
            .all()
        )

        for policy in policies:
            acknowledged_ids = set(
                (
                    await db.execute(
                        select(PolicyAcknowledgement.employee_id).where(
                            PolicyAcknowledgement.policy_id == policy.id
                        )
                    )
                )
                .scalars()
                .all()
            )
            for user_id in active_users:
                if user_id not in acknowledged_ids:
                    await notification_service.create_and_send(
                        db,
                        recipient_id=user_id,
                        type=NotificationType.policy_reminder,
                        title="Policy Acknowledgement Required",
                        message=f"Please review and acknowledge the policy '{policy.title}'.",
                        reference_type="esg_policy",
                        reference_id=policy.id,
                    )


async def _recalculate_all_department_scores() -> None:
    from app.services.score_service import score_service

    async with AsyncSessionLocal() as db:
        today = date.today()
        period_start = today.replace(day=1)
        next_month = (period_start + timedelta(days=32)).replace(day=1)
        period_end = next_month - timedelta(days=1)

        departments = (
            (await db.execute(select(Department).where(Department.is_deleted.is_(False))))
            .scalars()
            .all()
        )
        for dept in departments:
            await score_service.calculate_department_score(db, dept.id, period_start, period_end)


async def _check_environmental_goals() -> None:
    async with AsyncSessionLocal() as db:
        from app.models.carbon_transaction import CarbonTransaction

        goals = (
            (
                await db.execute(
                    select(EnvironmentalGoal).where(
                        EnvironmentalGoal.status == "active", EnvironmentalGoal.is_deleted.is_(False)
                    )
                )
            )
            .scalars()
            .all()
        )
        for goal in goals:
            stmt = select(func.coalesce(func.sum(CarbonTransaction.co2_equivalent), 0)).where(
                CarbonTransaction.transaction_date >= goal.start_date,
                CarbonTransaction.transaction_date <= goal.end_date,
                CarbonTransaction.is_deleted.is_(False),
            )
            if goal.department_id is not None:
                stmt = stmt.where(CarbonTransaction.department_id == goal.department_id)
            current_value = (await db.execute(stmt)).scalar_one()
            goal.current_value = current_value

            if goal.end_date < date.today():
                goal.status = "completed" if current_value <= goal.target_value else "missed"
        await db.commit()


def _run(coro) -> None:
    # Each Celery task invocation gets its own asyncio.run() event loop, but the
    # SQLAlchemy async engine's connection pool holds asyncpg connections bound to
    # whichever loop created them. Disposing the pool after every run forces fresh,
    # loop-local connections on the next task instead of reusing stale ones tied to
    # an already-closed loop (which raises "attached to a different loop").
    async def runner():
        try:
            await coro
        finally:
            await engine.dispose()

    asyncio.run(runner())


@celery_app.task(name="app.workers.tasks.check_overdue_compliance_issues")
def check_overdue_compliance_issues() -> None:
    _run(_check_overdue_compliance_issues())


@celery_app.task(name="app.workers.tasks.send_policy_reminders")
def send_policy_reminders() -> None:
    _run(_send_policy_reminders())


@celery_app.task(name="app.workers.tasks.recalculate_all_department_scores")
def recalculate_all_department_scores() -> None:
    _run(_recalculate_all_department_scores())


@celery_app.task(name="app.workers.tasks.check_environmental_goals")
def check_environmental_goals() -> None:
    _run(_check_environmental_goals())
