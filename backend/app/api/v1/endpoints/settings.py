from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_role
from app.repositories.settings import settings_repository
from app.schemas.common import SuccessResponse
from app.schemas.settings import EsgConfigurationOut, EsgConfigurationUpdate

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/config", response_model=SuccessResponse[EsgConfigurationOut])
async def get_config(db: AsyncSession = Depends(get_db), current_user=Depends(require_role("admin"))):
    config = await settings_repository.get_config(db)
    return SuccessResponse(data=EsgConfigurationOut.model_validate(config))


@router.patch("/config", response_model=SuccessResponse[EsgConfigurationOut])
async def update_config(
    data: EsgConfigurationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    config = await settings_repository.get_config(db)
    config = await settings_repository.update_config(db, config, data)
    return SuccessResponse(data=EsgConfigurationOut.model_validate(config))
