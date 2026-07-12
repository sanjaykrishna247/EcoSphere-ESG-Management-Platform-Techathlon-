import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.repositories.notification import notification_repository
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.schemas.notification import NotificationOut

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/mine", response_model=SuccessResponse[PaginatedResponse[NotificationOut]])
async def list_my_notifications(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = await notification_repository.list_for_user(db, current_user.id, page, per_page)
    return SuccessResponse(
        data=PaginatedResponse(
            items=[NotificationOut.model_validate(i) for i in items],
            total=total,
            page=page,
            per_page=per_page,
            total_pages=(total + per_page - 1) // per_page,
        )
    )


@router.get("/unread-count", response_model=SuccessResponse[int])
async def unread_count(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    count = await notification_repository.unread_count(db, current_user.id)
    return SuccessResponse(data=count)


@router.patch("/{id}/read", response_model=SuccessResponse[NotificationOut])
async def mark_read(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = await notification_repository.get_by_id(db, id, current_user.id)
    if notification is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    notification = await notification_repository.mark_read(db, notification)
    return SuccessResponse(data=NotificationOut.model_validate(notification))


@router.patch("/read-all", response_model=SuccessResponse[None])
async def mark_all_read(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    await notification_repository.mark_all_read(db, current_user.id)
    return SuccessResponse(data=None, message="All notifications marked as read")
