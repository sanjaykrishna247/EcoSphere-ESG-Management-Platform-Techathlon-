from sqlalchemy import Integer, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel
from app.models.enums import RewardStatus


class Reward(BaseModel):
    __tablename__ = "rewards"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    points_required: Mapped[int] = mapped_column(Integer, nullable=False)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[RewardStatus] = mapped_column(SAEnum(RewardStatus, name="reward_status"), default=RewardStatus.active)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
