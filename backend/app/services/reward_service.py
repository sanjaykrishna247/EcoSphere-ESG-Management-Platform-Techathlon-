import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import NotificationType, RedemptionStatus, RewardStatus
from app.models.reward import Reward
from app.models.reward_redemption import RewardRedemption
from app.models.user import User
from app.services.notification_service import notification_service


class RewardService:
    async def redeem(self, db: AsyncSession, user_id: uuid.UUID, reward_id: uuid.UUID) -> RewardRedemption:
        # Lock the reward row first to serialize concurrent redemptions of the same reward.
        reward_result = await db.execute(select(Reward).where(Reward.id == reward_id).with_for_update())
        reward = reward_result.scalar_one_or_none()
        if reward is None or reward.is_deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reward not found")

        if reward.status != RewardStatus.active:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reward is not available for redemption")
        if reward.stock <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reward is out of stock")

        # Lock the user row to avoid lost updates on total_points under concurrency.
        user_result = await db.execute(select(User).where(User.id == user_id).with_for_update())
        user = user_result.scalar_one_or_none()
        if user is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        if user.total_points < reward.points_required:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient points to redeem this reward")

        user.total_points -= reward.points_required
        reward.stock -= 1
        if reward.stock == 0:
            reward.status = RewardStatus.out_of_stock

        redemption = RewardRedemption(
            employee_id=user_id,
            reward_id=reward_id,
            points_spent=reward.points_required,
            status=RedemptionStatus.pending,
        )
        db.add(redemption)
        await db.commit()
        await db.refresh(redemption)

        await notification_service.create_and_send(
            db,
            recipient_id=user_id,
            type=NotificationType.reward_redeemed,
            title="Reward Redeemed",
            message=f"You redeemed '{reward.name}' for {reward.points_required} points.",
            reference_type="reward",
            reference_id=reward.id,
        )
        return redemption


reward_service = RewardService()
