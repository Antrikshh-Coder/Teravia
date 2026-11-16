"""Application configuration management using Pydantic Settings."""

from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """TERAVIA backend runtime settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Core App
    app_name: str = "TERAVIA Environmental Intelligence API"
    app_version: str = "2.0.0"
    environment: str = Field(default="development", description="development | production | test")
    debug: bool = False
    port: int = 8000
    host: str = "0.0.0.0"

    # CORS
    cors_origins: Union[str, List[str]] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ]

    @field_validator("cors_origins", mode="after")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                import json
                return json.loads(v)
            return [x.strip() for x in v.split(",") if x.strip()]
        return v

    # Database
    database_url: str = Field(
        default="",
        description="PostgreSQL / Supabase connection URL. If empty, uses local SQLite persistence.",
    )
    sqlite_db_path: str = "teravia_local.db"
    

    # Supabase Auth & Storage
    supabase_url: str = Field(default="", description="Supabase project URL e.g. https://xxx.supabase.co")
    supabase_key: str = Field(default="", description="Supabase public anon key")
    supabase_service_role_key: str = Field(default="", description="Supabase private service role key")
    supabase_jwt_secret: str = Field(default="", description="Supabase JWT secret for offline token verification")

    # Local JWT Authentication Settings
    jwt_secret_key: str = Field(
        default="teravia-security-jwt-secret-key-environment-intel-2026",
        description="JWT secret key for token issuance and verification",
    )
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # Singapore Data.gov.sg External API
    data_gov_sg_api_key: str = Field(default="", description="Optional Data.gov.sg API key")
    data_gov_base_url: str = "https://api.data.gov.sg/v1/environment"

    # Open-Meteo External API
    open_meteo_base_url: str = "https://api.open-meteo.com/v1"
    singapore_latitude: float = 1.3521
    singapore_longitude: float = 103.8198

    # Cache Settings
    cache_ttl_seconds: int = 300  # 5 minutes
    weather_cache_ttl_seconds: int = 600  # 10 minutes


settings = Settings()
