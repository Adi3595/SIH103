# SIH26103 — AI-Powered Predictive & Prescriptive Infrastructure Monitoring System

> **Smart India Hackathon 2025 — Problem Statement 26103**

A national infrastructure project monitoring platform powered by a composite risk engine, digital project fingerprinting, and an AI intelligence layer (Phase 5).

---

## ⚠️ Disclaimer

> **SYNTHETIC DATA — NOT OFFICIAL PAIMANA/MoSPI DATA**
> All project data used in this prototype is synthetically generated for demonstration purposes only.

---

## 🏗️ Architecture

```
Proto/
├── backend/        # FastAPI + SQLAlchemy + Risk Engine
│   ├── app/
│   │   ├── api/        # REST API routes
│   │   ├── core/       # Database config
│   │   ├── ml/         # Risk Engine (rule-based scoring)
│   │   ├── models/     # SQLAlchemy models
│   │   └── schemas/    # Pydantic schemas
│   └── data/           # Synthetic dataset (CSV files)
└── frontend/       # React + TypeScript + Vite + Tailwind
    └── src/
        ├── components/ # Layout, Dashboard, Risk, Chart components
        └── pages/      # Dashboard, Projects, Priorities, Analytics...
```

---

## 🚀 Getting Started

### Backend (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python scripts/seed_database.py   # Load synthetic data
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Frontend (Vite + React)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🎯 Features Implemented

- **Phase 1** Data Foundation — 750 synthetic projects, 18,000 monthly snapshots
- **Phase 2** Risk Engine — Composite scoring, momentum tracking, digital fingerprinting
- **Phase 3** REST API — FastAPI endpoints for projects, fingerprints, dashboard summary
- **Phase 4** Frontend — Command Center UI (React + Tailwind + Framer Motion)
- **Phase 5** LLM/RAG Intelligence Layer — Planned

---

## 🎨 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic |
| Database | SQLite (prototype) |
| ML/Risk | Rule-based composite scoring engine |
