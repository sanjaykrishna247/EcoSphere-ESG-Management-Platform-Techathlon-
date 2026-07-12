import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ActiveStatus, CategoryType


class CategoryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    type: CategoryType
    status: ActiveStatus = ActiveStatus.active


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    status: ActiveStatus | None = None


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    type: CategoryType
    status: ActiveStatus
    created_at: datetime
