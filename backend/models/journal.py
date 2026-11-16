"""Nature journal entry models and validation."""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field, field_validator
from datetime import date as DateType


JournalCategoryLiteral = Literal[
    "Plants", "Birds", "Insects", "Wildlife", "Landscapes", "Other"
]


class JournalEntryCreate(BaseModel):
    """Payload to create a new nature observation."""
    title: str = Field(..., min_length=2, max_length=150, description="Observation title")
    description: str = Field(..., min_length=5, max_length=5000, description="Detailed field notes")
    category: JournalCategoryLiteral = Field(..., description="Species or ecological category")
    location: str = Field(..., min_length=2, max_length=200, description="Specific reserve or park location")
    entry_date: str = Field(..., description="Date of sighting in YYYY-MM-DD format")
    image_url: str = Field(..., min_length=5, max_length=2048, description="URL or storage reference for sighting image")
    weather_condition: Optional[str] = Field(default=None, max_length=150)
    scientific_name: Optional[str] = Field(default=None, max_length=150)

    @field_validator("entry_date")
    @classmethod
    def validate_date(cls, v: str) -> str:
        try:
            DateType.fromisoformat(v)
        except ValueError:
            raise ValueError("entry_date must be in ISO format YYYY-MM-DD")
        return v

    @field_validator("image_url")
    @classmethod
    def validate_image_url(cls, v: str) -> str:
        v_trimmed = v.strip()
        if not (v_trimmed.startswith("http://") or v_trimmed.startswith("https://") or v_trimmed.startswith("data:image/")):
            raise ValueError("image_url must be a valid HTTP(S) URL or data URL")
        # Enforce that large raw blobs aren't passed as megabyte text
        if len(v_trimmed) > 1_000_000:
            raise ValueError("Image data exceeds maximum payload limit. Use a remote image URL or storage reference.")
        return v_trimmed


class JournalEntryUpdate(BaseModel):
    """Payload to update an existing observation."""
    title: Optional[str] = Field(default=None, min_length=2, max_length=150)
    description: Optional[str] = Field(default=None, min_length=5, max_length=5000)
    category: Optional[JournalCategoryLiteral] = None
    location: Optional[str] = Field(default=None, min_length=2, max_length=200)
    entry_date: Optional[str] = None
    image_url: Optional[str] = Field(default=None, min_length=5, max_length=2048)
    weather_condition: Optional[str] = Field(default=None, max_length=150)
    scientific_name: Optional[str] = Field(default=None, max_length=150)

    @field_validator("entry_date")
    @classmethod
    def validate_date(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            try:
                DateType.fromisoformat(v)
            except ValueError:
                raise ValueError("entry_date must be in ISO format YYYY-MM-DD")
        return v


class JournalEntryResponse(BaseModel):
    """Full journal entry entity returned from the API."""
    id: str
    user_id: str
    title: str
    description: str
    category: JournalCategoryLiteral
    location: str
    entry_date: str
    image_url: str
    weather_condition: Optional[str] = None
    scientific_name: Optional[str] = None
    created_at: str
    updated_at: str


class JournalListResponse(BaseModel):
    """Paginated or filtered list of journal entries."""
    total: int
    items: List[JournalEntryResponse]
    categories_present: List[str]
