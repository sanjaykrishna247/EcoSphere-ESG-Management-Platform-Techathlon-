import uuid

from sqlalchemy import Date, ForeignKey, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel
from app.models.enums import AuditStatus, AuditType


class Audit(BaseModel):
    __tablename__ = "audits"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    auditor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    department_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True
    )
    audit_type: Mapped[AuditType] = mapped_column(SAEnum(AuditType, name="audit_type"), nullable=False)
    scheduled_date: Mapped[Date] = mapped_column(Date, nullable=False)
    completed_date: Mapped[Date | None] = mapped_column(Date, nullable=True)
    status: Mapped[AuditStatus] = mapped_column(
        SAEnum(AuditStatus, name="audit_status"), default=AuditStatus.scheduled
    )
    findings: Mapped[str | None] = mapped_column(Text, nullable=True)
