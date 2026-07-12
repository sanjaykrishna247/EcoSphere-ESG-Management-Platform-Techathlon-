import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PolicyAcknowledgementOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    policy_id: uuid.UUID
    employee_id: uuid.UUID
    acknowledged_at: datetime
    ip_address: str | None
