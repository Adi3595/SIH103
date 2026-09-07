# PAIMANA: System Architecture & Technology Stack

This document details the complete end-to-end architecture, technology choices, and data flow of the PAIMANA platform.

---

## 1. High-Level System Architecture

PAIMANA follows a modern decoupled client-server architecture, utilizing a REST API to interface between the React frontend and the FastAPI + Python ML backend.

```
┌──────────────────────┐        JSON via REST        ┌─────────────────────────┐
│     CLIENT TIER      │ ◀─────────────────────────▶ │      SERVER TIER        │
│                      │                             │                         │
│  React 18 + Vite     │                             │  FastAPI (Python 3.11)  │
│  Framer Motion       │                             │  Uvicorn ASGI Server    │
│  Tailwind CSS        │                             │  SQLAlchemy ORM         │
│  React Simple Maps   │                             │  Scikit-Learn (ML)      │
└──────────────────────┘                             └─────────────────────────┘
                                                                  │
                                                                  ▼
                                                     ┌─────────────────────────┐
                                                     │      DATA LAYER         │
                                                     │                         │
                                                     │  SQLite (Relational)    │
                                                     │  Pickled ML Models      │
                                                     │  TopoJSON Geodata       │
                                                     └─────────────────────────┘
```

---

## 2. Frontend Technology Stack

The client application is built to be a high-performance, real-time "Command Center" prioritizing speed and aesthetics (Milky Matte theme).

- **Core Framework:** React 18 + TypeScript. Built using Vite for HMR and optimized production bundling.
- **Styling Engine:** Tailwind CSS v3. Custom theme configuration `tailwind.config.js` with bespoke colors (`teal-600`, `coral-50`, `glass-panel` utilities).
- **Routing:** `react-router-dom` v6 for client-side routing (Dashboard, Projects, Map, Settings).
- **State Management:** React Hooks (`useState`, `useEffect`, `useMemo`). Given the API-heavy nature, state is primarily localized to components handling their own Axios data fetching.
- **Animations:** `framer-motion` for spring physics, layout transitions, and micro-interactions on hover/load.
- **Geospatial Mapping:** `react-simple-maps` (d3-geo under the hood) parsing TopoJSON files for high-performance SVG choropleth mapping.
- **Icons & UI:** `lucide-react` for consistent SVG iconography.

---

## 3. Backend Technology Stack

The server is responsible for routing, database interaction, and serving as the host for the 4-layer ML Risk Engine.

- **Core Framework:** FastAPI. Chosen for its extreme performance (based on Starlette) and native Pydantic validation (auto-generating OpenAPI docs).
- **ASGI Server:** Uvicorn running on Python 3.11 for async request handling.
- **ORM & Database:** SQLAlchemy (Core + ORM) mapping to a local SQLite database (`sih26103.db`). SQLite was chosen for portability in the hackathon prototype, but SQLAlchemy allows zero-code migration to PostgreSQL.
- **Machine Learning:** `scikit-learn` for Random Forest Classifiers and K-Nearest Neighbors. Models are serialized via `joblib`/`pickle`.
- **Data Processing:** `pandas` and `numpy` used extensively in the feature engineering pipeline (`pipeline.py`) to calculate rolling windows, deltas, and variances.
- **Generative AI:** Google's `google-generativeai` SDK interfacing directly with the Native Gemini API (Gemini Flash) for the Layer 04C Prescriptive engine, replacing the legacy OpenRouter implementation.
- **Performance:** SQLAlchemy `joinedload` is explicitly utilized to eagerly load relational data, resolving critical N+1 query latency issues on heavy endpoints like the Geospatial map.

---

## 4. Database Schema & Data Flow

The database contains three primary tables mimicking a highly normalized governmental infrastructure tracking system.

1. **`projects` Table:**
   - **Fields:** `internal_project_id` (PK), `project_name`, `ministry`, `sector`, `state`, `original_cost_cr`, `revised_cost_cr`, `original_end_date`, `revised_end_date`.
   - **Purpose:** Static registry of all assets.

2. **`project_snapshots` Table:**
   - **Fields:** `snapshot_id` (PK), `internal_project_id` (FK), `reporting_month`, `physical_progress_pct`, `financial_expenditure_cr`, `milestones_completed`, `active_issues_count`.
   - **Purpose:** The raw time-series data reported by on-ground contractors every month.

3. **`project_features` Table:**
   - **Fields:** 19 engineered float columns (e.g., `progress_velocity`, `delay_momentum`, `issue_pressure`).
   - **Purpose:** The ML-ready vectors. Generated offline by iterating through `project_snapshots` and calculating temporal derivatives. This prevents the FastAPI server from doing heavy pandas dataframe calculations on the fly.

### End-to-End Request Flow Example (Project Detail Page)
1. **Frontend:** User clicks a project in the Priority Table. React Router navigates to `/projects/PAI-00001`.
2. **Frontend:** Component mounts, fires concurrent `axios.get` requests for:
   - `/api/projects/PAI-00001` (Basic Data)
   - `/api/projects/PAI-00001/fingerprint` (Layer 1)
   - `/api/projects/PAI-00001/momentum` (Layer 3)
   - `/api/projects/PAI-00001/predictions` (Layer 4A)
3. **Backend:** FastAPI receives the requests.
4. **Backend DB:** SQLAlchemy queries the `project_features` table for the latest row for `PAI-00001`.
5. **Backend ML:** The row is passed to the Singletons:
   - `RiskEngine.generate_fingerprint()`
   - `PredictiveEngine.predict()` (Loads `.pkl` into memory, calls `.predict_proba()`)
6. **Backend Response:** Pydantic serializes the Python dictionaries into JSON.
7. **Frontend:** React updates state, triggering Framer Motion to animate the charts and display the data.
