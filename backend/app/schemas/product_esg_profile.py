import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import SustainabilityRating


class ProductEsgProfileCreate(BaseModel):
    product_name: str = Field(min_length=2, max_length=255)
    product_code: str = Field(min_length=1, max_length=100)
    emission_factor_id: uuid.UUID | None = None
    recyclability_pct: Decimal | None = Field(default=None, ge=0, le=100, max_digits=5, decimal_places=2)
    sustainability_rating: SustainabilityRating | None = None
    notes: str | None = Field(default=None, max_length=2000)


class ProductEsgProfileUpdate(BaseModel):
    product_name: str | None = Field(default=None, min_length=2, max_length=255)
    product_code: str | None = Field(default=None, min_length=1, max_length=100)
    emission_factor_id: uuid.UUID | None = None
    recyclability_pct: Decimal | None = Field(default=None, ge=0, le=100, max_digits=5, decimal_places=2)
    sustainability_rating: SustainabilityRating | None = None
    notes: str | None = Field(default=None, max_length=2000)


class ProductEsgProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    product_name: str
    product_code: str
    emission_factor_id: uuid.UUID | None
    recyclability_pct: Decimal | None
    sustainability_rating: SustainabilityRating | None
    notes: str | None
    created_at: datetime
    updated_at: datetime
