import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import EmissionScope, SourceType


class EmissionFactorCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    source_type: SourceType
    unit: str = Field(min_length=1, max_length=50)
    co2_per_unit: Decimal = Field(gt=0, max_digits=12, decimal_places=6)
    scope: EmissionScope
    description: str | None = Field(default=None, max_length=1000)
    is_active: bool = True


class EmissionFactorUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    unit: str | None = Field(default=None, min_length=1, max_length=50)
    co2_per_unit: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=6)
    scope: EmissionScope | None = None
    description: str | None = Field(default=None, max_length=1000)
    is_active: bool | None = None


class EmissionFactorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    source_type: SourceType
    unit: str
    co2_per_unit: Decimal
    scope: EmissionScope
    description: str | None
    is_active: bool
    created_at: datetime
