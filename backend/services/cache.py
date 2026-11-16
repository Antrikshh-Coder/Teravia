"""Asynchronous in-memory cache with TTL expiration and stale-on-error fallback."""

import time
import asyncio
from typing import Any, Dict, Optional, Tuple


class TTLCache:
    """Async thread-safe in-memory key-value cache with TTL."""

    def __init__(self):
        self._store: Dict[str, Tuple[Any, float]] = {}  # key -> (value, expiry_timestamp)
        self._stale_backup: Dict[str, Tuple[Any, float]] = {}  # key -> (value, insertion_timestamp)
        self._lock = asyncio.Lock()

    async def get(self, key: str) -> Optional[Any]:
        """Retrieve value if unexpired."""
        async with self._lock:
            if key in self._store:
                value, expiry = self._store[key]
                if time.time() < expiry:
                    return value
                # Expired - remove from active store but keep in stale backup
                del self._store[key]
            return None

    async def get_stale(self, key: str) -> Optional[Tuple[Any, float]]:
        """Retrieve last known value even if expired (for resilient fallback on outages)."""
        async with self._lock:
            return self._stale_backup.get(key)

    async def set(self, key: str, value: Any, ttl_seconds: int) -> None:
        """Store value with specified TTL."""
        async with self._lock:
            now = time.time()
            self._store[key] = (value, now + ttl_seconds)
            self._stale_backup[key] = (value, now)

    async def clear(self) -> None:
        """Clear all cached entries."""
        async with self._lock:
            self._store.clear()
            self._stale_backup.clear()


# Global cache instance
cache = TTLCache()
