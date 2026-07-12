import uuid
from datetime import datetime

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class DepartmentScore(Base):
    __tablename__ = "department_scores"
    __table_args__ = (
        UniqueConstraint("department_id", "period_start", "period_end", name="uq_department_period"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    department_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("departments.id"), nullable=False
    )
    period_start: Mapped[Date] = mapped_column(Date, nullable=False)
    period_end: Mapped[Date] = mapped_column(Date, nullable=False)
    environmental_score: Mapped[float] = mapped_column(Numeric(6, 2), default=0)
    social_score: Mapped[float] = mapped_column(Numeric(6, 2), default=0)
    governance_score: Mapped[float] = mapped_column(Numeric(6, 2), default=0)
    total_score: Mapped[float] = mapped_column(Numeric(6, 2), default=0)
    computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
