"""Health check and service status router."""

from datetime import datetime, timezone
from fastapi import APIRouter
from ..config import settings
from ..database import fetch_one

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
async def check_health():
    """Verify backend health, database connectivity, and environment status."""
    db_status = "healthy"
    try:
        row = await fetch_one("SELECT 1 AS ok;")
        if not row or row.get("ok") != 1:
            db_status = "degraded"
    except Exception as exc:
        db_status = f"unreachable: {str(exc)}"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "app_name": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "singapore_data_gov": "integrated",
            "open_meteo": "integrated",
            "supabase_auth": "configured" if settings.supabase_url else "dev_mode",
        },
    }
