import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.enums import EmissionScope, TransactionSourceType
from app.repositories.carbon_transaction import carbon_transaction_repository
from app.schemas.carbon_transaction import (
    CarbonTransactionCreate,
    CarbonTransactionOut,
    CarbonTransactionSummary,
    CarbonTransactionTrendPoint,
)
from app.schemas.common import PaginatedResponse, SuccessResponse

router = APIRouter(prefix="/carbon-transactions", tags=["carbon-transactions"])


@router.get("", response_model=SuccessResponse[PaginatedResponse[CarbonTransactionOut]])
async def list_carbon_transactions(
    department_id: uuid.UUID | None = Query(default=None, alias="dept"),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    scope: EmissionScope | None = Query(default=None),
    source_type: TransactionSourceType | None = Query(default=None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items, total = await carbon_transaction_repository.list(
        db,
        page,
        per_page,
        department_id=department_id,
        start_date=start_date,
        end_date=end_date,
        scope=scope,
        source_type=source_type,
    )
    return SuccessResponse(
        data=PaginatedResponse(
            items=[CarbonTransactionOut.model_validate(i) for i in items],
            total=total,
            page=page,
            per_page=per_page,
            total_pages=(total + per_page - 1) // per_page,
        )
    )


@router.get("/summary", response_model=SuccessResponse[CarbonTransactionSummary])
async def get_carbon_transactions_summary(
    department_id: uuid.UUID | None = Query(default=None),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    data = await carbon_transaction_repository.summary(
        db, department_id=department_id, start_date=start_date, end_date=end_date
    )
    return SuccessResponse(data=CarbonTransactionSummary.model_validate(data))


@router.get("/trends", response_model=SuccessResponse[list[CarbonTransactionTrendPoint]])
async def get_carbon_transactions_trends(
    department_id: uuid.UUID | None = Query(default=None),
    year: int | None = Query(default=None, ge=2000, le=2100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    data = await carbon_transaction_repository.trends(db, department_id=department_id, year=year)
    return SuccessResponse(data=[CarbonTransactionTrendPoint.model_validate(row) for row in data])


@router.post("", response_model=SuccessResponse[CarbonTransactionOut], status_code=status.HTTP_201_CREATED)
async def create_carbon_transaction(
    data: CarbonTransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    factor = await carbon_transaction_repository.get_emission_factor(db, data.emission_factor_id)
    if factor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emission factor not found")

    co2_equivalent = data.quantity * factor.co2_per_unit
    txn = await carbon_transaction_repository.create(db, data, co2_equivalent, current_user.id)
    return SuccessResponse(data=CarbonTransactionOut.model_validate(txn))


@router.delete("/{id}", response_model=SuccessResponse[None])
async def delete_carbon_transaction(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    txn = await carbon_transaction_repository.get_by_id(db, id)
    if txn is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carbon transaction not found")
    await carbon_transaction_repository.soft_delete(db, txn)
    return SuccessResponse(data=None, message="Carbon transaction deleted")
