"""Tests for nature journal observations and user authorization."""

import pytest


@pytest.mark.asyncio
async def test_journal_validation_errors(async_client, auth_headers_user1):
    """Verify input validation rejects invalid dates and empty descriptions."""
    # Invalid date format
    bad_date_payload = {
        "title": "Kingfisher Sighting",
        "description": "Observed on branch",
        "category": "Birds",
        "location": "Jurong Lake Gardens",
        "entry_date": "not-a-real-date",
        "image_url": "https://images.unsplash.com/photo-1552728089-57bdde30beb3",
    }
    res = await async_client.post("/api/journal", headers=auth_headers_user1, json=bad_date_payload)
    assert res.status_code == 422

    # Title too short
    short_title_payload = {
        "title": "A",
        "description": "Observed on branch",
        "category": "Birds",
        "location": "Jurong Lake Gardens",
        "entry_date": "2026-10-24",
        "image_url": "https://images.unsplash.com/photo-1552728089-57bdde30beb3",
    }
    res = await async_client.post("/api/journal", headers=auth_headers_user1, json=short_title_payload)
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_journal_crud_and_user_isolation(async_client, auth_headers_user1, auth_headers_user2):
    """Verify full CRUD lifecycle and ensure user2 cannot update/delete user1's records."""
    valid_payload = {
        "title": "Oriental Pied Hornbill Feeding",
        "scientific_name": "Anthracoceros albirostris",
        "description": "Observed a pair feeding on sea almond fruits near Pasir Ris mangroves.",
        "category": "Birds",
        "location": "Pasir Ris Park",
        "entry_date": "2026-10-25",
        "image_url": "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=900&q=80",
        "weather_condition": "Partly cloudy, 29°C",
    }

    # 1. User1 creates an entry
    res_create = await async_client.post("/api/journal", headers=auth_headers_user1, json=valid_payload)
    assert res_create.status_code == 201
    entry = res_create.json()
    entry_id = entry["id"]
    assert entry["user_id"] == "user1"
    assert entry["title"] == valid_payload["title"]

    # 2. User1 reads the list and sees the entry
    res_list1 = await async_client.get("/api/journal", headers=auth_headers_user1)
    assert res_list1.status_code == 200
    ids1 = [item["id"] for item in res_list1.json()["items"]]
    assert entry_id in ids1

    # 3. User2 lists entries - should NOT see User1's entry!
    res_list2 = await async_client.get("/api/journal", headers=auth_headers_user2)
    assert res_list2.status_code == 200
    ids2 = [item["id"] for item in res_list2.json()["items"]]
    assert entry_id not in ids2

    # 4. User2 attempts to EDIT User1's entry - MUST return 403 Forbidden!
    res_hack_edit = await async_client.put(
        f"/api/journal/{entry_id}",
        headers=auth_headers_user2,
        json={"title": "Hacked Title"},
    )
    assert res_hack_edit.status_code == 403

    # 5. User2 attempts to DELETE User1's entry - MUST return 403 Forbidden!
    res_hack_del = await async_client.delete(f"/api/journal/{entry_id}", headers=auth_headers_user2)
    assert res_hack_del.status_code == 403

    # 6. User1 legitimately updates the entry
    res_update = await async_client.put(
        f"/api/journal/{entry_id}",
        headers=auth_headers_user1,
        json={"title": "Oriental Pied Hornbill Nesting Pair"},
    )
    assert res_update.status_code == 200
    assert res_update.json()["title"] == "Oriental Pied Hornbill Nesting Pair"

    # 7. User1 searches for their observation
    res_search = await async_client.get("/api/journal?search=Hornbill", headers=auth_headers_user1)
    assert res_search.status_code == 200
    assert any(it["id"] == entry_id for it in res_search.json()["items"])

    # 8. User1 legitimately deletes the entry
    res_del = await async_client.delete(f"/api/journal/{entry_id}", headers=auth_headers_user1)
    assert res_del.status_code == 200

    # 9. Verify gone
    res_list1_after = await async_client.get("/api/journal", headers=auth_headers_user1)
    ids_after = [item["id"] for item in res_list1_after.json()["items"]]
    assert entry_id not in ids_after
