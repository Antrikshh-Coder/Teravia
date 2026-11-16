"""Tests for saved places persistence and user authorization."""

import pytest


@pytest.mark.asyncio
async def test_saved_places_crud_and_isolation(async_client, auth_headers_user1, auth_headers_user2):
    """Test saving a place, duplicate prevention, and user isolation."""
    place_to_save = "sungei-buloh"

    # 1. User1 saves place
    res_save = await async_client.post(
        "/api/saved-places",
        headers=auth_headers_user1,
        json={"place_id": place_to_save, "notes": "Mangrove bird watching"},
    )
    assert res_save.status_code in [200, 201]

    # 2. Verify User1 has place in their saved list
    res_list1 = await async_client.get("/api/saved-places", headers=auth_headers_user1)
    assert res_list1.status_code == 200
    data1 = res_list1.json()
    assert place_to_save in data1["saved_ids"]

    # 3. Duplicate prevention: saving again doesn't crash or duplicate
    res_dupe = await async_client.post(
        "/api/saved-places",
        headers=auth_headers_user1,
        json={"place_id": place_to_save},
    )
    assert res_dupe.status_code in [200, 201]
    res_list1_again = await async_client.get("/api/saved-places", headers=auth_headers_user1)
    assert res_list1_again.json()["saved_ids"].count(place_to_save) == 1

    # 4. User Isolation: User2 should NOT have place_to_save in their list
    res_list2 = await async_client.get("/api/saved-places", headers=auth_headers_user2)
    assert res_list2.status_code == 200
    data2 = res_list2.json()
    assert place_to_save not in data2["saved_ids"]

    # 5. User1 deletes the saved place
    res_del = await async_client.delete(f"/api/saved-places/{place_to_save}", headers=auth_headers_user1)
    assert res_del.status_code == 200

    # 6. Verify removed
    res_list1_after = await async_client.get("/api/saved-places", headers=auth_headers_user1)
    assert place_to_save not in res_list1_after.json()["saved_ids"]
