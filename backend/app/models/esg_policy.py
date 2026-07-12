from sqlalchemy import Boolean, Date, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel
from app.models.enums import PolicyCategory


class EsgPolicy(BaseModel):
    __tablename__ = "esg_policies"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[PolicyCategory] = mapped_column(SAEnum(PolicyCategory, name="policy_category"), nullable=False)
    version: Mapped[str] = mapped_column(String(20), nullable=False, default="1.0")
    effective_date: Mapped[Date] = mapped_column(Date, nullable=False)
    expiry_date: Mapped[Date | None] = mapped_column(Date, nullable=True)
    acknowledgement_required: Mapped[bool] = mapped_column(Boolean, default=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
