import uuid
from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class EsgConfiguration(Base):
    __tablename__ = "esg_configurations"
    __table_args__ = (
        CheckConstraint(
            "ABS((environmental_weight + social_weight + governance_weight) - 100) < 0.01",
            name="chk_weights_sum",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_name: Mapped[str] = mapped_column(String(255), nullable=False)
    environmental_weight: Mapped[float] = mapped_column(Numeric(5, 2), default=40.00)
    social_weight: Mapped[float] = mapped_column(Numeric(5, 2), default=30.00)
    governance_weight: Mapped[float] = mapped_column(Numeric(5, 2), default=30.00)
    auto_emission_calculation: Mapped[bool] = mapped_column(Boolean, default=True)
    evidence_requirement: Mapped[bool] = mapped_column(Boolean, default=True)
    badge_auto_award: Mapped[bool] = mapped_column(Boolean, default=True)
    notification_in_app: Mapped[bool] = mapped_column(Boolean, default=True)
    notification_email: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
