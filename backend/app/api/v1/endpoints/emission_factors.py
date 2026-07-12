import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.repositories.emission_factor import emission_factor_repository
from app.schemas.common import SuccessResponse
from app.schemas.emission_factor import EmissionFactorCreate, EmissionFactorOut, EmissionFactorUpdate

router = APIRouter(prefix="/emission-factors", tags=["emission-factors"])


@router.get("", response_model=SuccessResponse[list[EmissionFactorOut]])
async def list_emission_factors(
    is_active: bool | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items = await emission_factor_repository.list(db, is_active)
    return SuccessResponse(data=[EmissionFactorOut.model_validate(i) for i in items])


@router.post("", response_model=SuccessResponse[EmissionFactorOut], status_code=status.HTTP_201_CREATED)
async def create_emission_factor(
    data: EmissionFactorCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    factor = await emission_factor_repository.create(db, data)
    return SuccessResponse(data=EmissionFactorOut.model_validate(factor))


@router.patch("/{id}", response_model=SuccessResponse[EmissionFactorOut])
async def update_emission_factor(
    id: uuid.UUID,
    data: EmissionFactorUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    factor = await emission_factor_repository.get_by_id(db, id)
    if factor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emission factor not found")
    factor = await emission_factor_repository.update(db, factor, data)
    return SuccessResponse(data=EmissionFactorOut.model_validate(factor))


@router.delete("/{id}", response_model=SuccessResponse[None])
async def delete_emission_factor(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    factor = await emission_factor_repository.get_by_id(db, id)
    if factor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emission factor not found")
    # EmissionFactor has no is_deleted column; DELETE deactivates instead of a hard delete
    # so historical carbon_transactions / product_esg_profiles that reference this factor
    # via FK remain intact and it disappears from active-only listings.
    await emission_factor_repository.deactivate(db, factor)
    return SuccessResponse(data=None, message="Emission factor deactivated")
