"""Green spaces and locations catalog router."""

import json
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from ..database import fetch_all, fetch_one
from ..models.places import GreenSpaceModel

router = APIRouter(prefix="/locations", tags=["Locations"])


def _row_to_greenspace(row: dict) -> GreenSpaceModel:
    amenities = json.loads(row["amenities"]) if isinstance(row["amenities"], str) else row["amenities"]
    highlights = json.loads(row["highlights"]) if isinstance(row["highlights"], str) else row["highlights"]
    flora_fauna = json.loads(row["native_flora_fauna"]) if isinstance(row["native_flora_fauna"], str) else row["native_flora_fauna"]

    return GreenSpaceModel(
        id=row["id"],
        name=row["name"],
        category=row["category"],
        region=row["region"],
        coordinates=(float(row["latitude"]), float(row["longitude"])),
        description=row["description"],
        short_description=row["short_description"],
        amenities=amenities or [],
        accessibility_info=row["accessibility_info"],
        image_url=row["image_url"],
        opening_hours=row["opening_hours"],
        directions_url=row["directions_url"],
        size_hectares=float(row["size_hectares"]),
        highlights=highlights or [],
        native_flora_fauna=flora_fauna or [],
    )


@router.get("", response_model=List[GreenSpaceModel])
async def list_locations(
    category: Optional[str] = Query(None, description="Filter by category (Parks, Gardens, Nature Reserves, etc.)"),
    region: Optional[str] = Query(None, description="Filter by region (Central, North, South, East, West)"),
    search: Optional[str] = Query(None, description="Fuzzy search across name and description"),
):
    """Retrieve green spaces with optional filtering."""
    query = "SELECT * FROM locations WHERE 1=1"
    params = []

    if category and category.lower() != "all":
        query += " AND category = ?"
        params.append(category)

    if region and region.lower() != "all":
        query += " AND region = ?"
        params.append(region)

    if search:
        query += " AND (name LIKE ? OR description LIKE ? OR short_description LIKE ?)"
        term = f"%{search.strip()}%"
        params.extend([term, term, term])

    query += " ORDER BY name ASC;"
    rows = await fetch_all(query, tuple(params))
    return [_row_to_greenspace(r) for r in rows]


@router.get("/{place_id}", response_model=GreenSpaceModel)
async def get_location(place_id: str):
    """Retrieve details for a specific green space sanctuary."""
    row = await fetch_one("SELECT * FROM locations WHERE id = ?;", (place_id,))
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location '{place_id}' not found.",
        )
    return _row_to_greenspace(row)
