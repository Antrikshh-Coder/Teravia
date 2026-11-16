"""Location and saved place models."""

from typing import List, Optional, Tuple
from pydantic import BaseModel, Field


class GreenSpaceModel(BaseModel):
    """Green space sanctuary in Singapore."""
    id: str
    name: str
    category: str
    region: str
    coordinates: Tuple[float, float] = Field(description="[latitude, longitude]")
    description: str
    short_description: str
    amenities: List[str] = Field(default_factory=list)
    accessibility_info: str
    image_url: str
    opening_hours: str
    directions_url: str
    size_hectares: float
    highlights: List[str] = Field(default_factory=list)
    native_flora_fauna: List[str] = Field(default_factory=list)


class SavedPlaceCreate(BaseModel):
    """Request payload to save a green space sanctuary."""
    place_id: str = Field(..., min_length=1, max_length=120)
    notes: Optional[str] = Field(default=None, max_length=500)


class SavedPlaceItem(BaseModel):
    """Saved place item associated with a user."""
    id: str
    user_id: str
    place_id: str
    created_at: str
    notes: Optional[str] = None
    place: Optional[GreenSpaceModel] = None


class SavedPlacesListResponse(BaseModel):
    """Response containing saved places and their full details."""
    total: int
    items: List[SavedPlaceItem]
    saved_ids: List[str]
