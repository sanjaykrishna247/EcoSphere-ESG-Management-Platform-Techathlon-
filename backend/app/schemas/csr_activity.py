import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import CsrActivityStatus


class CsrActivityCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    description: str | None = None
    category_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    start_date: date
    end_date: date | None = None
    points_value: int = Field(ge=0, default=10)
    max_participants: int | None = Field(default=None, ge=1)
    evidence_required: bool = False
    status: CsrActivityStatus = CsrActivityStatus.upcoming


class CsrActivityUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = None
    category_id: uuid.UUID | None = None
    department_id: uuid.UUID | None = None
    start_date: date | None = None
    end_date: date | None = None
    points_value: int | None = Field(default=None, ge=0)
    max_participants: int | None = Field(default=None, ge=1)
    evidence_required: bool | None = None
    status: CsrActivityStatus | None = None


class CsrActivityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    category_id: uuid.UUID | None
    department_id: uuid.UUID | None
    start_date: date
    end_date: date | None
    points_value: int
    max_participants: int | None
    evidence_required: bool
    status: CsrActivityStatus
    created_by: uuid.UUID | None
    created_at: datetime
    updated_at: datetime


class CsrActivityParticipantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    employee_name: str
    activity_id: uuid.UUID
    proof_url: str | None
    approval_status: str
    points_earned: int
    completion_date: date | None
    created_at: datetime
