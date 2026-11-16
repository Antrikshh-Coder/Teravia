"""Environmental data models for live sensors, regional metrics, and weather."""

from typing import Dict, List, Optional, Literal
from pydantic import BaseModel, Field


RegionName = Literal["Central", "North", "South", "East", "West"]


class RegionalReading(BaseModel):
    """Specific metric value for a Singapore region."""
    region: RegionName
    value: Optional[float] = None
    unit: str
    status: Literal["live", "cached", "unavailable", "baseline"] = "live"


class EnvironmentalMetricItem(BaseModel):
    """Full detail for an environmental metric indicator."""
    id: str
    name: str
    value: float
    unit: str
    region: RegionName
    timestamp: str = Field(description="ISO 8601 timestamp from provider")
    retrieved_at: str = Field(description="Timestamp when TERAVIA retrieved this")
    source: str = Field(description="e.g. Data.gov.sg / NEA / Open-Meteo")
    explanation: str
    status: Literal["verified", "live", "cached", "sample"] = "live"
    change24h: Optional[float] = None


class EnvironmentalSnapshot(BaseModel):
    """Consolidated environmental snapshot for Singapore regions."""
    timestamp: str
    retrieved_at: str
    provider: str
    is_cached: bool = False
    source_status: str = "healthy"
    pm25: Dict[str, Optional[float]] = Field(default_factory=dict, description="1-hr PM2.5 in µg/m³ by region")
    psi_24h: Dict[str, Optional[float]] = Field(default_factory=dict, description="24-hr PSI by region")
    air_temperature: Dict[str, Optional[float]] = Field(default_factory=dict, description="Air temp in °C by region or station")
    relative_humidity: Dict[str, Optional[float]] = Field(default_factory=dict, description="Relative humidity in %")
    rainfall: Dict[str, Optional[float]] = Field(default_factory=dict, description="Rainfall in mm")
    units: Dict[str, str] = Field(default_factory=lambda: {
        "pm25": "µg/m³",
        "psi": "index",
        "air_temperature": "°C",
        "relative_humidity": "%",
        "rainfall": "mm",
    })


class HourlyTelemetryPoint(BaseModel):
    """Single point in a time series (historical or forecast)."""
    timestamp: str
    time_label: str
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    precipitation: Optional[float] = None
    pm25: Optional[float] = None
    wind_speed: Optional[float] = None
    data_type: Literal["observation", "forecast", "historical"] = "observation"


class EnvironmentalHistoryResponse(BaseModel):
    """Historical & forecast time series series."""
    region: str
    timeframe: str
    points: List[HourlyTelemetryPoint]
    units: Dict[str, str]
    provider: str
    retrieved_at: str
    is_cached: bool


class WeatherCurrentResponse(BaseModel):
    """Open-Meteo current weather conditions."""
    latitude: float
    longitude: float
    timezone: str
    elevation: Optional[float] = None
    temperature_2m: float
    apparent_temperature: float
    relative_humidity_2m: float
    precipitation: float
    wind_speed_10m: float
    units: Dict[str, str]
    time: str
    retrieved_at: str
    provider: str = "Open-Meteo"
    data_type: Literal["modelled_current"] = "modelled_current"
    is_cached: bool = False


class WeatherForecastItem(BaseModel):
    time: str
    temperature: float
    relative_humidity: float
    precipitation_probability: Optional[float] = None
    precipitation: Optional[float] = None


class WeatherForecastResponse(BaseModel):
    """Open-Meteo hourly / multi-day forecast."""
    latitude: float
    longitude: float
    timezone: str
    hourly: List[WeatherForecastItem]
    units: Dict[str, str]
    retrieved_at: str
    provider: str = "Open-Meteo Forecast"
    data_type: Literal["forecast"] = "forecast"
    is_cached: bool = False
