import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ApprovalStatus


class ChallengeParticipationCreate(BaseModel):
    challenge_id: uuid.UUID


class ChallengeParticipationSubmit(BaseModel):
    progress: int = Field(default=100, ge=0, le=100)
    proof_url: str | None = None


class ChallengeParticipationRejectRequest(BaseModel):
    review_notes: str | None = Field(default=None, max_length=2000)


class ChallengeParticipationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    challenge_id: uuid.UUID
    employee_id: uuid.UUID
    progress: int
    proof_url: str | None
    approval_status: ApprovalStatus
    xp_awarded: int
    submitted_at: datetime | None
    reviewed_by: uuid.UUID | None
    created_at: datetime
    updated_at: datetime
