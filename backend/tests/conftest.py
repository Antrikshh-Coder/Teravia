"""Test configuration and fixtures for TERAVIA test suite."""

import os
import pytest
import pytest_asyncio
import httpx
from backend.config import settings

# Force test database for test suite
settings.sqlite_db_path = "teravia_test.db"
settings.environment = "test"

from backend.main import app
from backend.database import init_db, close_db


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db():
    """Initialize test database before tests and clean up after."""
    if os.path.exists("teravia_test.db"):
        try:
            os.remove("teravia_test.db")
        except OSError:
            pass

    await init_db()
    yield
    await close_db()
    if os.path.exists("teravia_test.db"):
        try:
            os.remove("teravia_test.db")
        except OSError:
            pass


@pytest_asyncio.fixture
async def async_client():
    """Async HTTP client targeting the FastAPI application."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture
def auth_headers_user1():
    """Authorization headers for primary test user."""
    return {"Authorization": "Bearer test-token-user1"}


@pytest.fixture
def auth_headers_user2():
    """Authorization headers for secondary test user (for isolation verification)."""
    return {"Authorization": "Bearer test-token-user2"}
