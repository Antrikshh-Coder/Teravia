"""Tests for Open-Meteo weather integration endpoints."""

import pytest


@pytest.mark.asyncio
async def test_current_weather(async_client):
    """Verify current weather returns temperature, humidity, wind, and units."""
    response = await async_client.get("/api/weather/current")
    assert response.status_code == 200
    data = response.json()
    assert "temperature_2m" in data
    assert "apparent_temperature" in data
    assert "relative_humidity_2m" in data
    assert "wind_speed_10m" in data
    assert "units" in data
    assert data["units"]["temperature_2m"] == "°C"
    assert data["data_type"] == "modelled_current"
    assert data["timezone"] == "Asia/Singapore"


@pytest.mark.asyncio
async def test_weather_forecast(async_client):
    """Verify weather forecast endpoint returns hourly trajectory tagged as forecast."""
    response = await async_client.get("/api/weather/forecast?days=2")
    assert response.status_code == 200
    data = response.json()
    assert data["data_type"] == "forecast"
    assert len(data["hourly"]) > 0
    h0 = data["hourly"][0]
    assert "time" in h0
    assert "temperature" in h0
    assert "relative_humidity" in h0
