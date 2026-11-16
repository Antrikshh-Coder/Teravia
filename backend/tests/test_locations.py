"""Tests for locations catalog and filtering."""

import pytest


@pytest.mark.asyncio
async def test_list_all_locations(async_client):
    """Verify all 18 seeded Singapore green spaces are returned."""
    response = await async_client.get("/api/locations")
    assert response.status_code == 200
    places = response.json()
    assert len(places) >= 18
    p0 = places[0]
    assert "name" in p0
    assert "coordinates" in p0
    assert len(p0["coordinates"]) == 2
    assert "accessibility_info" in p0


@pytest.mark.asyncio
async def test_filter_locations_by_category(async_client):
    """Verify category filtering."""
    response = await async_client.get("/api/locations?category=Gardens")
    assert response.status_code == 200
    places = response.json()
    assert len(places) >= 2
    for p in places:
        assert p["category"] == "Gardens"


@pytest.mark.asyncio
async def test_search_locations(async_client):
    """Verify search filter across sanctuary names."""
    response = await async_client.get("/api/locations?search=Botanic")
    assert response.status_code == 200
    places = response.json()
    assert len(places) >= 1
    assert any("Botanic" in p["name"] for p in places)


@pytest.mark.asyncio
async def test_get_single_location(async_client):
    """Verify single location retrieval by ID."""
    response = await async_client.get("/api/locations/botanic-gardens")
    assert response.status_code == 200
    place = response.json()
    assert place["id"] == "botanic-gardens"
    assert "amenities" in place
    assert "highlights" in place


@pytest.mark.asyncio
async def test_get_nonexistent_location(async_client):
    """Verify 404 response for nonexistent location."""
    response = await async_client.get("/api/locations/non-existent-place-12345")
    assert response.status_code == 404
