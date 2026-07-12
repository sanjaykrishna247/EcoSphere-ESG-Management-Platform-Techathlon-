import calendar
import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.repositories.department import department_repository
from app.repositories.department_score import department_score_repository
from app.schemas.common import SuccessResponse
from app.schemas.department_score import DepartmentScoreOut, DepartmentScoreRecalculateRequest
from app.services.score_service import score_service

router = APIRouter(prefix="/department-scores", tags=["department-scores"])


def _current_month_bounds() -> tuple[date, date]:
    today = date.today()
    start = today.replace(day=1)
    last_day = calendar.monthrange(today.year, today.month)[1]
    end = today.replace(day=last_day)
    return start, end


@router.get("", response_model=SuccessResponse[list[DepartmentScoreOut]])
async def list_department_scores(
    department_id: uuid.UUID | None = Query(default=None),
    period_start: date | None = Query(default=None),
    period_end: date | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    items = await department_score_repository.list(db, department_id, period_start, period_end)
    return SuccessResponse(data=[DepartmentScoreOut.model_validate(i) for i in items])


@router.post("/recalculate", response_model=SuccessResponse[list[DepartmentScoreOut]])
async def recalculate_department_scores(
    data: DepartmentScoreRecalculateRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin", "manager")),
):
    default_start, default_end = _current_month_bounds()
    period_start = data.period_start or default_start
    period_end = data.period_end or default_end

    if data.department_id is not None:
        dept = await department_repository.get_by_id(db, data.department_id)
        if dept is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
        departments = [dept]
    else:
        departments, _ = await department_repository.list(db, page=1, per_page=10_000)

    results = []
    for dept in departments:
        score = await score_service.calculate_department_score(db, dept.id, period_start, period_end)
        results.append(score)

    return SuccessResponse(data=[DepartmentScoreOut.model_validate(s) for s in results])
