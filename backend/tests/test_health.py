"""Tests for API health and discovery endpoints."""

import pytest


@pytest.mark.asyncio
async def test_health_check(async_client):
    """Verify health endpoint reports healthy status and operational database."""
    response = await async_client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert data["database"] == "healthy"
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_root_index(async_client):
    """Verify root discovery endpoint lists primary REST routes."""
    response = await async_client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert "endpoints" in data
    assert "environmental_measurements" in data["endpoints"]
