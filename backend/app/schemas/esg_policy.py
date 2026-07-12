import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import PolicyCategory


class EsgPolicyCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    content: str = Field(min_length=1)
    category: PolicyCategory
    version: str = Field(default="1.0", max_length=20)
    effective_date: date
    expiry_date: date | None = None
    acknowledgement_required: bool = True
    is_active: bool = True


class EsgPolicyUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    content: str | None = Field(default=None, min_length=1)
    category: PolicyCategory | None = None
    version: str | None = Field(default=None, max_length=20)
    effective_date: date | None = None
    expiry_date: date | None = None
    acknowledgement_required: bool | None = None
    is_active: bool | None = None


class EsgPolicyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    content: str
    category: PolicyCategory
    version: str
    effective_date: date
    expiry_date: date | None
    acknowledgement_required: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime
