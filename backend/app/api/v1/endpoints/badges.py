import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.repositories.badge import badge_repository
from app.schemas.badge import BadgeCreate, BadgeOut, BadgeUpdate, EmployeeBadgeOut
from app.schemas.common import SuccessResponse

router = APIRouter(prefix="/badges", tags=["badges"])


@router.get("", response_model=SuccessResponse[list[BadgeOut]])
async def list_badges(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items = await badge_repository.list(db, is_active=True)
    return SuccessResponse(data=[BadgeOut.model_validate(i) for i in items])


@router.get("/mine", response_model=SuccessResponse[list[EmployeeBadgeOut]])
async def list_my_badges(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    rows = await badge_repository.list_mine(db, current_user.id)
    return SuccessResponse(data=[EmployeeBadgeOut.model_validate(r) for r in rows])


@router.post("", response_model=SuccessResponse[BadgeOut], status_code=status.HTTP_201_CREATED)
async def create_badge(
    data: BadgeCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    badge = await badge_repository.create(db, data)
    return SuccessResponse(data=BadgeOut.model_validate(badge))


@router.patch("/{id}", response_model=SuccessResponse[BadgeOut])
async def update_badge(
    id: uuid.UUID,
    data: BadgeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    badge = await badge_repository.get_by_id(db, id)
    if badge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Badge not found")
    badge = await badge_repository.update(db, badge, data)
    return SuccessResponse(data=BadgeOut.model_validate(badge))


@router.delete("/{id}", response_model=SuccessResponse[None])
async def delete_badge(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    badge = await badge_repository.get_by_id(db, id)
    if badge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Badge not found")
    # Badges have no is_deleted column; DELETE deactivates so previously-awarded
    # EmployeeBadge rows (and their FK) remain intact and it disappears from
    # the active-only listing / future auto-award checks.
    await badge_repository.deactivate(db, badge)
    return SuccessResponse(data=None, message="Badge deactivated")
