import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BadgeCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    description: str | None = None
    icon: str | None = Field(default=None, max_length=500)
    unlock_rule: dict
    is_active: bool = True


class BadgeUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = None
    icon: str | None = Field(default=None, max_length=500)
    unlock_rule: dict | None = None
    is_active: bool | None = None


class BadgeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None
    icon: str | None
    unlock_rule: dict
    is_active: bool
    created_at: datetime
    updated_at: datetime


class EmployeeBadgeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    badge_id: uuid.UUID
    name: str
    description: str | None
    icon: str | None
    awarded_at: datetime
