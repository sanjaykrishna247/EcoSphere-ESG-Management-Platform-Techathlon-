import uuid
from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.enums import GoalStatus


class EnvironmentalGoalCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    target_value: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    current_value: Decimal = Field(default=Decimal("0"), ge=0, max_digits=12, decimal_places=2)
    unit: str = Field(min_length=1, max_length=50)
    start_date: date
    end_date: date
    department_id: uuid.UUID | None = None
    status: GoalStatus = GoalStatus.active

    @model_validator(mode="after")
    def _check_dates(self) -> "EnvironmentalGoalCreate":
        if self.end_date < self.start_date:
            raise ValueError("end_date must not be before start_date")
        return self


class EnvironmentalGoalUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    target_value: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    current_value: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    unit: str | None = Field(default=None, min_length=1, max_length=50)
    start_date: date | None = None
    end_date: date | None = None
    department_id: uuid.UUID | None = None
    status: GoalStatus | None = None


class EnvironmentalGoalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    target_value: Decimal
    current_value: Decimal
    unit: str
    start_date: date
    end_date: date
    department_id: uuid.UUID | None
    status: GoalStatus
