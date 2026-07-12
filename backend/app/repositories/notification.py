import uuid

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification


class NotificationRepository:
    async def list_for_user(
        self, db: AsyncSession, user_id: uuid.UUID, page: int, per_page: int
    ) -> tuple[list[Notification], int]:
        base = select(Notification).where(Notification.recipient_id == user_id)
        total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar_one()
        result = await db.execute(
            base.order_by(Notification.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
        )
        return list(result.scalars().all()), total

    async def unread_count(self, db: AsyncSession, user_id: uuid.UUID) -> int:
        result = await db.execute(
            select(func.count()).select_from(Notification).where(
                Notification.recipient_id == user_id, Notification.is_read.is_(False)
            )
        )
        return result.scalar_one()

    async def get_by_id(self, db: AsyncSession, id: uuid.UUID, user_id: uuid.UUID) -> Notification | None:
        result = await db.execute(
            select(Notification).where(Notification.id == id, Notification.recipient_id == user_id)
        )
        return result.scalar_one_or_none()

    async def mark_read(self, db: AsyncSession, notification: Notification) -> Notification:
        notification.is_read = True
        await db.commit()
        await db.refresh(notification)
        return notification

    async def mark_all_read(self, db: AsyncSession, user_id: uuid.UUID) -> None:
        await db.execute(
            update(Notification)
            .where(Notification.recipient_id == user_id, Notification.is_read.is_(False))
            .values(is_read=True)
        )
        await db.commit()


notification_repository = NotificationRepository()
