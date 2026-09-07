# PAIMANA — Project Analytics & Intelligence for Monitoring National Assets

<div align="center">

```
██████╗  █████╗ ██╗███╗   ███╗ █████╗ ███╗   ██╗ █████╗
██╔══██╗██╔══██╗██║████╗ ████║██╔══██╗████╗  ██║██╔══██╗
██████╔╝███████║██║██╔████╔██║███████║██╔██╗ ██║███████║
██╔═══╝ ██╔══██║██║██║╚██╔╝██║██╔══██║██║╚██╗██║██╔══██║
██║     ██║  ██║██║██║ ╚═╝ ██║██║  ██║██║ ╚████║██║  ██║
╚═╝     ╚═╝  ╚═╝╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝
```

**AI-Powered Command Center for National Infrastructure Risk Intelligence**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python)](https://python.org)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4-F7931E?style=for-the-badge&logo=scikit-learn)](https://scikit-learn.org)
[![SQLite](https://img.shields.io/badge/SQLite-9.1MB-003B57?style=for-the-badge&logo=sqlite)](https://sqlite.org)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](LICENSE)

> **SIH 2026 · Problem Statement 26103**  
> *Designed for the Ministry of Statistics and Programme Implementation (MoSPI)*

</div>

---

## ⚡ What is PAIMANA?

PAIMANA is a **full-stack, AI-driven intelligence platform** that helps government officials monitor, predict, and intervene in at-risk national infrastructure projects. It processes data from 750+ projects across 20 Indian states and runs **four ML layers** to surface risk before it becomes a crisis.

```
┌─────────────────────────────────────────────────────────────────┐
│                        PAIMANA ENGINE                           │
│                                                                 │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌───────────┐  │
│  │ LAYER 01 │──▶│ LAYER 02 │──▶│ LAYER 03 │──▶│ LAYER 04  │  │
│  │ Digital  │   │Historical│   │  Risk    │   │Predictive │  │
│  │Fingerprint│  │Analogues │   │ Momentum │   │   + AI    │  │
│  │ (Rules)  │   │  (KNN)   │   │  (Δ/t)  │   │(RF + LLM) │  │
│  └──────────┘   └──────────┘   └──────────┘   └───────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎬 Live Demo

| Page | Description |
|------|-------------|
| **Dashboard** | KPI command center — critical, high, rising risk counts |
| **Projects** | Full searchable/filterable table of all 750 projects |
| **Project Dossier** | Per-project deep dive with all 4 ML layers |
| **Rising Risk** | Momentum-sorted early warning tracker |
| **Priority Queue** | Projects grouped by urgency requiring intervention |
| **Analytics** | Portfolio-level charts and risk distribution |
| **🗺️ Geospatial Map** | Interactive India choropleth — hover for live state stats |

---

## 🏗️ System Architecture

```
                        ┌─────────────────────────────┐
                        │         BROWSER              │
                        │   React 18 + Vite + TW CSS  │
                        │                             │
                        │  ┌────────┐  ┌───────────┐  │
                        │  │  Pages │  │ Components│  │
                        │  └────┬───┘  └─────┬─────┘  │
                        └───────┼────────────┼─────────┘
                                │   axios    │
                        ┌───────▼────────────▼─────────┐
                        │       FastAPI Backend         │
                        │       Port 8000              │
                        │                             │
                        │  ┌────────────────────────┐  │
                        │  │     API Router          │  │
                        │  │  /projects, /dashboard  │  │
                        │  │  /predictions, /map...  │  │
                        │  └───────────┬─────────────┘  │
                        │             │                 │
                        │  ┌──────────▼──────────────┐  │
                        │  │     ML Risk Engine       │  │
                        │  │  engine · momentum       │  │
                        │  │  analogues · predictive  │  │
                        │  │  prescriptive (Gemini AI)│  │
                        │  └──────────┬──────────────┘  │
                        │             │                 │
                        │  ┌──────────▼──────────────┐  │
                        │  │  SQLite DB + .pkl Models │  │
                        │  │  sih26103.db (9MB)       │  │
                        │  └─────────────────────────┘  │
                        └─────────────────────────────┘
```

---

## 🧠 The 4 Intelligence Layers

### Layer 01 — Digital Fingerprint `engine.py`
> Rule-based multi-dimensional health scoring

Converts raw project snapshot data into a **5-dimension health vector** scored 0–100:

| Dimension | Formula Logic |
|-----------|--------------|
| `progress_health` | Completion ratio vs. time elapsed, velocity |
| `financial_health` | Expenditure ratio, cost-progress divergence |
| `schedule_health` | Time overrun %, delay momentum |
| `milestone_health` | Milestone completion rate, delay rate |
| `overall_risk_score` | Weighted composite (0–100 scale) |

---

### Layer 02 — Historical Analogues `analogues.py`
> KNN-based pattern matching against completed project history

Finds the **3 most similar past projects** using Euclidean distance across the fingerprint vector. Surfaces:
- Whether similar projects succeeded or overran
- Average cost/schedule overrun of analogues
- Similarity score

---

### Layer 03 — Risk Momentum `momentum.py`
> Time-series acceleration detection

Computes the **rate of change** of each dimension over the last 3 months:
- `overall_momentum` = Δ risk_score / time
- Classifies as: `ACCELERATING > RISING > ELEVATED > STABLE`
- Surfaces the **fastest deteriorating dimension**

---

### Layer 04A — Predictive ML `predictive.py`
> 4 Random Forest classifiers trained on 18,000 row snapshots

| Model | Target | Threshold |
|-------|--------|-----------|
| `cost_overrun_model.pkl` | P(cost > 110%) | 0.35 |
| `schedule_delay_model.pkl` | P(delay > 90 days) | 0.30 |
| `milestone_failure_model.pkl` | P(milestone miss) | 0.25 |
| `escalation_model.pkl` | P(rapid escalation) | 0.30 |

All models use `class_weight='balanced'` to handle label skew.

---

### Layer 04C — Prescriptive AI `prescriptive.py`
> LLM-generated actionable recommendations via Google Gemini API

Uses **Gemini Flash (2.5/3.0/3.5)** with an automated fallback loop to generate structured interventions:
- Root cause analysis
- 3-5 specific action items
- Escalation recommendation

---

## 📁 Project Structure

```
Proto/
├── 📂 backend/
│   ├── 📂 app/
│   │   ├── 📂 api/
│   │   │   └── router.py          # All FastAPI endpoints
│   │   ├── 📂 core/
│   │   │   └── database.py        # SQLAlchemy engine + session
│   │   ├── 📂 ml/
│   │   │   ├── 📂 features/       # Feature engineering pipeline
│   │   │   ├── 📂 models/         # Trained .pkl files
│   │   │   └── 📂 risk_engine/
│   │   │       ├── engine.py      # Layer 01: Fingerprint
│   │   │       ├── analogues.py   # Layer 02: KNN Analogues
│   │   │       ├── momentum.py    # Layer 03: Momentum
│   │   │       ├── predictive.py  # Layer 04A: RF Classifiers
│   │   │       └── prescriptive.py# Layer 04C: LLM Advisor
│   │   ├── 📂 models/             # SQLAlchemy ORM models
│   │   ├── 📂 schemas/            # Pydantic response schemas
│   │   └── main.py                # FastAPI app entry point
│   ├── train_models.py            # Retrain all 4 RF models
│   └── sih26103.db                # SQLite database (9MB)
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📂 pages/              # Full-page route components
│   │   ├── 📂 components/
│   │   │   ├── 📂 layout/         # Sidebar, PageContainer
│   │   │   ├── 📂 dashboard/      # KPI cards, charts
│   │   │   ├── 📂 risk/           # Fingerprint, Momentum, etc.
│   │   │   ├── 📂 charts/         # Timeline chart
│   │   │   └── 📂 ui/             # Skeleton, ErrorState
│   │   ├── index.css              # Milky Matte design tokens
│   │   └── App.tsx                # Router + layout
│   ├── 📂 public/
│   │   └── india_states.json      # TopoJSON for map view
│   └── tailwind.config.js
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### 1. Clone & Setup Backend

```bash
git clone https://github.com/Adi3595/SIH103.git
cd SIH103/backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate          # Windows
# source venv/bin/activate       # macOS/Linux

# Install dependencies
pip install fastapi uvicorn sqlalchemy alembic scikit-learn pandas numpy requests python-dotenv pydantic

# Configure environment
cp .env.example .env
# Edit .env — add your GEMINI_API_KEY
```

### 2. Initialize Database

```bash
# Run migrations
alembic upgrade head

# The SQLite DB is already included at sih26103.db
# If you need to re-seed, run:
python app/scripts/run_feature_pipeline.py
```

### 3. Train ML Models (optional — pre-trained .pkl included)

```bash
python train_models.py
# Creates 4 model + 4 scaler .pkl files in app/ml/models/
```

### 4. Start Backend

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
# API docs at http://127.0.0.1:8000/docs
```

### 5. Setup & Start Frontend

```bash
cd ../frontend
npm install
npm run dev
# App at http://localhost:5173
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects` | List all projects (paginated) |
| `GET` | `/api/projects/{id}` | Single project details |
| `GET` | `/api/projects/geospatial` | State-level aggregated stats |
| `GET` | `/api/projects/{id}/fingerprint` | Layer 01: Health dimensions |
| `GET` | `/api/projects/{id}/momentum` | Layer 03: Risk momentum report |
| `GET` | `/api/projects/{id}/analogues` | Layer 02: KNN similar projects |
| `GET` | `/api/projects/{id}/predictions` | Layer 04A: ML risk probabilities |
| `GET` | `/api/projects/{id}/prescription` | Layer 04C: AI recommendations |
| `GET` | `/api/dashboard/summary` | KPI summary + top priorities |
| `GET` | `/api/dashboard/rising` | Rising risk portfolio |

**Full interactive docs:** http://127.0.0.1:8000/docs

---

## 🎨 Design System

PAIMANA uses a **Milky Matte** aesthetic:

| Token | Value | Usage |
|-------|-------|-------|
| `glass-panel` | `bg-white/80 backdrop-blur-xl border border-white/60` | Card containers |
| `glass-card` | `bg-white/60 backdrop-blur-lg rounded-2xl shadow-soft` | Sidebar |
| `text-slate-800` | Dark slate | Primary text |
| `teal-600` (#0d9488) | Teal | Primary accent |
| `coral` (#F4725A) | Coral | Critical alerts |
| `amber` | Amber | Warnings |

---

## 🗺️ Environment Variables

```env
# backend/.env
GEMINI_API_KEY=your_gemini_api_key_here

# Optional — defaults shown
DATABASE_URL=sqlite:///./sih26103.db
```

---

## 🧪 Dataset

| Table | Records | Description |
|-------|---------|-------------|
| `projects` | 750 | Master project registry |
| `project_snapshots` | 18,000 | Monthly reporting snapshots |
| `project_features` | 18,000 | Engineered ML feature rows |

> ⚠️ **Synthetic Dataset** — Generated for SIH prototype validation.  
> Not official PAIMANA/MoSPI data.

---

## 👥 Team

**SIH 2026 — Team SIH26103**

Built with ❤️ for the **Smart India Hackathon 2026**  
Problem Statement: *AI-Based Risk Assessment for Central Sector Projects*  
Ministry: *MoSPI (Ministry of Statistics and Programme Implementation)*

---

## 📄 License

MIT License — see [LICENSE](LICENSE)

---

<div align="center">

**[⬆ Back to Top](#paimana--project-analytics--intelligence-for-monitoring-national-assets)**

*If this project helped you, please ⭐ the repo!*

</div>
