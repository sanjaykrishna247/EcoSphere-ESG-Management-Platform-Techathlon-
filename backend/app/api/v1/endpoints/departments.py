import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.repositories.department import department_repository
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.schemas.department import DepartmentCreate, DepartmentOut, DepartmentUpdate

router = APIRouter(prefix="/departments", tags=["departments"])


@router.get("", response_model=SuccessResponse[PaginatedResponse[DepartmentOut]])
async def list_departments(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items, total = await department_repository.list(db, page, per_page)
    return SuccessResponse(
        data=PaginatedResponse(
            items=[DepartmentOut.model_validate(i) for i in items],
            total=total,
            page=page,
            per_page=per_page,
            total_pages=(total + per_page - 1) // per_page,
        )
    )


@router.post("", response_model=SuccessResponse[DepartmentOut], status_code=status.HTTP_201_CREATED)
async def create_department(
    data: DepartmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    dept = await department_repository.create(db, data)
    return SuccessResponse(data=DepartmentOut.model_validate(dept))


@router.get("/{id}", response_model=SuccessResponse[DepartmentOut])
async def get_department(
    id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)
):
    dept = await department_repository.get_by_id(db, id)
    if dept is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    return SuccessResponse(data=DepartmentOut.model_validate(dept))


@router.patch("/{id}", response_model=SuccessResponse[DepartmentOut])
async def update_department(
    id: uuid.UUID,
    data: DepartmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    dept = await department_repository.get_by_id(db, id)
    if dept is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    dept = await department_repository.update(db, dept, data)
    return SuccessResponse(data=DepartmentOut.model_validate(dept))


@router.delete("/{id}", response_model=SuccessResponse[None])
async def delete_department(
    id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user=Depends(require_role("admin"))
):
    dept = await department_repository.get_by_id(db, id)
    if dept is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    await department_repository.soft_delete(db, dept)
    return SuccessResponse(data=None, message="Department deleted")
