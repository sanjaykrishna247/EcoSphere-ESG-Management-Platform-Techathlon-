import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, model_validator


class EsgConfigurationUpdate(BaseModel):
    org_name: str | None = None
    environmental_weight: Decimal | None = None
    social_weight: Decimal | None = None
    governance_weight: Decimal | None = None
    auto_emission_calculation: bool | None = None
    evidence_requirement: bool | None = None
    badge_auto_award: bool | None = None
    notification_in_app: bool | None = None
    notification_email: bool | None = None

    @model_validator(mode="after")
    def weights_sum_to_100(self):
        weights = [self.environmental_weight, self.social_weight, self.governance_weight]
        if any(w is not None for w in weights):
            if any(w is None for w in weights):
                raise ValueError(
                    "environmental_weight, social_weight, and governance_weight must all be provided together"
                )
            if abs(sum(weights) - 100) > Decimal("0.01"):
                raise ValueError("environmental_weight + social_weight + governance_weight must sum to 100")
        return self


class EsgConfigurationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    org_name: str
    environmental_weight: Decimal
    social_weight: Decimal
    governance_weight: Decimal
    auto_emission_calculation: bool
    evidence_requirement: bool
    badge_auto_award: bool
    notification_in_app: bool
    notification_email: bool
    updated_at: datetime
