from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.emission_factor import EmissionFactor
from app.schemas.emission_factor import EmissionFactorCreate, EmissionFactorUpdate


class EmissionFactorRepository:
    async def list(self, db: AsyncSession, is_active: bool | None) -> list[EmissionFactor]:
        stmt = select(EmissionFactor)
        if is_active is not None:
            stmt = stmt.where(EmissionFactor.is_active == is_active)
        result = await db.execute(stmt.order_by(EmissionFactor.name))
        return list(result.scalars().all())

    async def get_by_id(self, db: AsyncSession, id: uuid.UUID) -> EmissionFactor | None:
        result = await db.execute(select(EmissionFactor).where(EmissionFactor.id == id))
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, data: EmissionFactorCreate) -> EmissionFactor:
        factor = EmissionFactor(**data.model_dump())
        db.add(factor)
        await db.commit()
        await db.refresh(factor)
        return factor

    async def update(
        self, db: AsyncSession, factor: EmissionFactor, data: EmissionFactorUpdate
    ) -> EmissionFactor:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(factor, field, value)
        await db.commit()
        await db.refresh(factor)
        return factor

    async def deactivate(self, db: AsyncSession, factor: EmissionFactor) -> None:
        factor.is_active = False
        await db.commit()


emission_factor_repository = EmissionFactorRepository()
