# System Architecture — Nirikshan

> SIH 2026 · Problem Statement 26103

---

## Deployment Architecture

```
┌──────────────────────────────────────────────────────┐
│                  VERCEL CDN (Frontend)               │
│          React 18 + Vite + Tailwind CSS              │
│         https://nirikshan103.vercel.app              │
│                                                      │
│  Security: CSP · HSTS · X-Frame-Options              │
│  Caching: Static assets cached 1 year (immutable)    │
└──────────────────────┬───────────────────────────────┘
                       │ HTTPS (TLS 1.3)
                       │ axios + VITE_API_URL env var
┌──────────────────────▼───────────────────────────────┐
│               RENDER (Backend API)                   │
│         FastAPI + Uvicorn (Python 3.11)              │
│           https://sih103.onrender.com                │
│                                                      │
│  Security: Rate limiting · Security headers           │
│            CORS allowlist · Server header removed    │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │     API Router  /api/*                          │ │
│  │  dashboard · projects · predictions              │ │
│  │  geospatial · ingestion · prescriptions         │ │
│  └────────────────────┬────────────────────────────┘ │
│                       │                              │
│  ┌────────────────────▼────────────────────────────┐ │
│  │           ML Risk Engine                        │ │
│  │  Layer 01: Digital Fingerprint (Rules)          │ │
│  │  Layer 02: Historical Analogues (KNN)           │ │
│  │  Layer 03: Risk Momentum (Time-series Δ)        │ │
│  │  Layer 04: Random Forest + Gemini AI            │ │
│  └────────────────────┬────────────────────────────┘ │
│                       │                              │
│  ┌────────────────────▼────────────────────────────┐ │
│  │     SQLAlchemy ORM  (parameterised queries)     │ │
│  └────────────────────┬────────────────────────────┘ │
└───────────────────────┼──────────────────────────────┘
                        │ PostgreSQL SSL
┌───────────────────────▼──────────────────────────────┐
│              SUPABASE (PostgreSQL)                   │
│  projects · project_snapshots · milestones · issues  │
│  Auto-created on startup via SQLAlchemy create_all   │
└──────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### Frontend (React + Vite)

| Directory | Purpose |
|-----------|---------|
| `src/pages/` | Route-level page components (Dashboard, MapView, Projects, etc.) |
| `src/components/` | Reusable UI components (charts, risk panels, layout) |
| `src/config/api.ts` | Centralised API base URL — reads `VITE_API_URL` from env |
| `public/logo.png` | Nirikshan brand logo |
| `vercel.json` | SPA routing + security headers for Vercel |

**Key Libraries:**
- `framer-motion` — page and component animations
- `react-simple-maps` + `d3-scale` — India choropleth map
- `react-tooltip` — hover tooltips on map
- `recharts` — analytics charts
- `react-router-dom` — client-side routing

---

### Backend (FastAPI)

| File | Purpose |
|------|---------|
| `app/main.py` | App factory, middleware stack, startup hook |
| `app/api/router.py` | All REST API endpoints |
| `app/core/database.py` | SQLAlchemy engine + session factory |
| `app/models/` | ORM model definitions (Project, Snapshot, Milestone, Issue) |
| `app/ml/risk_engine/` | 4-layer ML intelligence engine |

**Middleware Stack (in order):**
1. `SecurityHeadersMiddleware` — injects all security headers
2. `CORSMiddleware` — allows only known origins
3. `Limiter` (slowapi) — rate limiting per IP

---

### ML Engine

```
risk_engine/
├── engine.py         # Layer 01: Digital Fingerprint (5D rule-based scoring)
├── analogues.py      # Layer 02: KNN Historical Pattern Matching
├── momentum.py       # Layer 03: Time-series Risk Velocity (Δ score / Δ time)
├── predictive.py     # Layer 04a: Random Forest Classifier (.pkl model)
└── prescriptive.py   # Layer 04b: Gemini Flash 2.0 AI Prescriptions
```

**Risk Score Scale:** 0–100  
- 0–30: Low Risk (green)
- 31–50: Medium Risk (yellow)
- 51–75: High Risk (orange)
- 76–100: Critical Risk (red)

---

### Database Schema

```sql
-- Master project data
projects (
  id, project_name, ministry, sector, state,
  total_cost_cr, start_date, expected_end_date,
  current_progress_pct, risk_category, risk_score
)

-- Periodic health snapshots (ML training source)
project_snapshots (
  id, project_id, snapshot_date,
  progress_pct, expenditure_cr,
  schedule_delay_months, issues_count
)

-- Milestone tracking
milestones (
  id, project_id, name, target_date,
  actual_date, status
)

-- Issue registry
issues (
  id, project_id, issue_type,
  severity, description, raised_date, resolved_date
)
```

> All tables are **auto-created on first startup** — no manual migration needed.

---

## Data Flow

```
CSV Upload (Data Ingestion page)
        │
        ▼
FastAPI /api/ingestion/upload
        │ (list[UploadFile] — multiple files)
        ▼
pandas read_csv → SQLAlchemy bulk insert
        │
        ▼
Supabase PostgreSQL tables
        │
        ▼
ML Engine computes fingerprint + risk scores
        │
        ▼
React Dashboard renders real-time intelligence
```

---

## Environment Variables

### Backend (Render)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Supabase) |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `PYTHON_VERSION` | `3.11.0` |

### Frontend (Vercel)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (baked into `.env.production`) |
