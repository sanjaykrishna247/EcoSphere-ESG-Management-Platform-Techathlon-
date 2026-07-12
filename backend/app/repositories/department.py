from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.department import Department
from app.schemas.department import DepartmentCreate, DepartmentUpdate


class DepartmentRepository:
    async def list(self, db: AsyncSession, page: int, per_page: int) -> tuple[list[Department], int]:
        base = select(Department).where(Department.is_deleted.is_(False))
        total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar_one()
        result = await db.execute(base.order_by(Department.name).offset((page - 1) * per_page).limit(per_page))
        return list(result.scalars().all()), total

    async def get_by_id(self, db: AsyncSession, id: uuid.UUID) -> Department | None:
        result = await db.execute(
            select(Department).where(Department.id == id, Department.is_deleted.is_(False))
        )
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, data: DepartmentCreate) -> Department:
        dept = Department(**data.model_dump())
        db.add(dept)
        await db.commit()
        await db.refresh(dept)
        return dept

    async def update(self, db: AsyncSession, dept: Department, data: DepartmentUpdate) -> Department:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(dept, field, value)
        await db.commit()
        await db.refresh(dept)
        return dept

    async def soft_delete(self, db: AsyncSession, dept: Department) -> None:
        dept.is_deleted = True
        await db.commit()


department_repository = DepartmentRepository()
