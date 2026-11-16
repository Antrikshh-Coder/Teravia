"""Database access layer supporting Supabase PostgreSQL and local async persistence."""

import os
import re
import json
import logging
from typing import Any, Dict, List, Optional
import aiosqlite
from .config import settings

logger = logging.getLogger("teravia.db")

_pg_pool = None
_is_postgres = False


def _to_sqlite_placeholders(query: str) -> str:
    """Convert PostgreSQL $1, $2 style placeholders to SQLite ? placeholders."""
    return re.sub(r'\$\d+', '?', query)


async def init_db() -> None:
    """Initialize database tables, apply migrations, and seed initial records."""
    global _pg_pool, _is_postgres

    db_url = settings.database_url.strip()
    if db_url.startswith("postgres://") or db_url.startswith("postgresql://"):
        try:
            import asyncpg
            logger.info("Connecting to remote Supabase PostgreSQL database...")
            _pg_pool = await asyncpg.create_pool(dsn=db_url, min_size=1, max_size=10, timeout=10.0)
            _is_postgres = True
            logger.info("Connected to PostgreSQL successfully.")
            await _run_pg_migrations()
            await _seed_places()
            return
        except Exception as exc:
            logger.warning(f"Could not connect to PostgreSQL ({exc}). Falling back to local persistent SQLite.")
            _is_postgres = False

    # Local SQLite persistent database
    logger.info(f"Initializing local persistent database at {settings.sqlite_db_path}...")
    async with aiosqlite.connect(settings.sqlite_db_path) as conn:
        conn.row_factory = aiosqlite.Row
        await conn.execute("PRAGMA foreign_keys = ON;")
        await conn.execute("PRAGMA journal_mode = WAL;")

        # Create user accounts table for authentic authentication
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS user_accounts (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
        """)

        # Create user profiles table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS user_profiles (
                id TEXT PRIMARY KEY,
                email TEXT,
                display_name TEXT,
                avatar_url TEXT,
                role TEXT NOT NULL DEFAULT 'user',
                bio TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
        """)

        # Create locations table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS locations (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                region TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                description TEXT NOT NULL,
                short_description TEXT NOT NULL,
                amenities TEXT NOT NULL,
                accessibility_info TEXT NOT NULL,
                image_url TEXT NOT NULL,
                opening_hours TEXT NOT NULL,
                directions_url TEXT NOT NULL,
                size_hectares REAL NOT NULL DEFAULT 0,
                highlights TEXT NOT NULL,
                native_flora_fauna TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
        """)

        # Create saved places table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS saved_places (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                place_id TEXT NOT NULL,
                notes TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (place_id) REFERENCES locations(id) ON DELETE CASCADE,
                UNIQUE (user_id, place_id)
            );
        """)

        # Create journal entries table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS journal_entries (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                location TEXT NOT NULL,
                entry_date TEXT NOT NULL,
                image_url TEXT NOT NULL,
                weather_condition TEXT,
                scientific_name TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
        """)

        # Create environmental readings table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS environmental_readings (
                id TEXT PRIMARY KEY,
                metric_type TEXT NOT NULL,
                region TEXT NOT NULL,
                value REAL NOT NULL,
                unit TEXT NOT NULL,
                source TEXT NOT NULL,
                measurement_timestamp TEXT NOT NULL,
                retrieved_at TEXT NOT NULL
            );
        """)

        # Indexes
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_user_acc_email ON user_accounts (email);")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_places (user_id);")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_journal_user ON journal_entries (user_id);")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries (user_id, entry_date);")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_locations_cat ON locations (category);")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_locations_reg ON locations (region);")

        await conn.commit()

    logger.info("Database schema initialized.")
    await _seed_places()
    await _seed_initial_user_data()


async def _run_pg_migrations():
    """Apply schema.sql on PostgreSQL / Supabase if tables don't exist."""
    schema_file = os.path.join(os.path.dirname(__file__), "schema.sql")
    if os.path.exists(schema_file) and _pg_pool:
        with open(schema_file, "r", encoding="utf-8") as f:
            sql = f.read()
        async with _pg_pool.acquire() as conn:
            await conn.execute(sql)
            logger.info("PostgreSQL schema migration completed.")


async def _seed_places():
    """Seed Singapore Green Spaces into the locations table if empty."""
    json_path = os.path.join(os.path.dirname(__file__), "data", "singapore_places.json")
    if not os.path.exists(json_path):
        return

    existing = await fetch_all("SELECT id FROM locations LIMIT 1;")
    if existing:
        return  # Already seeded

    with open(json_path, "r", encoding="utf-8") as f:
        places = json.load(f)

    logger.info(f"Seeding {len(places)} Singapore green spaces into database...")
    for p in places:
        coords = p.get("coordinates", [1.3521, 103.8198])
        await execute(
            """
            INSERT INTO locations (
                id, name, category, region, latitude, longitude, description, short_description,
                amenities, accessibility_info, image_url, opening_hours, directions_url,
                size_hectares, highlights, native_flora_fauna, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, datetime('now'))
            ON CONFLICT (id) DO NOTHING;
            """,
            (
                p["id"],
                p["name"],
                p["category"],
                p["region"],
                float(coords[0]),
                float(coords[1]),
                p["description"],
                p["shortDescription"],
                json.dumps(p.get("amenities", [])),
                p["accessibilityInfo"],
                p["imageUrl"],
                p["openingHours"],
                p["directionsUrl"],
                float(p.get("sizeHectares", 0)),
                json.dumps(p.get("highlights", [])),
                json.dumps(p.get("nativeFloraFauna", [])),
            ),
        )


async def _seed_initial_user_data():
    """Seed initial sample entries for demo account."""
    seed_path = os.path.join(os.path.dirname(__file__), "data", "initial_seed.json")
    demo_user_id = "guest-demo-user"
    demo_email = "observer@teravia.sg"

    # Seed demo account credentials if not present
    from .auth.security import hash_password
    existing_acc = await fetch_one("SELECT id FROM user_accounts WHERE email = $1 LIMIT 1;", (demo_email,))
    if not existing_acc:
        p_hash, salt = hash_password("teravia2026")
        now_str = "2026-10-22T08:00:00Z"
        await execute(
            """
            INSERT INTO user_accounts (id, email, password_hash, salt, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO NOTHING;
            """,
            (demo_user_id, demo_email, p_hash, salt, now_str, now_str),
        )
        await execute(
            """
            INSERT INTO user_profiles (id, email, display_name, avatar_url, role, bio, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (id) DO NOTHING;
            """,
            (
                demo_user_id,
                demo_email,
                "Evelyn Tan",
                "",
                "user",
                "Field researcher documenting tropical urban microclimates.",
                now_str,
                now_str,
            ),
        )

    if not os.path.exists(seed_path):
        return

    # Check if demo user has entries
    existing_journal = await fetch_all("SELECT id FROM journal_entries WHERE user_id = $1 LIMIT 1;", (demo_user_id,))
    if not existing_journal:
        with open(seed_path, "r", encoding="utf-8") as f:
            seed = json.load(f)

        entries = seed.get("entries", [])
        for e in entries:
            await execute(
                """
                INSERT INTO journal_entries (
                    id, user_id, title, description, category, location, entry_date,
                    image_url, weather_condition, scientific_name, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                ON CONFLICT (id) DO NOTHING;
                """,
                (
                    e["id"],
                    demo_user_id,
                    e["title"],
                    e["description"],
                    e["category"],
                    e["location"],
                    e["date"],
                    e["imageUrl"],
                    e.get("weatherCondition"),
                    e.get("scientificName"),
                    "2026-10-22T08:00:00Z",
                    "2026-10-22T08:00:00Z",
                ),
            )

        saved = seed.get("saved", [])
        for pid in saved:
            await execute(
                """
                INSERT INTO saved_places (id, user_id, place_id, notes, created_at)
                VALUES ($1, $2, $3, $4, datetime('now'))
                ON CONFLICT (user_id, place_id) DO NOTHING;
                """,
                (f"saved-{demo_user_id}-{pid}", demo_user_id, pid, "Personal sanctuary"),
            )


async def fetch_all(query: str, params: tuple = ()) -> List[Dict[str, Any]]:
    """Execute parameterized select query and return rows as dictionaries."""
    if _is_postgres and _pg_pool:
        async with _pg_pool.acquire() as conn:
            rows = await conn.fetch(query, *params)
            return [dict(r) for r in rows]

    # SQLite
    sqlite_query = _to_sqlite_placeholders(query)
    async with aiosqlite.connect(settings.sqlite_db_path) as conn:
        conn.row_factory = aiosqlite.Row
        async with conn.execute(sqlite_query, params) as cursor:
            rows = await cursor.fetchall()
            return [dict(r) for r in rows]


async def fetch_one(query: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
    """Execute parameterized query and return single row or None."""
    results = await fetch_all(query, params)
    return results[0] if results else None


async def execute(query: str, params: tuple = ()) -> None:
    """Execute parameterized insert/update/delete query."""
    if _is_postgres and _pg_pool:
        # PostgreSQL ON CONFLICT compatibility check
        pg_query = query.replace("datetime('now')", "NOW()")
        async with _pg_pool.acquire() as conn:
            await conn.execute(pg_query, *params)
            return

    # SQLite
    sqlite_query = _to_sqlite_placeholders(query)
    async with aiosqlite.connect(settings.sqlite_db_path) as conn:
        await conn.execute("PRAGMA foreign_keys = ON;")
        await conn.execute(sqlite_query, params)
        await conn.commit()


async def close_db() -> None:
    """Close connection pool on shutdown."""
    global _pg_pool
    if _pg_pool:
        await _pg_pool.close()
        logger.info("Closed database connection pool.")
