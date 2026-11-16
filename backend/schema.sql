-- ==============================================================================
-- TERAVIA — Environmental Intelligence Platform
-- PostgreSQL / Supabase Database Schema & Migration
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER PROFILES TABLE
-- Mirrors / extends auth.users managed by Supabase Auth
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. GREEN SPACES & LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    region TEXT NOT NULL CHECK (region IN ('Central', 'North', 'South', 'East', 'West')),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT NOT NULL,
    amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
    accessibility_info TEXT NOT NULL,
    image_url TEXT NOT NULL,
    opening_hours TEXT NOT NULL,
    directions_url TEXT NOT NULL,
    size_hectares DOUBLE PRECISION NOT NULL DEFAULT 0,
    highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
    native_flora_fauna JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. USER SAVED PLACES TABLE
CREATE TABLE IF NOT EXISTS public.saved_places (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    place_id TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_saved_place FOREIGN KEY (place_id) REFERENCES public.locations(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_place UNIQUE (user_id, place_id)
);

-- 4. NATURE JOURNAL ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Plants', 'Birds', 'Insects', 'Wildlife', 'Landscapes', 'Other')),
    location TEXT NOT NULL,
    entry_date DATE NOT NULL,
    image_url TEXT NOT NULL,
    weather_condition TEXT,
    scientific_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. HISTORICAL ENVIRONMENTAL TELEMETRY (Optional Cache / Log)
CREATE TABLE IF NOT EXISTS public.environmental_readings (
    id TEXT PRIMARY KEY,
    metric_type TEXT NOT NULL,
    region TEXT NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    unit TEXT NOT NULL,
    source TEXT NOT NULL,
    measurement_timestamp TIMESTAMPTZ NOT NULL,
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR HIGH-THROUGHPUT RETRIEVAL
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_saved_places_user ON public.saved_places (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_places_place ON public.saved_places (place_id);
CREATE INDEX IF NOT EXISTS idx_journal_user ON public.journal_entries (user_id);
CREATE INDEX IF NOT EXISTS idx_journal_user_date ON public.journal_entries (user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_locations_region ON public.locations (region);
CREATE INDEX IF NOT EXISTS idx_locations_category ON public.locations (category);
CREATE INDEX IF NOT EXISTS idx_readings_metric ON public.environmental_readings (metric_type, region, measurement_timestamp DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) FOR SUPABASE
-- ==============================================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environmental_readings ENABLE ROW LEVEL SECURITY;

-- Locations: readable by anyone (anon & authenticated)
DROP POLICY IF EXISTS "Locations are publicly readable" ON public.locations;
CREATE POLICY "Locations are publicly readable"
    ON public.locations FOR SELECT
    USING (true);

-- User Profiles: readable by authenticated, editable by owner
DROP POLICY IF EXISTS "Profiles are readable by authenticated users" ON public.user_profiles;
CREATE POLICY "Profiles are readable by authenticated users"
    ON public.user_profiles FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Saved Places: users can only view, insert, delete their own
DROP POLICY IF EXISTS "Users can view own saved places" ON public.saved_places;
CREATE POLICY "Users can view own saved places"
    ON public.saved_places FOR SELECT
    TO authenticated
    USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert own saved places" ON public.saved_places;
CREATE POLICY "Users can insert own saved places"
    ON public.saved_places FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can delete own saved places" ON public.saved_places;
CREATE POLICY "Users can delete own saved places"
    ON public.saved_places FOR DELETE
    TO authenticated
    USING (auth.uid()::text = user_id);

-- Nature Journal: users can only view, insert, update, delete their own
DROP POLICY IF EXISTS "Users can view own journal entries" ON public.journal_entries;
CREATE POLICY "Users can view own journal entries"
    ON public.journal_entries FOR SELECT
    TO authenticated
    USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert own journal entries" ON public.journal_entries;
CREATE POLICY "Users can insert own journal entries"
    ON public.journal_entries FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update own journal entries" ON public.journal_entries;
CREATE POLICY "Users can update own journal entries"
    ON public.journal_entries FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can delete own journal entries" ON public.journal_entries;
CREATE POLICY "Users can delete own journal entries"
    ON public.journal_entries FOR DELETE
    TO authenticated
    USING (auth.uid()::text = user_id);

-- Environmental readings: publicly readable
DROP POLICY IF EXISTS "Environmental readings are publicly readable" ON public.environmental_readings;
CREATE POLICY "Environmental readings are publicly readable"
    ON public.environmental_readings FOR SELECT
    USING (true);
