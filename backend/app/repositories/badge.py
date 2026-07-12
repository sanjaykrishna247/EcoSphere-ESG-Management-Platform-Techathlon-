from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.badge import Badge, EmployeeBadge
from app.schemas.badge import BadgeCreate, BadgeUpdate


class BadgeRepository:
    async def list(self, db: AsyncSession, is_active: bool | None = None) -> list[Badge]:
        stmt = select(Badge)
        if is_active is not None:
            stmt = stmt.where(Badge.is_active.is_(is_active))
        result = await db.execute(stmt.order_by(Badge.name))
        return list(result.scalars().all())

    async def get_by_id(self, db: AsyncSession, id: uuid.UUID) -> Badge | None:
        result = await db.execute(select(Badge).where(Badge.id == id))
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, data: BadgeCreate) -> Badge:
        badge = Badge(**data.model_dump())
        db.add(badge)
        await db.commit()
        await db.refresh(badge)
        return badge

    async def update(self, db: AsyncSession, badge: Badge, data: BadgeUpdate) -> Badge:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(badge, field, value)
        await db.commit()
        await db.refresh(badge)
        return badge

    async def deactivate(self, db: AsyncSession, badge: Badge) -> None:
        badge.is_active = False
        await db.commit()

    async def list_mine(self, db: AsyncSession, employee_id: uuid.UUID) -> list[dict]:
        result = await db.execute(
            select(EmployeeBadge, Badge)
            .join(Badge, Badge.id == EmployeeBadge.badge_id)
            .where(EmployeeBadge.employee_id == employee_id)
            .order_by(EmployeeBadge.awarded_at.desc())
        )
        rows = []
        for employee_badge, badge in result.all():
            rows.append(
                {
                    "id": employee_badge.id,
                    "badge_id": badge.id,
                    "name": badge.name,
                    "description": badge.description,
                    "icon": badge.icon,
                    "awarded_at": employee_badge.awarded_at,
                }
            )
        return rows


badge_repository = BadgeRepository()
