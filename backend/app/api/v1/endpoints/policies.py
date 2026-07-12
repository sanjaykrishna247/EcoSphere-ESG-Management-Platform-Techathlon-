import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.enums import PolicyCategory
from app.repositories.esg_policy import esg_policy_repository
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.schemas.esg_policy import EsgPolicyCreate, EsgPolicyOut, EsgPolicyUpdate

router = APIRouter(prefix="/policies", tags=["policies"])


@router.get("", response_model=SuccessResponse[PaginatedResponse[EsgPolicyOut]])
async def list_policies(
    category: PolicyCategory | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items, total = await esg_policy_repository.list(db, page, per_page, category, is_active)
    return SuccessResponse(
        data=PaginatedResponse(
            items=[EsgPolicyOut.model_validate(i) for i in items],
            total=total,
            page=page,
            per_page=per_page,
            total_pages=(total + per_page - 1) // per_page,
        )
    )


@router.post("", response_model=SuccessResponse[EsgPolicyOut], status_code=status.HTTP_201_CREATED)
async def create_policy(
    data: EsgPolicyCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    policy = await esg_policy_repository.create(db, data)
    return SuccessResponse(data=EsgPolicyOut.model_validate(policy))


@router.get("/{id}", response_model=SuccessResponse[EsgPolicyOut])
async def get_policy(
    id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)
):
    policy = await esg_policy_repository.get_by_id(db, id)
    if policy is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")
    return SuccessResponse(data=EsgPolicyOut.model_validate(policy))


@router.patch("/{id}", response_model=SuccessResponse[EsgPolicyOut])
async def update_policy(
    id: uuid.UUID,
    data: EsgPolicyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    policy = await esg_policy_repository.get_by_id(db, id)
    if policy is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")
    policy = await esg_policy_repository.update(db, policy, data)
    return SuccessResponse(data=EsgPolicyOut.model_validate(policy))


@router.delete("/{id}", response_model=SuccessResponse[None])
async def delete_policy(
    id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user=Depends(require_role("admin"))
):
    policy = await esg_policy_repository.get_by_id(db, id)
    if policy is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")
    await esg_policy_repository.soft_delete(db, policy)
    return SuccessResponse(data=None, message="Policy deleted")
