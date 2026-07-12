from __future__ import annotations

import uuid
from datetime import date

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.compliance_issue import ComplianceIssue
from app.models.enums import IssueSeverity, IssueStatus
from app.schemas.compliance_issue import ComplianceIssueCreate, ComplianceIssueUpdate


class ComplianceIssueRepository:
    async def list(
        self,
        db: AsyncSession,
        page: int,
        per_page: int,
        severity: IssueSeverity | None = None,
        status: IssueStatus | None = None,
        audit_id: uuid.UUID | None = None,
        overdue: bool = False,
    ) -> tuple[list[ComplianceIssue], int]:
        base = select(ComplianceIssue).where(ComplianceIssue.is_deleted.is_(False))
        if severity is not None:
            base = base.where(ComplianceIssue.severity == severity)
        if status is not None:
            base = base.where(ComplianceIssue.status == status)
        if audit_id is not None:
            base = base.where(ComplianceIssue.audit_id == audit_id)
        if overdue:
            base = base.where(
                ComplianceIssue.status.in_([IssueStatus.open, IssueStatus.in_progress]),
                ComplianceIssue.due_date < date.today(),
            )
        total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar_one()
        result = await db.execute(
            base.order_by(ComplianceIssue.due_date.asc()).offset((page - 1) * per_page).limit(per_page)
        )
        return list(result.scalars().all()), total

    async def get_by_id(self, db: AsyncSession, id: uuid.UUID) -> ComplianceIssue | None:
        result = await db.execute(
            select(ComplianceIssue).where(ComplianceIssue.id == id, ComplianceIssue.is_deleted.is_(False))
        )
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, data: ComplianceIssueCreate) -> ComplianceIssue:
        issue = ComplianceIssue(**data.model_dump())
        db.add(issue)
        await db.commit()
        await db.refresh(issue)
        return issue

    async def update(self, db: AsyncSession, issue: ComplianceIssue, data: ComplianceIssueUpdate) -> ComplianceIssue:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(issue, field, value)
        await db.commit()
        await db.refresh(issue)
        return issue

    async def soft_delete(self, db: AsyncSession, issue: ComplianceIssue) -> None:
        issue.is_deleted = True
        await db.commit()


compliance_issue_repository = ComplianceIssueRepository()
