from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import update

from app.models.enums import UserRole
from app.models.user import User


async def _register_admin(client, db_session, email: str) -> dict:
    await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "TestPass123", "full_name": "Admin User"},
    )
    login_resp = await client.post("/api/v1/auth/login", json={"email": email, "password": "TestPass123"})
    tokens = login_resp.json()["data"]
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    me = await client.get("/api/v1/auth/me", headers=headers)
    user_id = me.json()["data"]["id"]
    await db_session.execute(update(User).where(User.id == user_id).values(role=UserRole.admin))
    await db_session.commit()

    return headers


@pytest.mark.asyncio
async def test_challenge_lifecycle_state_machine(client, db_session):
    admin_headers = await _register_admin(client, db_session, "challengeadmin@example.com")

    create_resp = await client.post(
        "/api/v1/challenges",
        json={
            "title": "Test Challenge",
            "description": "A challenge for testing the lifecycle state machine",
            "xp_reward": 100,
            "difficulty": "easy",
            "evidence_required": False,
            "deadline": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        },
        headers=admin_headers,
    )
    assert create_resp.status_code == 201
    challenge_id = create_resp.json()["data"]["id"]
    assert create_resp.json()["data"]["status"] == "draft"

    # draft -> completed should be rejected (no skipping steps)
    bad_transition = await client.patch(
        f"/api/v1/challenges/{challenge_id}/status", json={"status": "completed"}, headers=admin_headers
    )
    assert bad_transition.status_code == 400

    # draft -> active is allowed
    good_transition = await client.patch(
        f"/api/v1/challenges/{challenge_id}/status", json={"status": "active"}, headers=admin_headers
    )
    assert good_transition.status_code == 200
    assert good_transition.json()["data"]["status"] == "active"

    # any status -> archived is always allowed
    archive = await client.patch(
        f"/api/v1/challenges/{challenge_id}/status", json={"status": "archived"}, headers=admin_headers
    )
    assert archive.status_code == 200
    assert archive.json()["data"]["status"] == "archived"
