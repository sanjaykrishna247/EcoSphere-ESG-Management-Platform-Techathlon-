from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

celery_app = Celery("ecosphere", broker=settings.REDIS_URL, backend=settings.REDIS_URL)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    imports=("app.workers.tasks",),
)

celery_app.conf.beat_schedule = {
    "check-overdue-compliance-issues": {
        "task": "app.workers.tasks.check_overdue_compliance_issues",
        "schedule": crontab(hour=0, minute=1),
    },
    "send-policy-reminders": {
        "task": "app.workers.tasks.send_policy_reminders",
        "schedule": crontab(hour=0, minute=30, day_of_week=1),
    },
    "recalculate-all-department-scores": {
        "task": "app.workers.tasks.recalculate_all_department_scores",
        "schedule": crontab(hour=1, minute=0),
    },
    "check-environmental-goals": {
        "task": "app.workers.tasks.check_environmental_goals",
        "schedule": crontab(hour=0, minute=45),
    },
}
