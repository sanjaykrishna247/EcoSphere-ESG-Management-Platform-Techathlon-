import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class DepartmentScoreRecalculateRequest(BaseModel):
    department_id: uuid.UUID | None = None
    period_start: date | None = None
    period_end: date | None = None


class DepartmentScoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    department_id: uuid.UUID
    period_start: date
    period_end: date
    environmental_score: float = Field(...)
    social_score: float
    governance_score: float
    total_score: float
    computed_at: datetime
