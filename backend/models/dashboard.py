"""Personal dashboard models and user analytics."""

from typing import Dict, List, Any
from pydantic import BaseModel
from .journal import JournalEntryResponse
from .places import GreenSpaceModel


class PersonalDashboardStats(BaseModel):
    """Aggregated statistics for a user's environmental activity."""
    user_id: str
    saved_places_count: int
    journal_entries_count: int
    categories_breakdown: Dict[str, int]
    recent_entries: List[JournalEntryResponse]
    recent_saved_places: List[GreenSpaceModel]
    environmental_snapshot: Dict[str, Any]
    active_streak_days: int
    total_habitats_explored: int
