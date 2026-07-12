import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import RedemptionStatus, RewardStatus


class RewardCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    description: str | None = None
    points_required: int = Field(ge=1)
    stock: int = Field(ge=0, default=0)
    status: RewardStatus = RewardStatus.active
    image_url: str | None = None


class RewardUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = None
    points_required: int | None = Field(default=None, ge=1)
    stock: int | None = Field(default=None, ge=0)
    status: RewardStatus | None = None
    image_url: str | None = None


class RewardOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None
    points_required: int
    stock: int
    status: RewardStatus
    image_url: str | None
    created_at: datetime
    updated_at: datetime


class RewardRedemptionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    reward_id: uuid.UUID
    points_spent: int
    status: RedemptionStatus
    redeemed_at: datetime
    notes: str | None
