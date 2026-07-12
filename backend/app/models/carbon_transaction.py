import uuid

from sqlalchemy import Boolean, Date, ForeignKey, Index, Numeric, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel
from app.models.enums import TransactionSourceType


class CarbonTransaction(BaseModel):
    __tablename__ = "carbon_transactions"
    __table_args__ = (
        Index("idx_carbon_txn_dept_date", "department_id", "transaction_date"),
        Index("idx_carbon_txn_date", "transaction_date"),
    )

    source_type: Mapped[TransactionSourceType] = mapped_column(
        SAEnum(TransactionSourceType, name="txn_source_type"), nullable=False
    )
    source_ref_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    emission_factor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("emission_factors.id"), nullable=False
    )
    department_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("departments.id"), nullable=False
    )
    quantity: Mapped[float] = mapped_column(Numeric(12, 4), nullable=False)
    co2_equivalent: Mapped[float] = mapped_column(Numeric(12, 4), nullable=False)
    transaction_date: Mapped[Date] = mapped_column(Date, nullable=False)
    is_auto_calculated: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
