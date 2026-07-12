import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ActiveStatus


class DepartmentCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    code: str = Field(min_length=2, max_length=50, pattern=r"^[A-Z0-9_]+$")
    head_user_id: uuid.UUID | None = None
    parent_id: uuid.UUID | None = None
    employee_count: int = Field(ge=0, default=0)
    status: ActiveStatus = ActiveStatus.active


class DepartmentUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    head_user_id: uuid.UUID | None = None
    parent_id: uuid.UUID | None = None
    employee_count: int | None = Field(default=None, ge=0)
    status: ActiveStatus | None = None


class DepartmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    code: str
    head_user_id: uuid.UUID | None
    parent_id: uuid.UUID | None
    employee_count: int
    status: ActiveStatus
    created_at: datetime
    updated_at: datetime
