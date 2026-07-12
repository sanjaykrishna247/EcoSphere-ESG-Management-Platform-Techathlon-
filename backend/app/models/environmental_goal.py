import uuid

from sqlalchemy import Date, ForeignKey, Numeric, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel
from app.models.enums import GoalStatus


class EnvironmentalGoal(BaseModel):
    __tablename__ = "environmental_goals"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_value: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    current_value: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    start_date: Mapped[Date] = mapped_column(Date, nullable=False)
    end_date: Mapped[Date] = mapped_column(Date, nullable=False)
    department_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True
    )
    status: Mapped[GoalStatus] = mapped_column(SAEnum(GoalStatus, name="goal_status"), default=GoalStatus.active)
