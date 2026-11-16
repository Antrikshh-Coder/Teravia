"""Weather telemetry and forecast router powered by Open-Meteo."""

from fastapi import APIRouter, Query
from ..services.open_meteo_client import open_meteo_client
from ..models.environmental import WeatherCurrentResponse, WeatherForecastResponse

router = APIRouter(prefix="/weather", tags=["Weather"])


@router.get("/current", response_model=WeatherCurrentResponse)
async def get_current_weather():
    """Retrieve current modelled atmospheric conditions for Singapore (temperature, apparent temp, humidity, precipitation, wind speed)."""
    data = await open_meteo_client.get_current_weather()
    return WeatherCurrentResponse(**data)


@router.get("/forecast", response_model=WeatherForecastResponse)
async def get_weather_forecast(days: int = Query(2, ge=1, le=7, description="Number of forecast days (1-7)")):
    """Retrieve hourly weather forecast from Open-Meteo. Clearly tagged as forecast model."""
    data = await open_meteo_client.get_hourly_forecast(days=days)
    return WeatherForecastResponse(**data)
