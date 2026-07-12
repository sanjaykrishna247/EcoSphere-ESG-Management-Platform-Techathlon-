import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import RefreshToken, User
from app.schemas.user import UserRegister, UserUpdate


class UserRepository:
    async def get_by_email(self, db: AsyncSession, email: str) -> User | None:
        result = await db.execute(select(User).where(User.email == email, User.is_deleted.is_(False)))
        return result.scalar_one_or_none()

    async def get_by_id(self, db: AsyncSession, user_id: uuid.UUID) -> User | None:
        result = await db.execute(select(User).where(User.id == user_id, User.is_deleted.is_(False)))
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, data: UserRegister, password_hash: str) -> User:
        user = User(
            email=data.email,
            password_hash=password_hash,
            full_name=data.full_name,
            department_id=data.department_id,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    async def update(self, db: AsyncSession, user: User, data: UserUpdate) -> User:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(user, field, value)
        await db.commit()
        await db.refresh(user)
        return user

    async def store_refresh_token(
        self, db: AsyncSession, user_id: uuid.UUID, token_hash: str, expires_at
    ) -> RefreshToken:
        token = RefreshToken(user_id=user_id, token_hash=token_hash, expires_at=expires_at)
        db.add(token)
        await db.commit()
        return token

    async def get_refresh_token(self, db: AsyncSession, token_hash: str) -> RefreshToken | None:
        result = await db.execute(
            select(RefreshToken).where(
                RefreshToken.token_hash == token_hash, RefreshToken.is_revoked.is_(False)
            )
        )
        return result.scalar_one_or_none()

    async def revoke_refresh_token(self, db: AsyncSession, token: RefreshToken) -> None:
        token.is_revoked = True
        await db.commit()


user_repository = UserRepository()
