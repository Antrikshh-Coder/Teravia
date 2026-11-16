"""TERAVIA Environmental Intelligence Platform - Main FastAPI Application."""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from .config import settings
from .database import init_db, close_db
from .routers import (
    health,
    environmental,
    weather,
    locations,
    saved_places,
    journal,
    dashboard,
    auth,
)

# Configure structured logging
logging.basicConfig(
    level=logging.INFO if not settings.debug else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("teravia.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management."""
    logger.info("Starting TERAVIA API server...")
    await init_db()
    yield
    logger.info("Shutting down TERAVIA API server...")
    await close_db()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Interactive Environmental Intelligence API bridging computational telemetry with spatial conservation.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers for consistent API responses
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "status_code": exc.status_code,
            "message": str(exc.detail),
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    clean_errors = []
    for err in errors:
        loc = " -> ".join([str(x) for x in err.get("loc", [])])
        msg = err.get("msg", "Validation error")
        clean_errors.append(f"{loc}: {msg}")

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": True,
            "status_code": 422,
            "message": "Input validation failed.",
            "details": clean_errors,
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled server error on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "status_code": 500,
            "message": "An internal server error occurred. Please try again later.",
        },
    )


# Mount API routers under /api prefix
api_prefix = "/api"
app.include_router(health.router, prefix=api_prefix)
app.include_router(environmental.router, prefix=api_prefix)
app.include_router(weather.router, prefix=api_prefix)
app.include_router(locations.router, prefix=api_prefix)
app.include_router(saved_places.router, prefix=api_prefix)
app.include_router(journal.router, prefix=api_prefix)
app.include_router(dashboard.router, prefix=api_prefix)
app.include_router(auth.router, prefix=api_prefix)

from .auth.dependencies import get_current_user
from .models.places import SavedPlaceCreate
from fastapi import Depends

# Specification aliases: /api/favourites
@app.get(f"{api_prefix}/favourites", tags=["Saved Places"])
async def get_favourites_alias(user=Depends(get_current_user)):
    return await saved_places.get_user_saved_places(user=user)

@app.post(f"{api_prefix}/favourites", tags=["Saved Places"], status_code=status.HTTP_201_CREATED)
async def save_favourite_alias(payload: SavedPlaceCreate, user=Depends(get_current_user)):
    return await saved_places.save_place(payload=payload, user=user)

@app.delete(f"{api_prefix}/favourites/{{place_id}}", tags=["Saved Places"])
async def delete_favourite_alias(place_id: str, user=Depends(get_current_user)):
    return await saved_places.remove_saved_place(place_id=place_id, user=user)

# Specification aliases: /api/environment/air-quality & /api/environment/weather
@app.get(f"{api_prefix}/environment/air-quality", tags=["Environmental Intelligence"])
async def air_quality_alias():
    return await environmental.get_live_measurements()

@app.get(f"{api_prefix}/environment/weather", tags=["Weather"])
async def weather_alias():
    return await weather.get_current_weather()


@app.get("/")
async def root():
    """Root entrypoint with API discovery index."""
    return {
        "platform": settings.app_name,
        "version": settings.app_version,
        "status": "operational",
        "documentation": "/docs",
        "endpoints": {
            "health": f"{api_prefix}/health",
            "environmental_measurements": f"{api_prefix}/environmental/measurements",
            "environmental_history": f"{api_prefix}/environmental/history",
            "weather_current": f"{api_prefix}/weather/current",
            "locations": f"{api_prefix}/locations",
            "saved_places": f"{api_prefix}/saved-places",
            "nature_journal": f"{api_prefix}/journal",
            "dashboard_stats": f"{api_prefix}/dashboard/stats",
        },
    }
