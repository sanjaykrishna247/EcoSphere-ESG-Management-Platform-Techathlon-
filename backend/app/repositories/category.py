from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.models.enums import CategoryType
from app.schemas.category import CategoryCreate, CategoryUpdate


class CategoryRepository:
    async def list(self, db: AsyncSession, type: CategoryType | None) -> list[Category]:
        stmt = select(Category).where(Category.is_deleted.is_(False))
        if type is not None:
            stmt = stmt.where(Category.type == type)
        result = await db.execute(stmt.order_by(Category.name))
        return list(result.scalars().all())

    async def get_by_id(self, db: AsyncSession, id: uuid.UUID) -> Category | None:
        result = await db.execute(select(Category).where(Category.id == id, Category.is_deleted.is_(False)))
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, data: CategoryCreate) -> Category:
        category = Category(**data.model_dump())
        db.add(category)
        await db.commit()
        await db.refresh(category)
        return category

    async def update(self, db: AsyncSession, category: Category, data: CategoryUpdate) -> Category:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(category, field, value)
        await db.commit()
        await db.refresh(category)
        return category

    async def soft_delete(self, db: AsyncSession, category: Category) -> None:
        category.is_deleted = True
        await db.commit()


category_repository = CategoryRepository()
