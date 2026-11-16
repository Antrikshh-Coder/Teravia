"""Nature journal observations router with full CRUD and authorization."""

import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from ..auth.dependencies import get_current_user, get_optional_user
from ..database import fetch_all, fetch_one, execute
from ..models.auth import UserProfile
from ..models.journal import (
    JournalEntryCreate,
    JournalEntryUpdate,
    JournalEntryResponse,
    JournalListResponse,
)

router = APIRouter(prefix="/journal", tags=["Nature Journal"])


def _row_to_entry(row: dict) -> JournalEntryResponse:
    return JournalEntryResponse(
        id=row["id"],
        user_id=row["user_id"],
        title=row["title"],
        description=row["description"],
        category=row["category"],
        location=row["location"],
        entry_date=row["entry_date"],
        image_url=row["image_url"],
        weather_condition=row.get("weather_condition"),
        scientific_name=row.get("scientific_name"),
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


@router.get("", response_model=JournalListResponse)
async def list_journal_entries(
    category: Optional[str] = Query(None, description="Filter by category (Plants, Birds, etc.)"),
    search: Optional[str] = Query(None, description="Search across title, description, species, or location"),
    user: UserProfile = Depends(get_current_user),
):
    """Retrieve journal entries for the authenticated user."""
    user_id = user.id

    query = "SELECT * FROM journal_entries WHERE user_id = ?"
    params = [user_id]

    if category and category.lower() != "all":
        query += " AND category = ?"
        params.append(category)

    if search:
        query += " AND (title LIKE ? OR description LIKE ? OR scientific_name LIKE ? OR location LIKE ?)"
        term = f"%{search.strip()}%"
        params.extend([term, term, term, term])

    query += " ORDER BY entry_date DESC, created_at DESC;"

    rows = await fetch_all(query, tuple(params))
    items = [_row_to_entry(r) for r in rows]

    # Find categories present
    cats_present = list(set([it.category for it in items]))

    return JournalListResponse(
        total=len(items),
        items=items,
        categories_present=cats_present,
    )


@router.post("", response_model=JournalEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_journal_entry(
    payload: JournalEntryCreate,
    user: UserProfile = Depends(get_current_user),
):
    """Create a new field observation entry for the authenticated user."""
    entry_id = f"entry-{uuid.uuid4()}"
    now_iso = datetime.now(timezone.utc).isoformat()

    await execute(
        """
        INSERT INTO journal_entries (
            id, user_id, title, description, category, location, entry_date,
            image_url, weather_condition, scientific_name, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """,
        (
            entry_id,
            user.id,
            payload.title,
            payload.description,
            payload.category,
            payload.location,
            payload.entry_date,
            payload.image_url,
            payload.weather_condition,
            payload.scientific_name,
            now_iso,
            now_iso,
        ),
    )

    created_row = await fetch_one("SELECT * FROM journal_entries WHERE id = ?;", (entry_id,))
    if not created_row:
        raise HTTPException(status_code=500, detail="Failed retrieving newly created journal entry.")

    return _row_to_entry(created_row)


@router.put("/{entry_id}", response_model=JournalEntryResponse)
@router.patch("/{entry_id}", response_model=JournalEntryResponse)
async def update_journal_entry(
    entry_id: str,
    payload: JournalEntryUpdate,
    user: UserProfile = Depends(get_current_user),
):
    """Update an existing field observation. Verifies ownership; returns 403 or 404."""
    existing = await fetch_one("SELECT * FROM journal_entries WHERE id = ?;", (entry_id,))
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journal entry not found.")

    if existing["user_id"] != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify another user's observation.",
        )

    # Compute updated fields
    title = payload.title if payload.title is not None else existing["title"]
    description = payload.description if payload.description is not None else existing["description"]
    category = payload.category if payload.category is not None else existing["category"]
    location = payload.location if payload.location is not None else existing["location"]
    entry_date = payload.entry_date if payload.entry_date is not None else existing["entry_date"]
    image_url = payload.image_url if payload.image_url is not None else existing["image_url"]
    weather = payload.weather_condition if payload.weather_condition is not None else existing["weather_condition"]
    sci_name = payload.scientific_name if payload.scientific_name is not None else existing["scientific_name"]
    now_iso = datetime.now(timezone.utc).isoformat()

    await execute(
        """
        UPDATE journal_entries
        SET title = ?, description = ?, category = ?, location = ?, entry_date = ?,
            image_url = ?, weather_condition = ?, scientific_name = ?, updated_at = ?
        WHERE id = ? AND user_id = ?;
        """,
        (
            title,
            description,
            category,
            location,
            entry_date,
            image_url,
            weather,
            sci_name,
            now_iso,
            entry_id,
            user.id,
        ),
    )

    updated_row = await fetch_one("SELECT * FROM journal_entries WHERE id = ?;", (entry_id,))
    return _row_to_entry(updated_row)


@router.delete("/{entry_id}", status_code=status.HTTP_200_OK)
async def delete_journal_entry(
    entry_id: str,
    user: UserProfile = Depends(get_current_user),
):
    """Delete a field observation. Verifies ownership; returns 403 or 404."""
    existing = await fetch_one("SELECT * FROM journal_entries WHERE id = ?;", (entry_id,))
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journal entry not found.")

    if existing["user_id"] != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete another user's observation.",
        )

    await execute("DELETE FROM journal_entries WHERE id = ? AND user_id = ?;", (entry_id, user.id))

    return {
        "status": "success",
        "message": "Observation removed from field journal.",
        "entry_id": entry_id,
    }
