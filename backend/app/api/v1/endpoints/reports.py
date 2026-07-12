import uuid
from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.carbon_transaction import CarbonTransaction
from app.models.compliance_issue import ComplianceIssue
from app.models.csr_activity import CsrActivity
from app.models.employee_participation import EmployeeParticipation
from app.schemas.common import SuccessResponse
from app.services.report_export import export_rows

router = APIRouter(prefix="/reports", tags=["reports"])

Format = Literal["json", "pdf", "excel", "csv"]


@router.get("/environmental")
async def environmental_report(
    department_id: uuid.UUID | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    format: Format = "json",
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    stmt = select(CarbonTransaction).where(CarbonTransaction.is_deleted.is_(False))
    if department_id:
        stmt = stmt.where(CarbonTransaction.department_id == department_id)
    if start_date:
        stmt = stmt.where(CarbonTransaction.transaction_date >= start_date)
    if end_date:
        stmt = stmt.where(CarbonTransaction.transaction_date <= end_date)
    txns = (await db.execute(stmt.order_by(CarbonTransaction.transaction_date.desc()))).scalars().all()

    columns = ["date", "source_type", "department_id", "quantity", "co2_equivalent"]
    rows = [[t.transaction_date, t.source_type.value, str(t.department_id), float(t.quantity), float(t.co2_equivalent)] for t in txns]

    if format == "json":
        return SuccessResponse(data={"columns": columns, "rows": rows, "total_records": len(rows)})
    return export_rows("environmental_report", columns, rows, format)


@router.get("/social")
async def social_report(
    department_id: uuid.UUID | None = None,
    format: Format = "json",
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    stmt = select(EmployeeParticipation, CsrActivity).join(
        CsrActivity, EmployeeParticipation.activity_id == CsrActivity.id
    )
    if department_id:
        stmt = stmt.where(CsrActivity.department_id == department_id)
    results = (await db.execute(stmt)).all()

    columns = ["activity", "employee_id", "approval_status", "points_earned", "completion_date"]
    rows = [
        [activity.title, str(p.employee_id), p.approval_status.value, p.points_earned, p.completion_date]
        for p, activity in results
    ]

    if format == "json":
        return SuccessResponse(data={"columns": columns, "rows": rows, "total_records": len(rows)})
    return export_rows("social_report", columns, rows, format)


@router.get("/governance")
async def governance_report(
    severity: str | None = None,
    format: Format = "json",
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    stmt = select(ComplianceIssue).where(ComplianceIssue.is_deleted.is_(False))
    if severity:
        stmt = stmt.where(ComplianceIssue.severity == severity)
    issues = (await db.execute(stmt.order_by(ComplianceIssue.due_date))).scalars().all()

    columns = ["severity", "description", "owner_id", "due_date", "status"]
    rows = [[i.severity.value, i.description, str(i.owner_id), i.due_date, i.status.value] for i in issues]

    if format == "json":
        return SuccessResponse(data={"columns": columns, "rows": rows, "total_records": len(rows)})
    return export_rows("governance_report", columns, rows, format)


@router.get("/esg-summary")
async def esg_summary_report(
    format: Format = "json",
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    env = await environmental_report(format="json", db=db, current_user=current_user)
    soc = await social_report(format="json", db=db, current_user=current_user)
    gov = await governance_report(format="json", db=db, current_user=current_user)

    if format == "json":
        return SuccessResponse(
            data={"environmental": env.data, "social": soc.data, "governance": gov.data}
        )

    columns = ["section", "metric", "value"]
    rows = [
        ["environmental", "total_records", env.data["total_records"]],
        ["social", "total_records", soc.data["total_records"]],
        ["governance", "total_records", gov.data["total_records"]],
    ]
    return export_rows("esg_summary_report", columns, rows, format)


@router.post("/custom")
async def custom_report(
    modules: list[Literal["environmental", "social", "governance"]],
    department_id: uuid.UUID | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    format: Format = "json",
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    data = {}
    if "environmental" in modules:
        result = await environmental_report(department_id, start_date, end_date, "json", db, current_user)
        data["environmental"] = result.data
    if "social" in modules:
        result = await social_report(department_id, "json", db, current_user)
        data["social"] = result.data
    if "governance" in modules:
        result = await governance_report(None, "json", db, current_user)
        data["governance"] = result.data

    if format == "json":
        return SuccessResponse(data=data)

    columns = ["module", "total_records"]
    rows = [[module, section["total_records"]] for module, section in data.items()]
    return export_rows("custom_report", columns, rows, format)
