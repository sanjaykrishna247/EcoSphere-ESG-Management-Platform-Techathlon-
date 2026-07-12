import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import IssueSeverity, IssueStatus


class ComplianceIssueCreate(BaseModel):
    audit_id: uuid.UUID
    severity: IssueSeverity
    description: str = Field(min_length=1)
    # owner_id and due_date are NEVER nullable - required, no defaults.
    owner_id: uuid.UUID
    due_date: date
    status: IssueStatus = IssueStatus.open
    resolution_notes: str | None = None


class ComplianceIssueUpdate(BaseModel):
    severity: IssueSeverity | None = None
    status: IssueStatus | None = None
    resolution_notes: str | None = None
    owner_id: uuid.UUID | None = None
    due_date: date | None = None


class ComplianceIssueOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    audit_id: uuid.UUID
    severity: IssueSeverity
    description: str
    owner_id: uuid.UUID
    due_date: date
    status: IssueStatus
    resolution_notes: str | None
    created_at: datetime
    updated_at: datetime
