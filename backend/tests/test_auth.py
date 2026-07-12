import pytest


@pytest.mark.asyncio
async def test_register_login_me_flow(client):
    register_resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "testuser@example.com", "password": "TestPass123", "full_name": "Test User"},
    )
    assert register_resp.status_code == 201
    assert register_resp.json()["data"]["email"] == "testuser@example.com"

    login_resp = await client.post(
        "/api/v1/auth/login", json={"email": "testuser@example.com", "password": "TestPass123"}
    )
    assert login_resp.status_code == 200
    tokens = login_resp.json()["data"]
    assert "access_token" in tokens
    assert "refresh_token" in tokens

    me_resp = await client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {tokens['access_token']}"}
    )
    assert me_resp.status_code == 200
    assert me_resp.json()["data"]["email"] == "testuser@example.com"


@pytest.mark.asyncio
async def test_login_wrong_password_fails(client):
    await client.post(
        "/api/v1/auth/register",
        json={"email": "wrongpass@example.com", "password": "TestPass123", "full_name": "Test User"},
    )
    resp = await client.post(
        "/api/v1/auth/login", json={"email": "wrongpass@example.com", "password": "WrongPassword"}
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_me_without_token_rejected(client):
    resp = await client.get("/api/v1/auth/me")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token_flow(client):
    await client.post(
        "/api/v1/auth/register",
        json={"email": "refresh@example.com", "password": "TestPass123", "full_name": "Refresh User"},
    )
    login_resp = await client.post(
        "/api/v1/auth/login", json={"email": "refresh@example.com", "password": "TestPass123"}
    )
    refresh_token = login_resp.json()["data"]["refresh_token"]

    refresh_resp = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert refresh_resp.status_code == 200
    assert "access_token" in refresh_resp.json()["data"]
