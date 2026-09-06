# SIH26103 — Technical Documentation

> A reference guide for everything being built. Read this to understand **why** each piece exists, **what** it does, and **how** it fits the whole system.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Data Foundation](#2-data-foundation)
3. [Layer 01 — Digital Fingerprint](#3-layer-01--digital-fingerprint)
4. [Layer 02 — Historical Analogues](#4-layer-02--historical-analogues)
5. [Layer 03 — Risk Momentum](#5-layer-03--risk-momentum)
6. [Layer 04 — Prediction & Prescription](#6-layer-04--prediction--prescription)
7. [API Reference](#7-api-reference)
8. [Frontend Pages & Components](#8-frontend-pages--components)
9. [ML Models Reference](#9-ml-models-reference)
10. [Glossary](#10-glossary)

---

## 1. System Overview

### What This System Does

PAIMANA reports flow in monthly as PDFs and Excel files from 1,500+ infrastructure project managers across India. A human reviewer must read these, spot anomalies, and decide which projects need attention.

Our system **automates this intelligence pipeline**:

```
PAIMANA Reports (PDF/Excel)
         │
         ▼
   Data Ingestion & Feature Engineering
         │
         ▼
   ┌─────────────────────────────────────────┐
   │           Intelligence Engine           │
   │                                         │
   │  L01: Digital Fingerprint               │
   │       → What is the project's           │
   │         current health profile?         │
   │                                         │
   │  L02: Historical Analogues              │
   │       → What happened to similar        │
   │         projects in the past?           │
   │                                         │
   │  L03: Risk Momentum                     │
   │       → Is risk rising faster           │
   │         than normal?                    │
   │                                         │
   │  L04: Prediction + Prescription         │
   │       → ML forecast + LLM advice        │
   │         with evidence                   │
   └─────────────────────────────────────────┘
         │
         ▼
   Command Center Dashboard
   (Web UI for reviewers & ministry officials)
```

### Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Data Store | SQLite → PostgreSQL (prod) | Simple for prototype, scalable |
| Backend API | FastAPI (Python) | Async, auto-docs, type-safe |
| ML Models | scikit-learn (RandomForest, GradientBoosting) | Interpretable, fast, proven |
| Explainability | SHAP | Industry standard for ML explanations |
| LLM | Google Gemini 1.5 Flash | Free tier, fast, structured output |
| Vector DB | ChromaDB | Local, no server needed, fast embeddings |
| Embeddings | sentence-transformers/all-MiniLM-L6-v2 | 80MB, runs offline |
| Frontend | React 18 + TypeScript + Vite | Fast dev, type-safe UI |
| Styling | Tailwind CSS + Framer Motion | Professional animations |
| Charts | Recharts | React-native, composable |

---

## 2. Data Foundation

### Datasets (Synthetic, mirroring real PAIMANA)

| File | Rows | Description |
|---|---|---|
| `D01_projects.csv` | 750 | Project master: ministry, sector, state, cost, dates |
| `D02_project_snapshots.csv` | 18,000 | Monthly snapshots: progress %, expenditure %, delay |
| `D03_milestones.csv` | ~6,200 | Milestone events with planned vs actual dates |
| `D04_issues.csv` | ~9,300 | Issue records with type, severity, resolution |
| `D05_project_outcomes.csv` | ~709 | Final outcomes: COMPLETED / STALLED / ABANDONED |
| `D06_project_identity_map.csv` | 750 | Maps synthetic IDs to sector/ministry metadata |
| `D07_historical_failure_cases.csv` | varies | Documented failure case studies |
| `D08_risk_predictions.csv` | placeholder | Will hold ML model outputs |
| `D09_source_documents.csv` | 751 | Document provenance tracking |
| `D10_data_quality_events.csv` | varies | Data quality flags |
| `D11_sector_performance_indicators.csv` | placeholder | Sector-level benchmarks |

### Feature Engineering

Raw snapshots are converted into **engineered features** stored in `project_features` table:

| Feature | Source | Formula | Meaning |
|---|---|---|---|
| `progress_variance_pct` | D02 | `actual_progress - planned_progress` | How far behind/ahead of plan |
| `financial_physical_divergence` | D02 | `expenditure_pct - progress_pct` | Spending faster than building |
| `time_overrun_pct` | D02 | `elapsed_days / planned_duration - 1` | How much extra time taken |
| `milestone_completion_ratio` | D03 | `milestones_met / total_milestones` | Milestone achievement rate |
| `issue_pressure` | D04 | `weighted_open_issues / period` | Density of unresolved problems |
| `risk_score` | Computed | Weighted composite (0–100) | Overall risk level |
| `risk_momentum` | Computed | `risk_score_now - risk_score_3mo_ago` | Direction and speed of risk change |

---

## 3. Layer 01 — Digital Fingerprint

### Concept

A fingerprint is a **5-dimensional health profile** of a project at a specific moment. Unlike a single number, it tells you *how* a project is unhealthy.

### The 5 Health Dimensions

```
PROGRESS HEALTH ████████░░ 80%    ← How close to plan?
FINANCIAL HEALTH ██████░░░░ 60%   ← Cost vs progress alignment?
SCHEDULE HEALTH  ████░░░░░░ 40%   ← Time overrun severity?
MILESTONE HEALTH █████████░ 90%   ← Milestones being hit?
ISSUE PRESSURE   ████████░░ 78%   ← (inverted) Issue severity?
```

### The "Dynamic" Part — Trajectory

A fingerprint is computed for **each of the 24 reporting months**. Plotting all 24 reveals the trajectory:

```
Progress Health over time:
  100 ┤
   80 ┤   ●──●──●
   60 ┤            ●──●
   40 ┤                  ●──●──●   ← Project deteriorating
   20 ┤                            ●
    0 └──────────────────────────────→ Month
        1   4   8   12  16  20  24
```

This trajectory is what makes Layer 02 (analogues) and Layer 04 (prediction) possible.

### Code Location

| File | Purpose |
|---|---|
| `backend/app/ml/risk_engine/engine.py` | Computes all 5 dimensions + risk score/level |
| `backend/app/models/feature.py` | SQLAlchemy model for feature storage |
| `backend/app/api/router.py` | `/projects/{id}/fingerprint` endpoint |
| `frontend/src/components/risk/DigitalFingerprint.tsx` | Health bar UI |
| `frontend/src/components/charts/ProjectTimeline.tsx` | 24-month trajectory chart |

### API

```
GET /api/projects/{id}/fingerprint
→ Returns the LATEST fingerprint (current status)

GET /api/projects/{id}/fingerprint/history    [TO BUILD]
→ Returns all 24 monthly fingerprints for trend plotting
```

---

## 4. Layer 02 — Historical Analogues

### Concept

> *"Your project looks like 8 previous projects. Here's what happened to them."*

This is **Case-Based Reasoning** — a proven AI technique used in medicine, law, and engineering. Rather than applying generic rules, it finds similar historical cases and uses their known outcomes as evidence.

### How the Algorithm Works

**Step 1 — Vectorize current project**
```python
current_vector = [
    progress_variance_pct,      # e.g. -0.28 (28% behind plan)
    financial_physical_divergence, # e.g. 0.34 (spending 34% ahead of progress)
    time_overrun_pct,           # e.g. 0.42 (42% over time)
    milestone_completion_ratio, # e.g. 0.51
    issue_pressure              # e.g. 23.4
]
```

**Step 2 — Search historical database**
```python
# From all 18,000 project-month records that have known outcomes
# find the K=10 most similar vectors using cosine similarity
neighbours = knn.find(current_vector, k=10)
```

**Step 3 — Aggregate outcomes**
```python
outcomes = [neighbour.outcome for neighbour in neighbours]
# → ["STALLED", "COMPLETED", "STALLED", "STALLED", "ABANDONED", ...]
stall_rate = outcomes.count("STALLED") / len(outcomes)  # → 0.70
```

**Step 4 — Report**
```
Historical Analogues Found: 10 similar projects
  - 7 ultimately stalled
  - 2 completed with 35–60% cost overrun
  - 1 was abandoned
  Average additional delay: 14 months
  Average cost overrun: 41%
```

### Why This Matters for Our Problem Statement

Current government systems flag projects based on absolute thresholds: "if progress < 50%, flag red."

Our system says: "A project at 65% progress is still HIGH RISK because the combination of 34% financial-physical divergence + 18-month delay + low milestone completion is identical to the trajectory of 7 past projects that stalled."

This is **predictive** rather than **reactive**.

### Code Location (To Build)

| File | Purpose |
|---|---|
| `backend/app/ml/analogues/analogue_engine.py` | KNN search + outcome aggregation |
| `backend/app/ml/analogues/vector_store.py` | Pre-computes and caches feature vectors |
| `backend/app/api/router.py` | `/projects/{id}/analogues` endpoint |
| `frontend/src/components/risk/HistoricalAnalogues.tsx` | UI panel showing peer comparison |

---

## 5. Layer 03 — Risk Momentum

### Concept

Two projects can have the same risk score of 65. But one has been stable at 65 for 6 months. The other was at 30 six months ago, 42 three months ago, and is now at 65.

**The second project is far more dangerous.** Its trajectory shows acceleration.

Risk Momentum detects this acceleration.

### Signals

| Signal | Calculation | Meaning |
|---|---|---|
| **Score Momentum** | `score_now - score_3mo_ago` | Overall risk velocity |
| **Dimension Momentum** | Per health dimension: `dim_now - dim_3mo_ago` | Which specific dimension is failing fastest |
| **Peer-Relative Momentum** | `project_momentum - sector_avg_momentum` | Deteriorating faster than its peers? |
| **Acceleration** | `momentum_now - momentum_last_period` | Is the deterioration speeding up? |

### Early Warning Classification

```
Score Momentum > +15  →  🔴 ACCELERATING   Immediate Review Required
Score Momentum +5–15  →  🟠 RISING         Weekly Monitoring
Score Momentum -5–+5  →  🟡 STABLE         Normal Monthly Review
Score Momentum < -5   →  🟢 IMPROVING      Document as Best Practice
```

### Dimension Momentum — Which Part is Failing?

This is what makes prescriptions specific:

```
Project PAI-00427:
  Overall Momentum: +12.4  →  RISING

  Dimension Breakdown:
    Progress Health:  -2.1   (stable)
    Financial Health: -18.4  ← COLLAPSING
    Schedule Health:  -4.1   (slight decline)
    Milestone Health: -1.2   (stable)
    Issue Pressure:   +14.3  ← SURGING

  Conclusion: Financial divergence and issue density are the accelerating factors.
  The LLM prescription should focus on financial audit and issue resolution.
```

### Code Location

| File | Purpose |
|---|---|
| `backend/app/ml/risk_engine/engine.py` | Basic `risk_momentum` already calculated |
| `backend/app/ml/risk_engine/momentum.py` | [TO BUILD] Dimension-level momentum |
| `frontend/src/pages/RisingRisk.tsx` | Rising risk page (exists) |
| `frontend/src/components/risk/MomentumChart.tsx` | [TO BUILD] Dimension trend chart |

---

## 6. Layer 04 — Prediction & Prescription

### Overview

Layer 04 has three sub-systems that work in sequence:

```
Feature Vector
     │
     ▼
[4A] ML Prediction          ← "What will happen?"
     │
     ▼
[4B] SHAP Explanation       ← "Why does the model think that?"
     │
     ▼
[4C] LLM Prescription       ← "What should a reviewer do?"
          │
          ├─── Structured recommendation
          └─── RAG-augmented Q&A
```

---

### 4A — ML Prediction Models

**Three models, trained on historical data:**

#### Model 1: Completion Risk Classifier
- **Question:** Will this project complete successfully?
- **Output:** `LIKELY_COMPLETE` | `AT_RISK` | `LIKELY_FAIL`
- **Algorithm:** Random Forest Classifier
- **Training data:** Feature vectors from Month 12–18 of projects that have known outcomes in D05
- **Why Random Forest?** Handles mixed features, robust to outliers, provides feature importances

#### Model 2: Cost Overrun Classifier  
- **Question:** How much will this project exceed its original budget?
- **Output:** `ON_BUDGET` | `MODERATE_OVERRUN (20-50%)` | `SEVERE_OVERRUN (50%+)`
- **Algorithm:** Gradient Boosting Classifier
- **Training data:** Projects with known final costs vs original sanctioned cost

#### Model 3: Delay Regressor
- **Question:** How many additional months of delay should be expected?
- **Output:** Float (months)
- **Algorithm:** Gradient Boosting Regressor

**Model Performance Targets (on 80/20 train-test split):**
- Completion Risk: AUC > 0.80
- Cost Overrun: Accuracy > 70%
- Delay: MAE < 3 months

---

### 4B — SHAP Explainability

SHAP (SHapley Additive exPlanations) tells us which features contributed to a prediction and by how much.

**Example SHAP output for PAI-00427:**
```json
{
  "prediction": "LIKELY_FAIL",
  "confidence": 0.84,
  "shap_values": {
    "financial_physical_divergence": +0.31,
    "schedule_progress_gap": +0.24,
    "milestone_completion_ratio": -0.18,
    "issue_pressure": +0.12,
    "progress_velocity": -0.08
  },
  "explanation": "Financial-physical divergence is the single largest risk driver"
}
```

These SHAP values feed directly into the LLM prompt, making the prescription evidence-backed rather than generic.

---

### 4C — LLM Prescription (Gemini)

**What gets sent to Gemini:**
1. Project metadata (name, ministry, sector, location)
2. Latest fingerprint (5 health dimensions)
3. ML prediction (completion risk, cost overrun risk, delay)
4. SHAP values (which features drove the prediction)
5. Historical analogues (what happened to similar projects)
6. Risk momentum (which dimensions are deteriorating fastest)

**Prompt Structure:**
```
You are PAIMANA-AI, an advisor to the Ministry of Statistics and Programme 
Implementation, Government of India.

A project monitoring alert has been triggered. Based on the evidence below, 
provide a structured prescriptive analysis.

PROJECT CONTEXT:
  Name: [project_name]
  Ministry: [ministry]
  Sector: [sector]
  
RISK ASSESSMENT:
  Risk Score: [score] ([level])
  Momentum: [momentum] ([RISING/STABLE/IMPROVING])
  
KEY RISK DRIVERS (evidence-based):
  [SHAP values as bullet points]

HISTORICAL CONTEXT:
  [K/10 similar past projects had this outcome]
  [Average cost overrun: X%]

Based solely on the evidence above, respond in this exact JSON structure:
{
  "executive_summary": "2 sentences max",
  "investigate_immediately": ["item 1", "item 2", "item 3"],
  "recommended_actions": [{"action": "...", "rationale": "..."}],
  "urgency": "IMMEDIATE | HIGH | MODERATE"
}
```

**What the prescription looks like in the UI:**

```
⚠ PAIMANA-AI PRESCRIPTION — PAI-00427

EXECUTIVE SUMMARY
This national highway project shows accelerating financial-physical 
divergence (+34%) driven by contractor payment delays, while milestone 
completion has dropped to 42%, consistent with the trajectory of 7 
historically similar projects that ultimately stalled.

INVESTIGATE IMMEDIATELY
  📋 Contractor payment records for the last 6 months
  📋 Physical verification report for the last 2 quarters  
  📋 Open issue resolution timeline

RECOMMENDED ACTIONS
  1. Commission an independent physical progress audit
     Rationale: Financial-physical divergence of this magnitude (34%) 
     is historically the strongest predictor of stalling (SHAP: +0.31)
  
  2. Escalate to Ministry-level review
     Rationale: 7/10 similar projects that reached this momentum point 
     did not self-correct without external intervention
```

---

### 4D — RAG Q&A (Intelligence Chat)

**What is RAG?**

RAG = Retrieval-Augmented Generation. Instead of asking the LLM to answer from memory, we first **retrieve relevant project data** and then ask the LLM to answer **based on that data**.

**How it works:**

```
User Question: "Which road projects have the highest financial risk?"
         │
         ▼
  Embed question as a vector
         │
         ▼
  Search ChromaDB for similar project document chunks
         │
         ▼
  Retrieve top-5 relevant project summaries
         │
         ▼
  Send: [question] + [retrieved project data] → Gemini
         │
         ▼
  Answer: "The road projects with highest financial risk are PAI-00427 
           (34% divergence), PAI-00183 (29% divergence), and PAI-00612 
           (27% divergence). All three show..."
```

**What gets stored in ChromaDB:**

For each project, a text "document" is generated:
```
PROJECT: PAI-00427
SECTOR: Roads & Highways | MINISTRY: MoRTH | STATE: Rajasthan
CURRENT STATUS: HIGH RISK (Score: 67.4)
FINGERPRINT: Progress Health 45, Financial Health 34, Schedule Health 28
TRAJECTORY: Deteriorating for 6 consecutive months
ANALOGUES: Similar to 7 past projects, 5 of which stalled
KEY ISSUES: Contractor delays, land acquisition pending, monsoon disruption
MOMENTUM: +12.4 (RISING)
```

---

## 7. API Reference

### Existing Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/projects` | List all projects (paginated) |
| GET | `/api/projects/{id}` | Project detail |
| GET | `/api/projects/{id}/fingerprint` | Latest fingerprint |
| GET | `/api/dashboard/summary` | Portfolio overview KPIs |

### Endpoints To Build

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/projects/{id}/fingerprint/history` | All 24 monthly fingerprints |
| GET | `/api/projects/{id}/analogues` | Historical peer projects + outcomes |
| GET | `/api/projects/{id}/predict` | ML prediction (completion/cost/delay) |
| GET | `/api/projects/{id}/prescribe` | LLM prescription with evidence |
| POST | `/api/intelligence/query` | RAG natural language Q&A |
| POST | `/api/ml/train` | Trigger model retraining |
| GET | `/api/ml/status` | Model training status and metrics |
| GET | `/api/sectors/benchmark` | Sector-level performance comparison |

---

## 8. Frontend Pages & Components

### Pages

| Page | Route | Status | Description |
|---|---|---|---|
| Dashboard | `/` | ✅ Built | Portfolio KPIs, risk distribution, alert |
| Projects | `/projects` | ✅ Built | Searchable/filterable project table |
| Project Detail | `/projects/:id` | 🟡 Partial | Fingerprint + trajectory (needs predict/prescribe panels) |
| Rising Risk | `/rising` | ✅ Built | Momentum-sorted alert list |
| Priorities | `/priorities` | ✅ Built | Projects grouped by severity |
| Analytics | `/analytics` | ✅ Built | Charts and distributions |
| Risk Intelligence | `/intelligence` | 🔴 Placeholder | Will be RAG chat interface |
| Data Quality | `/data` | ✅ Built | Data integrity dashboard |
| Settings | `/settings` | ✅ Built | Configuration |

### Components To Build

| Component | Location | Description |
|---|---|---|
| `FingerprintHistory` | `components/charts/` | 24-month timeline of all 5 health dimensions |
| `HistoricalAnalogues` | `components/risk/` | Peer project cards with outcome badges |
| `MomentumRadar` | `components/charts/` | Radar chart showing which dimensions are accelerating |
| `MLPredictionPanel` | `components/risk/` | Completion/cost/delay prediction gauges |
| `SHAPChart` | `components/charts/` | Horizontal bar chart of SHAP feature contributions |
| `PrescriptionPanel` | `components/risk/` | LLM-generated recommendations accordion |
| `IntelligenceChat` | `pages/Intelligence.tsx` | RAG Q&A chat interface |

---

## 9. ML Models Reference

### Training Data Preparation

```python
# Join D02 snapshots (at month 12-18) with D05 outcomes
# This gives us: "at this health state, what was the final outcome?"

features = [
    'progress_variance_pct',
    'financial_physical_divergence', 
    'time_overrun_pct',
    'milestone_completion_ratio',
    'issue_pressure',
    'risk_score',
    'risk_momentum'
]

# Target for completion_risk_clf:
# D05 outcome_type: COMPLETED → 0, STALLED/ABANDONED → 1
```

### Model Files

```
backend/app/ml/
├── predictor/
│   ├── trainer.py          # Training pipeline
│   ├── predictor.py        # Inference wrapper
│   └── models/             # Serialised .pkl files (git-ignored)
│       ├── completion_risk_clf.pkl
│       ├── cost_overrun_clf.pkl
│       ├── delay_regressor.pkl
│       └── feature_scaler.pkl
├── analogues/
│   ├── analogue_engine.py  # KNN search
│   └── vector_store.py     # Pre-computed vectors
├── llm/
│   ├── gemini_client.py    # Gemini API wrapper
│   ├── prompt_templates.py # Structured prompts
│   └── rag_engine.py       # ChromaDB + retrieval
└── risk_engine/
    ├── engine.py           # ✅ Existing fingerprint engine
    └── momentum.py         # [TO BUILD] Dimension momentum
```

---

## 10. Glossary

| Term | Definition |
|---|---|
| **PAIMANA** | Project Appraisal and Implementation Management National Application — GoI's project monitoring system |
| **Digital Fingerprint** | Multi-dimensional health profile of a project at a point in time |
| **Risk Score** | Composite 0–100 score (higher = riskier) computed from 5 health dimensions |
| **Risk Momentum** | Rate of change of risk score over recent periods |
| **Analogue** | A historically similar project used as a comparison case |
| **SHAP** | SHapley Additive exPlanations — method for explaining ML model predictions |
| **RAG** | Retrieval-Augmented Generation — technique of searching relevant data before LLM generation |
| **ChromaDB** | Local vector database used for semantic search |
| **Embedding** | A numerical vector representation of text used for similarity search |
| **Feature Vector** | A row of numerical features describing a project's state at a point in time |
| **Financial-Physical Divergence** | The gap between expenditure % and physical progress % — a strong stalling predictor |
| **KNN** | K-Nearest Neighbours — algorithm to find most similar items in a database |
| **Prescription** | LLM-generated, evidence-backed recommendation for what to investigate and do |

---

*This document is a living reference. It will be updated as each layer is built.*
*Last updated: Phase 4 complete — Phase 5 in progress*
