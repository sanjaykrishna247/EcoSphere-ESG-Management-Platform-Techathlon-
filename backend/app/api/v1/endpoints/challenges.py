import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.enums import ChallengeDifficulty, ChallengeStatus
from app.repositories.challenge import challenge_repository
from app.schemas.challenge import (
    ChallengeCreate,
    ChallengeOut,
    ChallengeStatusUpdate,
    ChallengeUpdate,
)
from app.schemas.challenge_participation import ChallengeParticipationOut
from app.schemas.common import PaginatedResponse, SuccessResponse

router = APIRouter(prefix="/challenges", tags=["challenges"])


@router.get("", response_model=SuccessResponse[PaginatedResponse[ChallengeOut]])
async def list_challenges(
    status_filter: ChallengeStatus | None = Query(default=None, alias="status"),
    difficulty: ChallengeDifficulty | None = Query(default=None),
    category_id: uuid.UUID | None = Query(default=None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items, total = await challenge_repository.list(
        db, page, per_page, status=status_filter, difficulty=difficulty, category_id=category_id
    )
    return SuccessResponse(
        data=PaginatedResponse(
            items=[ChallengeOut.model_validate(i) for i in items],
            total=total,
            page=page,
            per_page=per_page,
            total_pages=(total + per_page - 1) // per_page,
        )
    )


@router.post("", response_model=SuccessResponse[ChallengeOut], status_code=status.HTTP_201_CREATED)
async def create_challenge(
    data: ChallengeCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    challenge = await challenge_repository.create(db, data, created_by=current_user.id)
    return SuccessResponse(data=ChallengeOut.model_validate(challenge))


@router.get("/{id}", response_model=SuccessResponse[ChallengeOut])
async def get_challenge(
    id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)
):
    challenge = await challenge_repository.get_by_id(db, id)
    if challenge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")
    return SuccessResponse(data=ChallengeOut.model_validate(challenge))


@router.patch("/{id}", response_model=SuccessResponse[ChallengeOut])
async def update_challenge(
    id: uuid.UUID,
    data: ChallengeUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    challenge = await challenge_repository.get_by_id(db, id)
    if challenge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")
    challenge = await challenge_repository.update(db, challenge, data)
    return SuccessResponse(data=ChallengeOut.model_validate(challenge))


@router.patch("/{id}/status", response_model=SuccessResponse[ChallengeOut])
async def update_challenge_status(
    id: uuid.UUID,
    data: ChallengeStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    challenge = await challenge_repository.get_by_id(db, id)
    if challenge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")

    if not challenge_repository.is_transition_allowed(challenge.status, data.status):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition challenge from '{challenge.status.value}' to '{data.status.value}'",
        )

    challenge = await challenge_repository.set_status(db, challenge, data.status)
    return SuccessResponse(data=ChallengeOut.model_validate(challenge))


@router.delete("/{id}", response_model=SuccessResponse[None])
async def delete_challenge(
    id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user=Depends(require_role("admin", "manager"))
):
    challenge = await challenge_repository.get_by_id(db, id)
    if challenge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")
    await challenge_repository.soft_delete(db, challenge)
    return SuccessResponse(data=None, message="Challenge deleted")


@router.get("/{id}/participants", response_model=SuccessResponse[list[ChallengeParticipationOut]])
async def list_challenge_participants(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    challenge = await challenge_repository.get_by_id(db, id)
    if challenge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")
    items = await challenge_repository.list_participants(db, id)
    return SuccessResponse(data=[ChallengeParticipationOut.model_validate(i) for i in items])
