from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
    hash_password,
    hash_token,
    verify_password,
)
from app.models.user import User
from app.repositories.user import user_repository
from app.schemas.common import SuccessResponse
from app.schemas.user import RefreshRequest, TokenPair, UserLogin, UserOut, UserRegister, UserUpdate

router = APIRouter(prefix="/auth", tags=["auth"])


async def _issue_token_pair(db: AsyncSession, user: User) -> TokenPair:
    access_token = create_access_token(user.id, user.role.value)
    refresh_token = create_refresh_token(user.id)
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    await user_repository.store_refresh_token(db, user.id, hash_token(refresh_token), expires_at)
    return TokenPair(access_token=access_token, refresh_token=refresh_token)


@router.post("/register", response_model=SuccessResponse[UserOut], status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    existing = await user_repository.get_by_email(db, data.email)
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    user = await user_repository.create(db, data, hash_password(data.password))
    return SuccessResponse(data=UserOut.model_validate(user))


@router.post("/login", response_model=SuccessResponse[TokenPair])
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await user_repository.get_by_email(db, data.email)
    if user is None or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")
    tokens = await _issue_token_pair(db, user)
    return SuccessResponse(data=tokens)


@router.post("/refresh", response_model=SuccessResponse[TokenPair])
async def refresh(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(data.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    token_hash = hash_token(data.refresh_token)
    stored = await user_repository.get_refresh_token(db, token_hash)
    if stored is None or stored.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token invalid or expired")

    user = await user_repository.get_by_id(db, stored.user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    await user_repository.revoke_refresh_token(db, stored)
    tokens = await _issue_token_pair(db, user)
    return SuccessResponse(data=tokens)


@router.post("/logout", response_model=SuccessResponse[None])
async def logout(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    token_hash = hash_token(data.refresh_token)
    stored = await user_repository.get_refresh_token(db, token_hash)
    if stored is not None:
        await user_repository.revoke_refresh_token(db, stored)
    return SuccessResponse(data=None, message="Logged out")


@router.get("/me", response_model=SuccessResponse[UserOut])
async def me(current_user: User = Depends(get_current_user)):
    return SuccessResponse(data=UserOut.model_validate(current_user))


@router.patch("/me", response_model=SuccessResponse[UserOut])
async def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user = await user_repository.update(db, current_user, data)
    return SuccessResponse(data=UserOut.model_validate(user))
