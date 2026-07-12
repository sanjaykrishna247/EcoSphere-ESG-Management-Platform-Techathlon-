import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ApprovalStatus


class EmployeeParticipationCreate(BaseModel):
    activity_id: uuid.UUID


class EmployeeParticipationRejectRequest(BaseModel):
    review_notes: str | None = Field(default=None, max_length=2000)


class EmployeeParticipationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    activity_id: uuid.UUID
    proof_url: str | None
    approval_status: ApprovalStatus
    points_earned: int
    completion_date: date | None
    reviewed_by: uuid.UUID | None
    review_notes: str | None
    created_at: datetime
    updated_at: datetime
