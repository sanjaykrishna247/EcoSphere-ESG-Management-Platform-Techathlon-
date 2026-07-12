import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.repositories.esg_policy import esg_policy_repository
from app.repositories.policy_acknowledgement import policy_acknowledgement_repository
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.schemas.policy_acknowledgement import PolicyAcknowledgementOut

router = APIRouter(prefix="/policy-acknowledgements", tags=["policy-acknowledgements"])


@router.post("/{policy_id}", response_model=SuccessResponse[PolicyAcknowledgementOut], status_code=status.HTTP_201_CREATED)
async def acknowledge_policy(
    policy_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    policy = await esg_policy_repository.get_by_id(db, policy_id)
    if policy is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")

    ip_address = request.client.host if request.client else None
    try:
        ack = await policy_acknowledgement_repository.create(db, policy_id, current_user.id, ip_address)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already acknowledged")
    return SuccessResponse(data=PolicyAcknowledgementOut.model_validate(ack))


@router.get("/mine", response_model=SuccessResponse[list[PolicyAcknowledgementOut]])
async def my_acknowledgements(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items = await policy_acknowledgement_repository.list_for_employee(db, current_user.id)
    return SuccessResponse(data=[PolicyAcknowledgementOut.model_validate(i) for i in items])


@router.get("", response_model=SuccessResponse[PaginatedResponse[PolicyAcknowledgementOut]])
async def list_acknowledgements(
    policy_id: uuid.UUID | None = Query(default=None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    items, total = await policy_acknowledgement_repository.list(db, page, per_page, policy_id)
    return SuccessResponse(
        data=PaginatedResponse(
            items=[PolicyAcknowledgementOut.model_validate(i) for i in items],
            total=total,
            page=page,
            per_page=per_page,
            total_pages=(total + per_page - 1) // per_page,
        )
    )
