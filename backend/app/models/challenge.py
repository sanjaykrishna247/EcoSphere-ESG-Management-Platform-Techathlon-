import uuid

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel
from app.models.enums import ChallengeDifficulty, ChallengeStatus


class Challenge(BaseModel):
    __tablename__ = "challenges"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    xp_reward: Mapped[int] = mapped_column(Integer, nullable=False)
    difficulty: Mapped[ChallengeDifficulty] = mapped_column(
        SAEnum(ChallengeDifficulty, name="challenge_difficulty"), nullable=False
    )
    evidence_required: Mapped[bool] = mapped_column(Boolean, default=True)
    deadline: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[ChallengeStatus] = mapped_column(
        SAEnum(ChallengeStatus, name="challenge_status"), default=ChallengeStatus.draft
    )
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
