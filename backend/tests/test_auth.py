"""Tests for user registration, authentication, token verification, and security isolation."""

import pytest


@pytest.mark.asyncio
async def test_auth_registration_and_login_lifecycle(async_client):
    """Verify complete registration, duplicate handling, login, and session check flow."""
    test_email = "ecologist.singapore@teravia.sg"
    test_password = "secureMicroclimate2026"
    test_name = "Dr. Lin Chen"

    # 1. Successful registration
    reg_res = await async_client.post(
        "/api/auth/register",
        json={
            "email": test_email,
            "password": test_password,
            "display_name": test_name,
        },
    )
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == test_email
    assert reg_data["user"]["display_name"] == test_name
    token = reg_data["access_token"]

    # 2. Duplicate registration attempt should return 400 Bad Request
    dupe_res = await async_client.post(
        "/api/auth/register",
        json={
            "email": test_email,
            "password": "anotherPassword123",
        },
    )
    assert dupe_res.status_code == 400
    msg = (dupe_res.json().get("message") or dupe_res.json().get("detail") or "").lower()
    assert "already exists" in msg

    # 3. Invalid email format
    invalid_email_res = await async_client.post(
        "/api/auth/register",
        json={
            "email": "not-an-email",
            "password": test_password,
        },
    )
    assert invalid_email_res.status_code in [400, 422]

    # 4. Short password
    short_pwd_res = await async_client.post(
        "/api/auth/register",
        json={
            "email": "valid.email@teravia.sg",
            "password": "123",
        },
    )
    assert short_pwd_res.status_code in [400, 422]

    # 5. Successful login
    login_res = await async_client.post(
        "/api/auth/login",
        json={
            "email": test_email,
            "password": test_password,
        },
    )
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    assert login_data["user"]["email"] == test_email

    # 6. Invalid login (wrong password) returns 401
    bad_login_res = await async_client.post(
        "/api/auth/login",
        json={
            "email": test_email,
            "password": "WrongPassword123",
        },
    )
    assert bad_login_res.status_code == 401

    # 7. Non-existent account returns 401
    non_existent_res = await async_client.post(
        "/api/auth/login",
        json={
            "email": "ghost.user@teravia.sg",
            "password": "somePassword123",
        },
    )
    assert non_existent_res.status_code == 401

    # 8. Check authenticated session with Bearer token
    me_res = await async_client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["is_authenticated"] is True
    assert me_data["user"]["email"] == test_email


@pytest.mark.asyncio
async def test_protected_routes_require_authentication(async_client):
    """Verify that protected routes reject unauthenticated access with HTTP 401."""
    # Dashboard without auth
    res_dash = await async_client.get("/api/dashboard")
    assert res_dash.status_code == 401

    # Saved places without auth
    res_saved = await async_client.get("/api/saved-places")
    assert res_saved.status_code == 401

    # Journal without auth
    res_journal = await async_client.get("/api/journal")
    assert res_journal.status_code == 401

    # Favourites alias without auth
    res_fav = await async_client.get("/api/favourites")
    assert res_fav.status_code == 401
