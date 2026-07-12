from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.core.config import settings

# Under pytest, each test may run in its own asyncio event loop; a pooled asyncpg
# connection created in one loop breaks ("attached to a different loop") when reused
# from another. NullPool opens a fresh connection per checkout, sidestepping that.
_engine_kwargs = {"poolclass": NullPool} if settings.TESTING else {}
engine = create_async_engine(settings.DATABASE_URL, echo=False, future=True, **_engine_kwargs)

AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
