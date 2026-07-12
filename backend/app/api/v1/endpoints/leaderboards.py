import uuid
from datetime import datetime, timedelta, timezone
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.challenge_participation import ChallengeParticipation
from app.models.department import Department
from app.models.department_score import DepartmentScore
from app.models.enums import ActiveStatus, ApprovalStatus
from app.models.user import User
from app.schemas.common import SuccessResponse
from app.schemas.leaderboard import DepartmentLeaderboardEntry, LeaderboardEntry

router = APIRouter(prefix="/leaderboards", tags=["leaderboards"])

_PERIOD_DAYS = {"week": 7, "month": 30}


@router.get("", response_model=SuccessResponse[list[LeaderboardEntry]])
async def get_user_leaderboard(
    period: Literal["week", "month", "all"] = Query(default="all"),
    department_id: uuid.UUID | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if period == "all":
        # Running-total ranking: User.xp_points has no history, so "all time" is the
        # current total.
        stmt = select(User).where(User.is_deleted.is_(False), User.is_active.is_(True))
        if department_id is not None:
            stmt = stmt.where(User.department_id == department_id)
        stmt = stmt.order_by(User.xp_points.desc()).limit(limit)
        users = (await db.execute(stmt)).scalars().all()
        entries = [
            LeaderboardEntry(
                rank=i + 1,
                user_id=u.id,
                full_name=u.full_name,
                avatar_url=u.avatar_url,
                department_id=u.department_id,
                xp=u.xp_points,
            )
            for i, u in enumerate(users)
        ]
        return SuccessResponse(data=entries)

    # week/month: approximate "XP earned in period" by summing xp_awarded from
    # challenge participations approved (updated_at bumped) within the window,
    # since there is no dedicated XP ledger/history table.
    window_start = datetime.now(timezone.utc) - timedelta(days=_PERIOD_DAYS[period])
    stmt = (
        select(
            User.id,
            User.full_name,
            User.avatar_url,
            User.department_id,
            func.coalesce(func.sum(ChallengeParticipation.xp_awarded), 0).label("xp"),
        )
        .join(ChallengeParticipation, ChallengeParticipation.employee_id == User.id)
        .where(
            ChallengeParticipation.approval_status == ApprovalStatus.approved,
            ChallengeParticipation.updated_at >= window_start,
            User.is_deleted.is_(False),
            User.is_active.is_(True),
        )
    )
    if department_id is not None:
        stmt = stmt.where(User.department_id == department_id)
    stmt = (
        stmt.group_by(User.id, User.full_name, User.avatar_url, User.department_id)
        .order_by(func.coalesce(func.sum(ChallengeParticipation.xp_awarded), 0).desc())
        .limit(limit)
    )
    rows = (await db.execute(stmt)).all()
    entries = [
        LeaderboardEntry(
            rank=i + 1,
            user_id=row.id,
            full_name=row.full_name,
            avatar_url=row.avatar_url,
            department_id=row.department_id,
            xp=int(row.xp),
        )
        for i, row in enumerate(rows)
    ]
    return SuccessResponse(data=entries)


@router.get("/departments", response_model=SuccessResponse[list[DepartmentLeaderboardEntry]])
async def get_department_leaderboard(
    limit: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    departments = (
        (
            await db.execute(
                select(Department).where(Department.status == ActiveStatus.active)
            )
        )
        .scalars()
        .all()
    )

    scores: dict[uuid.UUID, float] = {}
    for dept in departments:
        latest = (
            await db.execute(
                select(DepartmentScore)
                .where(DepartmentScore.department_id == dept.id)
                .order_by(DepartmentScore.period_end.desc())
                .limit(1)
            )
        ).scalar_one_or_none()
        if latest is not None:
            scores[dept.id] = float(latest.total_score)
        else:
            # No computed score yet for this department: fall back to summed
            # member XP as a rough proxy so it still appears on the board.
            xp_sum = (
                await db.execute(
                    select(func.coalesce(func.sum(User.xp_points), 0)).where(
                        User.department_id == dept.id, User.is_deleted.is_(False)
                    )
                )
            ).scalar_one()
            scores[dept.id] = float(xp_sum)

    ranked = sorted(departments, key=lambda d: scores.get(d.id, 0), reverse=True)[:limit]
    entries = [
        DepartmentLeaderboardEntry(
            rank=i + 1,
            department_id=d.id,
            name=d.name,
            code=d.code,
            score=scores.get(d.id, 0.0),
        )
        for i, d in enumerate(ranked)
    ]
    return SuccessResponse(data=entries)
