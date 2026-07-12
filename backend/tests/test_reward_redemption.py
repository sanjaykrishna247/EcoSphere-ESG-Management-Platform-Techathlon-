import uuid

import pytest
from sqlalchemy import update

from app.models.reward import Reward
from app.models.user import User


async def _register(client, email: str) -> tuple[dict, str]:
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "TestPass123", "full_name": "Reward User"},
    )
    user_id = reg.json()["data"]["id"]
    login_resp = await client.post("/api/v1/auth/login", json={"email": email, "password": "TestPass123"})
    tokens = login_resp.json()["data"]
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}
    return headers, user_id


async def _make_reward(db_session, points_required: int, stock: int) -> str:
    reward = Reward(name="Test Reward", points_required=points_required, stock=stock)
    db_session.add(reward)
    await db_session.commit()
    await db_session.refresh(reward)
    return str(reward.id)


@pytest.mark.asyncio
async def test_redeem_fails_with_insufficient_points(client, db_session):
    headers, _ = await _register(client, "poorredeemer@example.com")
    reward_id = await _make_reward(db_session, points_required=1000, stock=10)

    resp = await client.post(f"/api/v1/rewards/{reward_id}/redeem", headers=headers)
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_redeem_succeeds_and_deducts_points_and_stock(client, db_session):
    headers, user_id = await _register(client, "richredeemer@example.com")
    await db_session.execute(update(User).where(User.id == user_id).values(total_points=500))
    await db_session.commit()

    reward_id = await _make_reward(db_session, points_required=100, stock=1)

    resp = await client.post(f"/api/v1/rewards/{reward_id}/redeem", headers=headers)
    assert resp.status_code == 201

    me = await client.get("/api/v1/auth/me", headers=headers)
    assert me.json()["data"]["total_points"] == 400

    reward = await db_session.get(Reward, uuid.UUID(reward_id))
    await db_session.refresh(reward)
    assert reward.stock == 0
    assert reward.status.value == "out_of_stock"

    # second redemption should now fail: reward is out of stock
    resp2 = await client.post(f"/api/v1/rewards/{reward_id}/redeem", headers=headers)
    assert resp2.status_code == 400
