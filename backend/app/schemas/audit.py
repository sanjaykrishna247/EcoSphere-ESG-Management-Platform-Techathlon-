import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import AuditStatus, AuditType


class AuditCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    auditor_id: uuid.UUID
    department_id: uuid.UUID | None = None
    audit_type: AuditType
    scheduled_date: date
    completed_date: date | None = None
    status: AuditStatus = AuditStatus.scheduled
    findings: str | None = None


class AuditUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    auditor_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    audit_type: AuditType | None = None
    scheduled_date: date | None = None
    completed_date: date | None = None
    status: AuditStatus | None = None
    findings: str | None = None


class AuditOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    auditor_id: uuid.UUID
    department_id: uuid.UUID | None
    audit_type: AuditType
    scheduled_date: date
    completed_date: date | None
    status: AuditStatus
    findings: str | None
    created_at: datetime
    updated_at: datetime
