import uuid

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel
from app.models.enums import ActiveStatus


class Department(BaseModel):
    __tablename__ = "departments"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    head_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", use_alter=True, name="fk_departments_head_user_id_users"),
        nullable=True,
    )
    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True
    )
    employee_count: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[ActiveStatus] = mapped_column(
        SAEnum(ActiveStatus, name="department_status"), default=ActiveStatus.active
    )
