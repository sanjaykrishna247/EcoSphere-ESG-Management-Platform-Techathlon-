import uuid
from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.enums import ChallengeDifficulty, ChallengeStatus


class ChallengeCreate(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    category_id: uuid.UUID | None = None
    description: str | None = None
    xp_reward: int = Field(ge=1, le=10000)
    difficulty: ChallengeDifficulty
    evidence_required: bool = True
    deadline: datetime

    @model_validator(mode="after")
    def check_deadline(self) -> "ChallengeCreate":
        deadline = self.deadline
        if deadline.tzinfo is None:
            deadline = deadline.replace(tzinfo=timezone.utc)
        if deadline <= datetime.now(timezone.utc):
            raise ValueError("deadline must be in the future")
        return self


class ChallengeUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=255)
    category_id: uuid.UUID | None = None
    description: str | None = None
    xp_reward: int | None = Field(default=None, ge=1, le=10000)
    difficulty: ChallengeDifficulty | None = None
    evidence_required: bool | None = None
    deadline: datetime | None = None

    @model_validator(mode="after")
    def check_deadline(self) -> "ChallengeUpdate":
        if self.deadline is not None:
            deadline = self.deadline
            if deadline.tzinfo is None:
                deadline = deadline.replace(tzinfo=timezone.utc)
            if deadline <= datetime.now(timezone.utc):
                raise ValueError("deadline must be in the future")
        return self


class ChallengeStatusUpdate(BaseModel):
    status: ChallengeStatus


class ChallengeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    category_id: uuid.UUID | None
    description: str | None
    xp_reward: int
    difficulty: ChallengeDifficulty
    evidence_required: bool
    deadline: datetime
    status: ChallengeStatus
    created_by: uuid.UUID | None
    created_at: datetime
    updated_at: datetime
