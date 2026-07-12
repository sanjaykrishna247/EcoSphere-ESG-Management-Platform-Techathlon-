import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.enums import GoalStatus
from app.repositories.environmental_goal import environmental_goal_repository
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.schemas.environmental_goal import (
    EnvironmentalGoalCreate,
    EnvironmentalGoalOut,
    EnvironmentalGoalUpdate,
)

router = APIRouter(prefix="/environmental-goals", tags=["environmental-goals"])


@router.get("", response_model=SuccessResponse[PaginatedResponse[EnvironmentalGoalOut]])
async def list_environmental_goals(
    department_id: uuid.UUID | None = Query(default=None),
    status_filter: GoalStatus | None = Query(default=None, alias="status"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items, total = await environmental_goal_repository.list(
        db, page, per_page, department_id=department_id, status=status_filter
    )
    return SuccessResponse(
        data=PaginatedResponse(
            items=[EnvironmentalGoalOut.model_validate(i) for i in items],
            total=total,
            page=page,
            per_page=per_page,
            total_pages=(total + per_page - 1) // per_page,
        )
    )


@router.post("", response_model=SuccessResponse[EnvironmentalGoalOut], status_code=status.HTTP_201_CREATED)
async def create_environmental_goal(
    data: EnvironmentalGoalCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    goal = await environmental_goal_repository.create(db, data)
    return SuccessResponse(data=EnvironmentalGoalOut.model_validate(goal))


@router.get("/{id}", response_model=SuccessResponse[EnvironmentalGoalOut])
async def get_environmental_goal(
    id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)
):
    goal = await environmental_goal_repository.get_by_id(db, id)
    if goal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Environmental goal not found")
    return SuccessResponse(data=EnvironmentalGoalOut.model_validate(goal))


@router.patch("/{id}", response_model=SuccessResponse[EnvironmentalGoalOut])
async def update_environmental_goal(
    id: uuid.UUID,
    data: EnvironmentalGoalUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    goal = await environmental_goal_repository.get_by_id(db, id)
    if goal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Environmental goal not found")
    goal = await environmental_goal_repository.update(db, goal, data)
    return SuccessResponse(data=EnvironmentalGoalOut.model_validate(goal))


@router.delete("/{id}", response_model=SuccessResponse[None])
async def delete_environmental_goal(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    goal = await environmental_goal_repository.get_by_id(db, id)
    if goal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Environmental goal not found")
    await environmental_goal_repository.soft_delete(db, goal)
    return SuccessResponse(data=None, message="Environmental goal deleted")
