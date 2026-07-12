from fastapi import APIRouter

from app.api.v1.endpoints import (
    ai_assistant,
    audits,
    auth,
    badges,
    carbon_transactions,
    categories,
    challenge_participation,
    challenges,
    compliance_issues,
    csr_activities,
    dashboard,
    department_scores,
    departments,
    emission_factors,
    employee_participation,
    environmental_goals,
    leaderboards,
    notifications,
    policies,
    policy_acknowledgements,
    product_esg_profiles,
    reports,
    rewards,
    settings,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(departments.router)
api_router.include_router(categories.router)
api_router.include_router(emission_factors.router)
api_router.include_router(carbon_transactions.router)
api_router.include_router(environmental_goals.router)
api_router.include_router(product_esg_profiles.router)
api_router.include_router(csr_activities.router)
api_router.include_router(employee_participation.router)
api_router.include_router(challenges.router)
api_router.include_router(challenge_participation.router)
api_router.include_router(policies.router)
api_router.include_router(policy_acknowledgements.router)
api_router.include_router(audits.router)
api_router.include_router(compliance_issues.router)
api_router.include_router(badges.router)
api_router.include_router(rewards.router)
api_router.include_router(leaderboards.router)
api_router.include_router(department_scores.router)
api_router.include_router(reports.router)
api_router.include_router(notifications.router)
api_router.include_router(settings.router)
api_router.include_router(ai_assistant.router)
api_router.include_router(dashboard.router)
