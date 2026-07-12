import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.repositories.product_esg_profile import product_esg_profile_repository
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.schemas.product_esg_profile import (
    ProductEsgProfileCreate,
    ProductEsgProfileOut,
    ProductEsgProfileUpdate,
)

router = APIRouter(prefix="/product-esg-profiles", tags=["product-esg-profiles"])


@router.get("", response_model=SuccessResponse[PaginatedResponse[ProductEsgProfileOut]])
async def list_product_esg_profiles(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items, total = await product_esg_profile_repository.list(db, page, per_page)
    return SuccessResponse(
        data=PaginatedResponse(
            items=[ProductEsgProfileOut.model_validate(i) for i in items],
            total=total,
            page=page,
            per_page=per_page,
            total_pages=(total + per_page - 1) // per_page,
        )
    )


@router.post("", response_model=SuccessResponse[ProductEsgProfileOut], status_code=status.HTTP_201_CREATED)
async def create_product_esg_profile(
    data: ProductEsgProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    profile = await product_esg_profile_repository.create(db, data)
    return SuccessResponse(data=ProductEsgProfileOut.model_validate(profile))


@router.patch("/{id}", response_model=SuccessResponse[ProductEsgProfileOut])
async def update_product_esg_profile(
    id: uuid.UUID,
    data: ProductEsgProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    profile = await product_esg_profile_repository.get_by_id(db, id)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product ESG profile not found")
    profile = await product_esg_profile_repository.update(db, profile, data)
    return SuccessResponse(data=ProductEsgProfileOut.model_validate(profile))
