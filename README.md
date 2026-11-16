# TERAVIA — Interactive Environmental Intelligence Platform

> **"See your world differently."**  
> Explore greener places, discover living ecosystems, and understand the environmental changes shaping the world around you.

TERAVIA is an interactive environmental intelligence platform that unites spatial cartography, microclimate thermodynamics, and citizen field phenology. Initially focused on Singapore, the platform helps students, researchers, nature enthusiasts, travellers, and urban residents explore protected green spaces, monitor localized heat mitigation, and record field observations.

---

## Key Features

1. **Immersive Living Hero & Platform Tour**:
   - Preserved procedural 3D living canopy canvas with shaders, drifting pollen, and landing butterfly.
   - Interactive platform tour with procedural ambient forest audio synthesis, chapter navigation, and soundscape controls.
   - Three interactive floating depth cards linking directly into core modules.

2. **Living Map (Primary Feature)**:
   - Interactive Leaflet cartography with custom dark-forest Voyager map tiles.
   - **18 verified Singapore green spaces** with coordinates, opening hours, descriptions, highlights, monitored flora/fauna, amenities, and accessibility grading.
   - Instant search across names, descriptions, and amenities.
   - Category filtering (*Gardens, Nature Reserves, Parks, Nature Trails, Waterfront Green Spaces*).
   - Split Map/List view toggle and location inspection drawer with external Google Maps directions.
   - Persistent bookmarking with toast notifications.

3. **Environmental Insights Dashboard**:
   - Regional telemetry based on National Environment Agency (NEA) and Meteorological Service Singapore (MSS) station parameters (*Central, North, South, East, West*).
   - Timeframe analysis across **24 Hours**, **7 Days**, and **30 Days**.
   - Interactive multi-point SVG line and area trend charts with hover tooltips and crosshairs.
   - Six key indicators: *Ambient Temperature, Air Quality (PSI), Fine Particulates (PM2.5), Relative Humidity, Canopy Cover, and Vegetation Heat Mitigation Offset*.
   - Live grid sync simulator with loading skeletons and network retry controls.
   - Regional side-by-side comparison mode.

4. **Neighbourhood Explorer**:
   - Multi-district comparison matrix comparing up to three Singapore planning areas (*Marina Bay, Bishan-Ang Mo Kio, Jurong Lake District, Tampines, Woodlands, Queenstown & Kent Ridge*).
   - Evaluates *Park Proximity Index (<400m), Tree Canopy Cover (%), Heat Mitigation Offset (°C), Mean PM2.5, and Park Connector length (km)*.
   - Transparent methodology notes explaining why arbitrary aggregate health scores are avoided in favor of scientific clarity.

5. **Nature Journal**:
   - Citizen field observation logger with local photograph uploads (client-side canvas compression) and curated presets.
   - Fields: Title, Scientific Binomial, Category (*Plants, Birds, Insects, Wildlife, Landscapes, Other*), Location, Date, Weather microclimate, and field notes.
   - High-capacity local storage utilizing **IndexedDB** with resilient **localStorage** fallback.
   - Form validation, instant list updates, edit capabilities, delete confirmations, and JSON backup export.
   - Pre-loaded starter observations (*Crimson Sunbird, Staghorn Fern, Water Monitor, Birdwing Butterfly*).

6. **Saved Places**:
   - Dedicated bookmarking hub for saved green spaces with direct "View on Map" links and one-click removal.

7. **Environmental Stories**:
   - Five long-form editorial articles citing research from NUS, NParks, and atmospheric science publications, complete with article reader views and pull-quotes.

8. **Personal Exploration Dashboard**:
   - Activity companion calculated strictly from local stored data (saved counts, observation domains breakdown, recent entries).

9. **Robust Error Handling & Routing**:
   - Hash-based routing supporting direct URL entry, browser forward/back buttons, and a branded 404 Not Found recovery view.

---

## Technology Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Dev Server**: Vite 8
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens
- **Mapping**: Leaflet 1.9 + CARTO Voyager Tile Layer
- **Icons**: Lucide React
- **Local Persistence**: IndexedDB API + LocalStorage fallback
- **Audio Synthesis**: Web Audio API (ambient forest soundscape)

---

## Running Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Type Checking
```bash
npm run lint
```

### 4. Build for Production
```bash
npm run build
```

---

## Data Governance & Attribution

- **National Environment Agency (NEA) Singapore**: Open Data License for air quality (PSI, PM2.5) station parameters.
- **Meteorological Service Singapore (MSS)**: Historical temperature, humidity, and rainfall baselines.
- **National Parks Board (NParks) Singapore**: Geographic details, trail networks, biodiversity inventories, and park connector lengths.
- **CARTO & OpenStreetMap**: Geographic base map tiles and cartographic attribution.

*Note: All real-time telemetry figures are presented as demonstration baselines adhering to official NEA/MSS schemas and do not represent legally certified meteorological instrumentation.*
