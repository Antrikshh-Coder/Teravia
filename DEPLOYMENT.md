# TERAVIA — Production Deployment & System Architecture Guide

TERAVIA is an interactive environmental intelligence platform that unifies real-time Singapore environmental telemetry (Data.gov.sg & Open-Meteo), an interactive Living Map of 18 protected reserves, and a persistent nature journal with personal dashboards.

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    TERAVIA Frontend                         │
│  React 18 + TypeScript + Vite + Tailwind CSS / Vanilla CSS  │
│  - Supabase Auth SDK (@supabase/supabase-js)                │
│  - Interactive Leaflet Living Map                           │
│  - Live Telemetry Dashboard & Data-driven Nature Journal    │
└──────────────┬──────────────────────────────▲───────────────┘
               │ (Proxy /api or direct URL)    │ (JSON responses)
               ▼                               │
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend                          │
│  Python 3.10+ • Pydantic v2 • httpx • Async SQLAlchemy/SQL  │
│                                                             │
│  Routers:                                                   │
│   ├── /api/health          (Liveness & Dependency Status)   │
│   ├── /api/environmental   (PM2.5, PSI, Station Air Temp)   │
│   ├── /api/weather         (Open-Meteo Current & Forecast)  │
│   ├── /api/locations       (18 Curated Singapore Sanctuaries│
│   ├── /api/saved-places    (User Saved Places CRUD)         │
│   ├── /api/journal         (Nature Field Journal CRUD)      │
│   ├── /api/dashboard       (Personal & Regional Telemetry)  │
│   └── /api/auth            (Profile & Token Verification)   │
│                                                             │
│  Cross-Cutting Services:                                    │
│   ├── Supabase JWT & Bearer Token Verification              │
│   ├── In-Memory Async TTLCache (5-10 min configurable)     │
│   └── Dual-Mode Database Engine (PostgreSQL / SQLite)       │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────┐  ┌────────────────────────────┐
│      Persistent Database    │  │   External Open APIs       │
│  PostgreSQL (Supabase)      │  │  - Singapore Data.gov.sg   │
│   OR Local aiosqlite        │  │    (PM2.5, PSI, Air Temp)  │
│  - Row Level Security (RLS) │  │  - Open-Meteo               │
│  - Parameterised Queries    │  │    (Atmospheric Models)    │
└─────────────────────────────┘  └────────────────────────────┘
```

---

## 2. Prerequisites & Environment Setup

### System Requirements
- **Node.js**: v18.0.0 or higher
- **Python**: 3.10, 3.11, 3.12, 3.13, or 3.14
- **Package Managers**: `npm` and `pip` (or `uv`)

### Clone & Directory Structure
```bash
cd sylva-—-living-green
```

---

## 3. Environment Variables Configuration

Copy the template configuration files:

```bash
# Frontend & root configuration
cp .env.example .env

# Backend configuration
cp backend/.env.example backend/.env
```

### Frontend Variables (`.env`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of the FastAPI backend | `"/api"` (uses Vite proxy) or `"http://127.0.0.1:8000/api"` |
| `VITE_SUPABASE_URL` | Your Supabase Project URL | `"https://[project-ref].supabase.co"` |
| `VITE_SUPABASE_ANON_KEY`| Supabase public anon key | `"eyJhbGciOi..."` |
| `VITE_MAP_PROVIDER` | Map tile provider style | `"osm"` or `"carto"` |
| `VITE_APP_URL` | Frontend public origin | `"http://localhost:3000"` |

### Backend Variables (`backend/.env`)
| Variable | Description | Required | Default |
| :--- | :--- | :--- | :--- |
| `ENVIRONMENT` | Runtime mode (`development` or `production`) | No | `"development"` |
| `PORT` | Backend listening port | No | `8000` |
| `HOST` | Backend host binding | No | `"0.0.0.0"` |
| `CORS_ORIGINS` | Allowed frontend origins | Yes | `"http://localhost:3000,http://127.0.0.1:3000"` |
| `DATABASE_URL` | PostgreSQL connection string (`postgresql+asyncpg://...`) | Optional* | Empty (falls back to local SQLite) |
| `SUPABASE_URL` | Supabase Project URL | Optional* | `""` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase administrative key | Optional* | `""` |
| `SUPABASE_JWT_SECRET` | Supabase JWT secret for offline token verification | Optional* | `""` |
| `DATA_GOV_SG_API_KEY` | Optional Singapore Data.gov.sg key | No | `""` (public access works out of the box) |

*\* Note: If `DATABASE_URL` is omitted, the backend runs in zero-dependency local development mode using SQLite (`teravia_local.db`) with automatic table migrations and data seeding.*

---

## 4. Supabase Setup & Database Migrations

### A. Setting Up a Supabase Project
1. Visit [supabase.com](https://supabase.com) and create a new project.
2. Under **Project Settings -> Database**, copy the **Connection string** (URI mode).
3. Set your `DATABASE_URL` in `backend/.env`:
   ```bash
   DATABASE_URL="postgresql+asyncpg://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```
4. Under **Project Settings -> API**, copy:
   - **Project URL** -> `SUPABASE_URL`
   - **anon / public key** -> `VITE_SUPABASE_ANON_KEY`
   - **service_role key** -> `SUPABASE_SERVICE_ROLE_KEY`
   - **JWT Secret** -> `SUPABASE_JWT_SECRET`

### B. Applying Database Schema & RLS Policies
Navigate to the **SQL Editor** in your Supabase dashboard and execute the entire contents of [`backend/schema.sql`](file:///Users/antriksh.manwadkar/Downloads/sylva-—-living-green/backend/schema.sql).

This provisions:
- `user_profiles` table with automatic signup triggers
- `locations` table with unique slugs and coordinates
- `saved_places` table with `UNIQUE(user_id, place_id)` duplicate prevention
- `journal_entries` table with foreign keys, timestamps, and indexes
- `environmental_readings` historical telemetry cache
- Row Level Security (RLS) policies enforcing user isolation
- Automatic seed data for Singapore's 18 primary reserves

---

## 5. Local Development Startup

### 1. Start the Backend
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server with hot-reload
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API is now accessible at:
- **API Health**: `http://127.0.0.1:8000/api/health`
- **Interactive OpenAPI Docs**: `http://127.0.0.1:8000/docs`
- **Alternative ReDoc**: `http://127.0.0.1:8000/redoc`

### 2. Start the Frontend
In a separate terminal:
```bash
cd /Users/antriksh.manwadkar/Downloads/sylva-—-living-green

# Install frontend dependencies
npm install --legacy-peer-deps

# Start Vite dev server
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 6. Running Automated Tests & Quality Checks

### Backend Automated Pytest Suite
```bash
backend/.venv/bin/pytest backend/tests -v
```
All 16 test cases verify:
- Health check endpoints
- Real-time Data.gov.sg PM2.5 / PSI / Air Temp parsing & validation
- Open-Meteo weather current & 48-hour forecasts
- Locations catalog, search, and category filtering
- Nature Journal CRUD with parameterised operations and user isolation
- Saved places duplicate prevention and user isolation
- Dashboard statistics calculation and baseline fallbacks

### Frontend Type Safety & Production Build
```bash
# TypeScript strict type checking
npm run lint

# Production bundle optimization
npm run build
```

---

## 7. Production Deployment Instructions

### Option A: Containerized Deployment (Docker)
Build and run the unified container or separate services:

```dockerfile
# Example Backend Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ backend/
EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Option B: Deploy Backend to Render / Fly.io / Railway
1. Push repository to GitHub.
2. Create a new Web Service on Render / Fly.io pointing to `backend/main:app`.
3. Set environment variables:
   - `DATABASE_URL`: Your Supabase PostgreSQL URI
   - `SUPABASE_URL`: Your Supabase Project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `CORS_ORIGINS`: Your production frontend domain (e.g. `https://teravia.app`)
4. Build command: `pip install -r backend/requirements.txt`
5. Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

### Option C: Deploy Frontend to Vercel / Cloudflare Pages / Netlify
1. Connect repository to Vercel.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set environment variables:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://api.teravia.app/api`)
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase public anon key
