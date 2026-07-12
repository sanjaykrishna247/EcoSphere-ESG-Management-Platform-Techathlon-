import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.enums import RewardStatus
from app.repositories.reward import reward_repository
from app.schemas.common import SuccessResponse
from app.schemas.reward import RewardCreate, RewardOut, RewardRedemptionOut, RewardUpdate
from app.services.reward_service import reward_service

router = APIRouter(prefix="/rewards", tags=["rewards"])


@router.get("", response_model=SuccessResponse[list[RewardOut]])
async def list_rewards(
    status_filter: RewardStatus | None = Query(default=None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items = await reward_repository.list(db, status=status_filter)
    return SuccessResponse(data=[RewardOut.model_validate(i) for i in items])


@router.get("/redemptions/mine", response_model=SuccessResponse[list[RewardRedemptionOut]])
async def list_my_redemptions(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items = await reward_repository.list_redemptions_mine(db, current_user.id)
    return SuccessResponse(data=[RewardRedemptionOut.model_validate(i) for i in items])


@router.post("", response_model=SuccessResponse[RewardOut], status_code=status.HTTP_201_CREATED)
async def create_reward(
    data: RewardCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    reward = await reward_repository.create(db, data)
    return SuccessResponse(data=RewardOut.model_validate(reward))


@router.patch("/{id}", response_model=SuccessResponse[RewardOut])
async def update_reward(
    id: uuid.UUID,
    data: RewardUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    reward = await reward_repository.get_by_id(db, id)
    if reward is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reward not found")
    reward = await reward_repository.update(db, reward, data)
    return SuccessResponse(data=RewardOut.model_validate(reward))


@router.delete("/{id}", response_model=SuccessResponse[None])
async def delete_reward(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    reward = await reward_repository.get_by_id(db, id)
    if reward is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reward not found")
    await reward_repository.soft_delete(db, reward)
    return SuccessResponse(data=None, message="Reward deleted")


@router.post("/{id}/redeem", response_model=SuccessResponse[RewardRedemptionOut], status_code=status.HTTP_201_CREATED)
async def redeem_reward(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    redemption = await reward_service.redeem(db, current_user.id, id)
    return SuccessResponse(data=RewardRedemptionOut.model_validate(redemption))
