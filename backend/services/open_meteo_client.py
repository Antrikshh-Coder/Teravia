"""Open-Meteo Weather API Client for Singapore Microclimate Telemetry."""

import logging
from datetime import datetime, timezone
from typing import Any, Dict, List
import httpx
from ..config import settings
from .cache import cache

logger = logging.getLogger("teravia.open_meteo")


class OpenMeteoClient:
    """Client for Open-Meteo meteorological reanalysis and forecast models."""

    def __init__(self):
        self.base_url = settings.open_meteo_base_url
        self.latitude = settings.singapore_latitude
        self.longitude = settings.singapore_longitude
        self.timeout = 7.0
        self.cache_ttl = settings.weather_cache_ttl_seconds

    async def get_current_weather(self) -> Dict[str, Any]:
        """Fetch current atmospheric weather conditions for Singapore.
        
        Variables: temperature_2m, relative_humidity_2m, apparent_temperature,
                   precipitation, wind_speed_10m.
        """
        cache_key = "open_meteo_current_weather"
        cached = await cache.get(cache_key)
        if cached:
            cached_copy = dict(cached)
            cached_copy["is_cached"] = True
            return cached_copy

        url = f"{self.base_url}/forecast"
        params = {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "current": "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m",
            "timezone": "Asia/Singapore",
        }
        retrieved_at = datetime.now(timezone.utc).isoformat()

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(url, params=params)
                if res.status_code != 200:
                    logger.warning(f"Open-Meteo returned HTTP {res.status_code}")
                    return await self._fallback_current(cache_key, retrieved_at)

                data = res.json()
                current = data.get("current", {})
                current_units = data.get("current_units", {})

                result = {
                    "latitude": data.get("latitude", self.latitude),
                    "longitude": data.get("longitude", self.longitude),
                    "timezone": data.get("timezone", "Asia/Singapore"),
                    "elevation": data.get("elevation", 15.0),
                    "time": current.get("time", retrieved_at),
                    "temperature_2m": float(current.get("temperature_2m", 28.0)),
                    "apparent_temperature": float(current.get("apparent_temperature", 32.0)),
                    "relative_humidity_2m": float(current.get("relative_humidity_2m", 80.0)),
                    "precipitation": float(current.get("precipitation", 0.0)),
                    "wind_speed_10m": float(current.get("wind_speed_10m", 5.0)),
                    "units": {
                        "temperature_2m": current_units.get("temperature_2m", "°C"),
                        "apparent_temperature": current_units.get("apparent_temperature", "°C"),
                        "relative_humidity_2m": current_units.get("relative_humidity_2m", "%"),
                        "precipitation": current_units.get("precipitation", "mm"),
                        "wind_speed_10m": current_units.get("wind_speed_10m", "km/h"),
                    },
                    "retrieved_at": retrieved_at,
                    "provider": "Open-Meteo High-Resolution Weather Model",
                    "data_type": "modelled_current",
                    "is_cached": False,
                    "status": "live",
                }

                await cache.set(cache_key, result, self.cache_ttl)
                return result

        except Exception as exc:
            logger.error(f"Open-Meteo request failed: {exc}")
            return await self._fallback_current(cache_key, retrieved_at)

    async def get_hourly_forecast(self, days: int = 2) -> Dict[str, Any]:
        """Fetch 48-hour hourly weather forecast."""
        cache_key = f"open_meteo_forecast_days_{days}"
        cached = await cache.get(cache_key)
        if cached:
            cached_copy = dict(cached)
            cached_copy["is_cached"] = True
            return cached_copy

        url = f"{self.base_url}/forecast"
        params = {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "hourly": "temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,wind_speed_10m",
            "timezone": "Asia/Singapore",
            "forecast_days": days,
        }
        retrieved_at = datetime.now(timezone.utc).isoformat()

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(url, params=params)
                if res.status_code != 200:
                    return await self._fallback_forecast(cache_key, retrieved_at)

                data = res.json()
                hourly = data.get("hourly", {})
                hourly_units = data.get("hourly_units", {})

                times = hourly.get("time", [])
                temps = hourly.get("temperature_2m", [])
                humids = hourly.get("relative_humidity_2m", [])
                precip_probs = hourly.get("precipitation_probability", [])
                precips = hourly.get("precipitation", [])

                points: List[Dict[str, Any]] = []
                for i in range(min(len(times), 48)):
                    points.append({
                        "time": times[i],
                        "temperature": float(temps[i]) if i < len(temps) else 28.0,
                        "relative_humidity": float(humids[i]) if i < len(humids) else 80.0,
                        "precipitation_probability": float(precip_probs[i]) if i < len(precip_probs) else 0.0,
                        "precipitation": float(precips[i]) if i < len(precips) else 0.0,
                    })

                result = {
                    "latitude": data.get("latitude", self.latitude),
                    "longitude": data.get("longitude", self.longitude),
                    "timezone": data.get("timezone", "Asia/Singapore"),
                    "hourly": points,
                    "units": {
                        "temperature": hourly_units.get("temperature_2m", "°C"),
                        "relative_humidity": hourly_units.get("relative_humidity_2m", "%"),
                        "precipitation": hourly_units.get("precipitation", "mm"),
                        "precipitation_probability": "%",
                    },
                    "retrieved_at": retrieved_at,
                    "provider": "Open-Meteo Atmospheric Forecast",
                    "data_type": "forecast",
                    "is_cached": False,
                    "status": "live",
                }

                await cache.set(cache_key, result, self.cache_ttl)
                return result

        except Exception as exc:
            logger.error(f"Open-Meteo forecast failed: {exc}")
            return await self._fallback_forecast(cache_key, retrieved_at)

    async def _fallback_current(self, cache_key: str, retrieved_at: str) -> Dict[str, Any]:
        stale = await cache.get_stale(cache_key)
        if stale:
            val, _ = stale
            stale_copy = dict(val)
            stale_copy["is_cached"] = True
            stale_copy["status"] = "stale"
            return stale_copy

        return {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "timezone": "Asia/Singapore",
            "time": retrieved_at,
            "temperature_2m": 28.4,
            "apparent_temperature": 32.1,
            "relative_humidity_2m": 78.0,
            "precipitation": 0.0,
            "wind_speed_10m": 4.5,
            "units": {
                "temperature_2m": "°C",
                "apparent_temperature": "°C",
                "relative_humidity_2m": "%",
                "precipitation": "mm",
                "wind_speed_10m": "km/h",
            },
            "retrieved_at": retrieved_at,
            "provider": "Open-Meteo (Baseline Reference)",
            "data_type": "modelled_current",
            "is_cached": False,
            "status": "baseline",
        }

    async def _fallback_forecast(self, cache_key: str, retrieved_at: str) -> Dict[str, Any]:
        stale = await cache.get_stale(cache_key)
        if stale:
            val, _ = stale
            stale_copy = dict(val)
            stale_copy["is_cached"] = True
            stale_copy["status"] = "stale"
            return stale_copy

        return {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "timezone": "Asia/Singapore",
            "hourly": [],
            "units": {"temperature": "°C", "relative_humidity": "%"},
            "retrieved_at": retrieved_at,
            "provider": "Open-Meteo (Baseline Reference)",
            "data_type": "forecast",
            "is_cached": False,
            "status": "baseline",
        }


open_meteo_client = OpenMeteoClient()
