"""Tests for Singapore environmental data endpoints."""

import pytest


@pytest.mark.asyncio
async def test_live_environmental_measurements(async_client):
    """Verify environmental measurements endpoint returns live validated regions and units."""
    response = await async_client.get("/api/environmental/measurements")
    assert response.status_code == 200
    data = response.json()

    assert "pm25" in data
    assert "units" in data
    assert data["units"]["pm25"] == "µg/m³"
    assert data["units"]["air_temperature"] == "°C"
    assert "Central" in data["pm25"]
    assert "provider" in data
    assert "retrieved_at" in data
    assert isinstance(data["is_cached"], bool)


@pytest.mark.asyncio
async def test_environmental_history_timeframes(async_client):
    """Verify environmental history returns time series points for Singapore regions."""
    for tf in ["24h", "7d"]:
        response = await async_client.get(f"/api/environmental/history?region=Central&timeframe={tf}")
        assert response.status_code == 200
        data = response.json()
        assert data["region"] == "Central"
        assert data["timeframe"] == tf
        assert len(data["points"]) > 0
        p0 = data["points"][0]
        assert "temperature" in p0
        assert "humidity" in p0
        assert "time_label" in p0
        assert p0["data_type"] in ["observation", "forecast", "historical"]


@pytest.mark.asyncio
async def test_environmental_summary(async_client):
    """Verify regional summary reports vegetation canopy cover and cooling offsets."""
    response = await async_client.get("/api/environmental/summary")
    assert response.status_code == 200
    data = response.json()
    assert "regions" in data
    assert "Central" in data["regions"]
    central = data["regions"]["Central"]
    assert "canopy_cover_pct" in central
    assert "cooling_offset_celsius" in central
    assert central["canopy_cover_pct"] > 40.0
