import uuid

from sqlalchemy import Date, ForeignKey, Index, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel
from app.models.enums import IssueSeverity, IssueStatus


class ComplianceIssue(BaseModel):
    __tablename__ = "compliance_issues"
    __table_args__ = (Index("idx_compliance_due", "due_date", "status"),)

    audit_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("audits.id"), nullable=False)
    severity: Mapped[IssueSeverity] = mapped_column(SAEnum(IssueSeverity, name="issue_severity"), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    due_date: Mapped[Date] = mapped_column(Date, nullable=False)
    status: Mapped[IssueStatus] = mapped_column(SAEnum(IssueStatus, name="issue_status"), default=IssueStatus.open)
    resolution_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
