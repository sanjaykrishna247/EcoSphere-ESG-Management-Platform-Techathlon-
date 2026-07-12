import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.enums import CategoryType
from app.repositories.category import category_repository
from app.schemas.category import CategoryCreate, CategoryOut, CategoryUpdate
from app.schemas.common import SuccessResponse

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=SuccessResponse[list[CategoryOut]])
async def list_categories(
    type: CategoryType | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items = await category_repository.list(db, type)
    return SuccessResponse(data=[CategoryOut.model_validate(i) for i in items])


@router.post("", response_model=SuccessResponse[CategoryOut], status_code=status.HTTP_201_CREATED)
async def create_category(
    data: CategoryCreate, db: AsyncSession = Depends(get_db), current_user=Depends(require_role("admin"))
):
    category = await category_repository.create(db, data)
    return SuccessResponse(data=CategoryOut.model_validate(category))


@router.patch("/{id}", response_model=SuccessResponse[CategoryOut])
async def update_category(
    id: uuid.UUID,
    data: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    category = await category_repository.get_by_id(db, id)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    category = await category_repository.update(db, category, data)
    return SuccessResponse(data=CategoryOut.model_validate(category))


@router.delete("/{id}", response_model=SuccessResponse[None])
async def delete_category(
    id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user=Depends(require_role("admin"))
):
    category = await category_repository.get_by_id(db, id)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    await category_repository.soft_delete(db, category)
    return SuccessResponse(data=None, message="Category deleted")
