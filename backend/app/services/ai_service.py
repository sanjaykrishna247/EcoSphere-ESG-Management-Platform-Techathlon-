import json
import uuid
from collections.abc import AsyncGenerator
from datetime import date, timedelta

from openai import AsyncOpenAI
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.redis import redis_client
from app.models.carbon_transaction import CarbonTransaction
from app.models.challenge import Challenge
from app.models.compliance_issue import ComplianceIssue
from app.models.department_score import DepartmentScore
from app.models.enums import ChallengeStatus, IssueStatus

SYSTEM_PROMPT = (
    "You are EcoSphere's ESG Intelligence Assistant. You have access to the organization's "
    "real-time ESG data. Help users understand their environmental impact, suggest improvements, "
    "explain compliance requirements, and provide ESG insights. Be concise, data-driven, and actionable. "
    "Always include relevant metrics when available.\n\nCurrent org data:\n{context}"
)


class AiService:
    def __init__(self) -> None:
        self._client = (
            AsyncOpenAI(base_url=settings.LLM_BASE_URL, api_key=settings.LLM_API_KEY)
            if settings.LLM_API_KEY
            else None
        )

    async def _gather_context(self, db: AsyncSession, department_id: uuid.UUID | None = None) -> str:
        org_score_result = await db.execute(
            select(func.avg(DepartmentScore.total_score)).select_from(DepartmentScore)
        )
        org_score = org_score_result.scalar_one_or_none()

        issues_result = await db.execute(
            select(ComplianceIssue)
            .where(ComplianceIssue.status.in_([IssueStatus.open, IssueStatus.in_progress]))
            .order_by(ComplianceIssue.severity.desc(), ComplianceIssue.due_date.asc())
            .limit(3)
        )
        top_issues = issues_result.scalars().all()

        thirty_days_ago = date.today() - timedelta(days=30)
        carbon_result = await db.execute(
            select(func.sum(CarbonTransaction.co2_equivalent)).where(
                CarbonTransaction.transaction_date >= thirty_days_ago
            )
        )
        recent_co2 = carbon_result.scalar_one_or_none() or 0

        active_challenges_result = await db.execute(
            select(func.count()).select_from(Challenge).where(Challenge.status == ChallengeStatus.active)
        )
        active_challenges = active_challenges_result.scalar_one()

        context = {
            "org_esg_score": float(org_score) if org_score is not None else None,
            "top_compliance_issues": [
                {"severity": i.severity.value, "description": i.description, "due_date": str(i.due_date)}
                for i in top_issues
            ],
            "carbon_emissions_last_30_days_kg_co2e": float(recent_co2),
            "active_challenges_count": active_challenges,
        }
        return json.dumps(context, default=str)

    async def stream_chat(
        self, db: AsyncSession, messages: list[dict]
    ) -> AsyncGenerator[str, None]:
        if self._client is None:
            yield "data: " + json.dumps(
                {"error": "AI assistant is not configured. Set LLM_API_KEY."}
            ) + "\n\n"
            return

        context = await self._gather_context(db)
        system = SYSTEM_PROMPT.format(context=context)

        stream = await self._client.chat.completions.create(
            model=settings.LLM_MODEL,
            messages=[{"role": "system", "content": system}, *messages],
            temperature=0.2,
            top_p=0.7,
            max_tokens=1024,
            stream=True,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta.content if chunk.choices else None
            if delta:
                yield "data: " + json.dumps({"delta": delta}) + "\n\n"
        yield "data: " + json.dumps({"done": True}) + "\n\n"

    async def generate_insights(self, db: AsyncSession, department_id: uuid.UUID) -> str:
        cache_key = f"ai:insights:{department_id}"
        cached = await redis_client.get(cache_key)
        if cached:
            return cached

        if self._client is None:
            return "AI assistant is not configured. Set LLM_API_KEY to enable insights."

        context = await self._gather_context(db, department_id)
        system = SYSTEM_PROMPT.format(context=context)

        response = await self._client.chat.completions.create(
            model=settings.LLM_MODEL,
            messages=[
                {"role": "system", "content": system},
                {
                    "role": "user",
                    "content": "Generate 3-5 concise, actionable ESG improvement recommendations for this department based on the current data.",
                },
            ],
            temperature=0.2,
            top_p=0.7,
            max_tokens=512,
            stream=False,
        )
        insight_text = response.choices[0].message.content or ""
        await redis_client.set(cache_key, insight_text, ex=3600)
        return insight_text


ai_service = AiService()
