import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.esg_configuration import EsgConfiguration
from app.models.notification import Notification
from app.models.enums import NotificationType
from app.websocket.manager import ws_manager


class NotificationService:
    async def _in_app_enabled(self, db: AsyncSession) -> bool:
        result = await db.execute(select(EsgConfiguration).limit(1))
        config = result.scalar_one_or_none()
        return config is None or config.notification_in_app

    async def create_and_send(
        self,
        db: AsyncSession,
        recipient_id: uuid.UUID,
        type: NotificationType,
        title: str,
        message: str,
        reference_type: str | None = None,
        reference_id: uuid.UUID | None = None,
    ) -> Notification:
        notification = Notification(
            recipient_id=recipient_id,
            type=type,
            title=title,
            message=message,
            reference_type=reference_type,
            reference_id=reference_id,
        )
        db.add(notification)
        await db.commit()
        await db.refresh(notification)

        if await self._in_app_enabled(db):
            await ws_manager.broadcast(
                str(recipient_id),
                {
                    "type": type.value,
                    "id": str(notification.id),
                    "title": title,
                    "message": message,
                    "reference_type": reference_type,
                    "reference_id": str(reference_id) if reference_id else None,
                },
            )
        return notification


notification_service = NotificationService()
