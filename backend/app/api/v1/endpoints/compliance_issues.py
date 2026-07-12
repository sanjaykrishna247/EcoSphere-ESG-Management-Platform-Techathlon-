import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.enums import IssueSeverity, IssueStatus, NotificationType
from app.repositories.compliance_issue import compliance_issue_repository
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.schemas.compliance_issue import ComplianceIssueCreate, ComplianceIssueOut, ComplianceIssueUpdate
from app.services.notification_service import notification_service

router = APIRouter(prefix="/compliance-issues", tags=["compliance-issues"])


@router.get("", response_model=SuccessResponse[PaginatedResponse[ComplianceIssueOut]])
async def list_compliance_issues(
    severity: IssueSeverity | None = Query(default=None),
    status_: IssueStatus | None = Query(default=None, alias="status"),
    audit_id: uuid.UUID | None = Query(default=None),
    overdue: bool = Query(default=False),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items, total = await compliance_issue_repository.list(
        db, page, per_page, severity, status_, audit_id, overdue
    )
    return SuccessResponse(
        data=PaginatedResponse(
            items=[ComplianceIssueOut.model_validate(i) for i in items],
            total=total,
            page=page,
            per_page=per_page,
            total_pages=(total + per_page - 1) // per_page,
        )
    )


@router.post("", response_model=SuccessResponse[ComplianceIssueOut], status_code=status.HTTP_201_CREATED)
async def create_compliance_issue(
    data: ComplianceIssueCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    issue = await compliance_issue_repository.create(db, data)
    await notification_service.create_and_send(
        db,
        recipient_id=issue.owner_id,
        type=NotificationType.compliance_issue,
        title="New compliance issue assigned",
        message=f"You have been assigned a new compliance issue (severity: {issue.severity.value}), due {issue.due_date}.",
        reference_type="compliance_issue",
        reference_id=issue.id,
    )
    return SuccessResponse(data=ComplianceIssueOut.model_validate(issue))


@router.get("/{id}", response_model=SuccessResponse[ComplianceIssueOut])
async def get_compliance_issue(
    id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)
):
    issue = await compliance_issue_repository.get_by_id(db, id)
    if issue is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Compliance issue not found")
    return SuccessResponse(data=ComplianceIssueOut.model_validate(issue))


@router.patch("/{id}", response_model=SuccessResponse[ComplianceIssueOut])
async def update_compliance_issue(
    id: uuid.UUID,
    data: ComplianceIssueUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    issue = await compliance_issue_repository.get_by_id(db, id)
    if issue is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Compliance issue not found")
    issue = await compliance_issue_repository.update(db, issue, data)
    return SuccessResponse(data=ComplianceIssueOut.model_validate(issue))


@router.delete("/{id}", response_model=SuccessResponse[None])
async def delete_compliance_issue(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    issue = await compliance_issue_repository.get_by_id(db, id)
    if issue is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Compliance issue not found")
    await compliance_issue_repository.soft_delete(db, issue)
    return SuccessResponse(data=None, message="Compliance issue deleted")
