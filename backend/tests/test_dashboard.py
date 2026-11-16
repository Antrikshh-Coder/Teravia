"""Tests for personal dashboard statistics."""

import pytest


@pytest.mark.asyncio
async def test_dashboard_stats(async_client, auth_headers_user1):
    """Verify personal dashboard statistics aggregation."""
    response = await async_client.get("/api/dashboard/stats", headers=auth_headers_user1)
    assert response.status_code == 200
    data = response.json()
    assert "user_id" in data
    assert "saved_places_count" in data
    assert "journal_entries_count" in data
    assert "categories_breakdown" in data
    assert "environmental_snapshot" in data
    assert "temperature_celsius" in data["environmental_snapshot"]
