from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.carbon_transaction import CarbonTransaction
from app.models.emission_factor import EmissionFactor
from app.models.enums import EmissionScope, TransactionSourceType
from app.schemas.carbon_transaction import CarbonTransactionCreate


class CarbonTransactionRepository:
    async def list(
        self,
        db: AsyncSession,
        page: int,
        per_page: int,
        department_id: uuid.UUID | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
        scope: EmissionScope | None = None,
        source_type: TransactionSourceType | None = None,
    ) -> tuple[list[CarbonTransaction], int]:
        base = select(CarbonTransaction).where(CarbonTransaction.is_deleted.is_(False))
        if scope is not None:
            base = base.join(
                EmissionFactor, EmissionFactor.id == CarbonTransaction.emission_factor_id
            ).where(EmissionFactor.scope == scope)
        if department_id is not None:
            base = base.where(CarbonTransaction.department_id == department_id)
        if start_date is not None:
            base = base.where(CarbonTransaction.transaction_date >= start_date)
        if end_date is not None:
            base = base.where(CarbonTransaction.transaction_date <= end_date)
        if source_type is not None:
            base = base.where(CarbonTransaction.source_type == source_type)

        total = (await db.execute(select(func.count()).select_from(base.subquery()))).scalar_one()
        result = await db.execute(
            base.order_by(CarbonTransaction.transaction_date.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
        )
        return list(result.scalars().all()), total

    async def get_by_id(self, db: AsyncSession, id: uuid.UUID) -> CarbonTransaction | None:
        result = await db.execute(
            select(CarbonTransaction).where(
                CarbonTransaction.id == id, CarbonTransaction.is_deleted.is_(False)
            )
        )
        return result.scalar_one_or_none()

    async def get_emission_factor(self, db: AsyncSession, id: uuid.UUID) -> EmissionFactor | None:
        result = await db.execute(select(EmissionFactor).where(EmissionFactor.id == id))
        return result.scalar_one_or_none()

    async def create(
        self,
        db: AsyncSession,
        data: CarbonTransactionCreate,
        co2_equivalent: Decimal,
        created_by: uuid.UUID,
    ) -> CarbonTransaction:
        txn = CarbonTransaction(
            source_type=TransactionSourceType.manual,
            emission_factor_id=data.emission_factor_id,
            department_id=data.department_id,
            quantity=data.quantity,
            co2_equivalent=co2_equivalent,
            transaction_date=data.transaction_date,
            is_auto_calculated=False,
            notes=data.notes,
            created_by=created_by,
        )
        db.add(txn)
        await db.commit()
        await db.refresh(txn)
        return txn

    async def soft_delete(self, db: AsyncSession, txn: CarbonTransaction) -> None:
        txn.is_deleted = True
        await db.commit()

    async def summary(
        self,
        db: AsyncSession,
        department_id: uuid.UUID | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> dict:
        base = (
            select(CarbonTransaction)
            .join(EmissionFactor, EmissionFactor.id == CarbonTransaction.emission_factor_id)
            .where(CarbonTransaction.is_deleted.is_(False))
        )
        filters = []
        if department_id is not None:
            filters.append(CarbonTransaction.department_id == department_id)
        if start_date is not None:
            filters.append(CarbonTransaction.transaction_date >= start_date)
        if end_date is not None:
            filters.append(CarbonTransaction.transaction_date <= end_date)

        total_stmt = select(func.coalesce(func.sum(CarbonTransaction.co2_equivalent), 0)).where(
            CarbonTransaction.is_deleted.is_(False), *filters
        )
        total_co2 = (await db.execute(total_stmt)).scalar_one()

        scope_stmt = (
            select(EmissionFactor.scope, func.coalesce(func.sum(CarbonTransaction.co2_equivalent), 0))
            .join(EmissionFactor, EmissionFactor.id == CarbonTransaction.emission_factor_id)
            .where(CarbonTransaction.is_deleted.is_(False), *filters)
            .group_by(EmissionFactor.scope)
        )
        scope_rows = (await db.execute(scope_stmt)).all()

        dept_stmt = (
            select(CarbonTransaction.department_id, func.coalesce(func.sum(CarbonTransaction.co2_equivalent), 0))
            .where(CarbonTransaction.is_deleted.is_(False), *filters)
            .group_by(CarbonTransaction.department_id)
        )
        dept_rows = (await db.execute(dept_stmt)).all()

        return {
            "total_co2": total_co2,
            "by_scope": [{"scope": row[0], "total_co2": row[1]} for row in scope_rows],
            "by_department": [{"department_id": row[0], "total_co2": row[1]} for row in dept_rows],
        }

    async def trends(
        self,
        db: AsyncSession,
        department_id: uuid.UUID | None = None,
        year: int | None = None,
    ) -> list[dict]:
        period = func.to_char(CarbonTransaction.transaction_date, "YYYY-MM")
        stmt = (
            select(period.label("period"), func.coalesce(func.sum(CarbonTransaction.co2_equivalent), 0))
            .where(CarbonTransaction.is_deleted.is_(False))
        )
        if department_id is not None:
            stmt = stmt.where(CarbonTransaction.department_id == department_id)
        if year is not None:
            stmt = stmt.where(func.extract("year", CarbonTransaction.transaction_date) == year)
        stmt = stmt.group_by(period).order_by(period)

        rows = (await db.execute(stmt)).all()
        return [{"period": row[0], "total_co2": row[1]} for row in rows]


carbon_transaction_repository = CarbonTransactionRepository()
