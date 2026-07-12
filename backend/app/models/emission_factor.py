from sqlalchemy import Boolean, Numeric, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.enums import EmissionScope, SourceType
import uuid
from datetime import datetime
from sqlalchemy import DateTime, func
from sqlalchemy.dialects.postgresql import UUID


class EmissionFactor(Base):
    __tablename__ = "emission_factors"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    source_type: Mapped[SourceType] = mapped_column(SAEnum(SourceType, name="emission_source_type"), nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    co2_per_unit: Mapped[float] = mapped_column(Numeric(12, 6), nullable=False)
    scope: Mapped[EmissionScope] = mapped_column(SAEnum(EmissionScope, name="emission_scope"), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
