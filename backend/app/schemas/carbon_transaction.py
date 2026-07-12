import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import EmissionScope, TransactionSourceType


class CarbonTransactionCreate(BaseModel):
    emission_factor_id: uuid.UUID
    department_id: uuid.UUID
    quantity: Decimal = Field(gt=0, max_digits=12, decimal_places=4)
    transaction_date: date = Field(le=date.today())
    notes: str | None = Field(default=None, max_length=1000)


class CarbonTransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    source_type: TransactionSourceType
    source_ref_id: uuid.UUID | None
    emission_factor_id: uuid.UUID
    department_id: uuid.UUID
    quantity: Decimal
    co2_equivalent: Decimal
    transaction_date: date
    is_auto_calculated: bool
    notes: str | None
    created_by: uuid.UUID | None
    created_at: datetime


class CarbonTransactionScopeBreakdown(BaseModel):
    scope: EmissionScope
    total_co2: Decimal


class CarbonTransactionDepartmentBreakdown(BaseModel):
    department_id: uuid.UUID
    total_co2: Decimal


class CarbonTransactionSummary(BaseModel):
    total_co2: Decimal
    by_scope: list[CarbonTransactionScopeBreakdown]
    by_department: list[CarbonTransactionDepartmentBreakdown]


class CarbonTransactionTrendPoint(BaseModel):
    period: str
    total_co2: Decimal
