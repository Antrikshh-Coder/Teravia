"""User saved places (sanctuaries) router with ownership enforcement."""

import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from ..auth.dependencies import get_current_user
from ..database import fetch_all, fetch_one, execute
from ..models.auth import UserProfile
from ..models.places import SavedPlaceCreate, SavedPlacesListResponse, SavedPlaceItem
from .locations import _row_to_greenspace

router = APIRouter(prefix="/saved-places", tags=["Saved Places"])


@router.get("", response_model=SavedPlacesListResponse)
async def get_user_saved_places(user: UserProfile = Depends(get_current_user)):
    """Retrieve saved places for the current authenticated user."""
    query = """
        SELECT sp.id AS saved_id, sp.user_id, sp.place_id, sp.notes, sp.created_at AS saved_created_at,
               l.*
        FROM saved_places sp
        JOIN locations l ON sp.place_id = l.id
        WHERE sp.user_id = ?
        ORDER BY sp.created_at DESC;
    """
    rows = await fetch_all(query, (user.id,))

    items = []
    saved_ids = []
    for r in rows:
        place_model = _row_to_greenspace(r)
        saved_ids.append(r["place_id"])
        items.append(
            SavedPlaceItem(
                id=r["saved_id"],
                user_id=r["user_id"],
                place_id=r["place_id"],
                created_at=r["saved_created_at"],
                notes=r.get("notes"),
                place=place_model,
            )
        )

    return SavedPlacesListResponse(
        total=len(items),
        items=items,
        saved_ids=saved_ids,
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def save_place(payload: SavedPlaceCreate, user: UserProfile = Depends(get_current_user)):
    """Save a green space sanctuary for the authenticated user. Prevents duplicates."""
    # Verify place exists
    loc = await fetch_one("SELECT id FROM locations WHERE id = ?;", (payload.place_id,))
    if not loc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location '{payload.place_id}' does not exist.",
        )

    # Check for duplicate
    existing = await fetch_one(
        "SELECT id FROM saved_places WHERE user_id = ? AND place_id = ?;",
        (user.id, payload.place_id),
    )
    if existing:
        return {
            "status": "already_saved",
            "message": "Place is already in your saved list.",
            "saved_id": existing["id"],
        }

    saved_id = f"saved-{uuid.uuid4()}"
    now_iso = datetime.now(timezone.utc).isoformat()

    await execute(
        """
        INSERT INTO saved_places (id, user_id, place_id, notes, created_at)
        VALUES (?, ?, ?, ?, ?);
        """,
        (saved_id, user.id, payload.place_id, payload.notes, now_iso),
    )

    return {
        "status": "success",
        "message": "Sanctuary saved to your personal collection.",
        "saved_id": saved_id,
        "place_id": payload.place_id,
    }


@router.delete("/{place_id}", status_code=status.HTTP_200_OK)
async def remove_saved_place(place_id: str, user: UserProfile = Depends(get_current_user)):
    """Remove a place from the authenticated user's saved collection."""
    existing = await fetch_one(
        "SELECT id FROM saved_places WHERE user_id = ? AND (place_id = ? OR id = ?);",
        (user.id, place_id, place_id),
    )
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Place not found in your saved list.",
        )

    await execute(
        "DELETE FROM saved_places WHERE user_id = ? AND (place_id = ? OR id = ?);",
        (user.id, place_id, place_id),
    )

    return {
        "status": "success",
        "message": "Place removed from saved collection.",
        "place_id": place_id,
    }
