from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product_esg_profile import ProductEsgProfile
from app.schemas.product_esg_profile import ProductEsgProfileCreate, ProductEsgProfileUpdate


class ProductEsgProfileRepository:
    async def list(
        self, db: AsyncSession, page: int, per_page: int
    ) -> tuple[list[ProductEsgProfile], int]:
        base = select(ProductEsgProfile)
        total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar_one()
        result = await db.execute(
            base.order_by(ProductEsgProfile.product_name).offset((page - 1) * per_page).limit(per_page)
        )
        return list(result.scalars().all()), total

    async def get_by_id(self, db: AsyncSession, id: uuid.UUID) -> ProductEsgProfile | None:
        result = await db.execute(select(ProductEsgProfile).where(ProductEsgProfile.id == id))
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, data: ProductEsgProfileCreate) -> ProductEsgProfile:
        profile = ProductEsgProfile(**data.model_dump())
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
        return profile

    async def update(
        self, db: AsyncSession, profile: ProductEsgProfile, data: ProductEsgProfileUpdate
    ) -> ProductEsgProfile:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(profile, field, value)
        await db.commit()
        await db.refresh(profile)
        return profile


product_esg_profile_repository = ProductEsgProfileRepository()
