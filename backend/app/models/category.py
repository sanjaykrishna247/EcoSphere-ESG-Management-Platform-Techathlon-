from sqlalchemy import String
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel
from app.models.enums import ActiveStatus, CategoryType


class Category(BaseModel):
    __tablename__ = "categories"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[CategoryType] = mapped_column(SAEnum(CategoryType, name="category_type"), nullable=False)
    status: Mapped[ActiveStatus] = mapped_column(
        SAEnum(ActiveStatus, name="category_status"), default=ActiveStatus.active
    )
