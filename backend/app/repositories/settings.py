from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.esg_configuration import EsgConfiguration
from app.schemas.settings import EsgConfigurationUpdate


class SettingsRepository:
    async def get_config(self, db: AsyncSession) -> EsgConfiguration:
        result = await db.execute(select(EsgConfiguration).limit(1))
        config = result.scalar_one_or_none()
        if config is None:
            config = EsgConfiguration(org_name="EcoSphere")
            db.add(config)
            await db.commit()
            await db.refresh(config)
        return config

    async def update_config(
        self, db: AsyncSession, config: EsgConfiguration, data: EsgConfigurationUpdate
    ) -> EsgConfiguration:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(config, field, value)
        await db.commit()
        await db.refresh(config)
        return config


settings_repository = SettingsRepository()
