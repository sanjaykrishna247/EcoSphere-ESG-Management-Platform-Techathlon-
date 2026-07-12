import uuid

from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel
from app.models.enums import CsrActivityStatus


class CsrActivity(BaseModel):
    __tablename__ = "csr_activities"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True
    )
    department_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True
    )
    start_date: Mapped[Date] = mapped_column(Date, nullable=False)
    end_date: Mapped[Date | None] = mapped_column(Date, nullable=True)
    points_value: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    max_participants: Mapped[int | None] = mapped_column(Integer, nullable=True)
    evidence_required: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[CsrActivityStatus] = mapped_column(
        SAEnum(CsrActivityStatus, name="csr_activity_status"), default=CsrActivityStatus.upcoming
    )
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
