# SIH26103 — Canonical System Architecture Reference

> This document describes the **full connected intelligence system** as approved by the team.
> This is the blueprint every component must conform to.
> **Do not deviate from this structure without discussion.**

---

## Core Design Principle

This is **NOT a linear pipeline**. It is a **continuously connected intelligence network** where outputs from one module feed multiple others, and human feedback loops back into the system.

```
CONTINUOUS MONITORING → LEARN FROM HISTORY → PREDICT RISK → EXPLAIN → PRESCRIBE → PRIORITIZE → REASSESS
```

---

## Central Hub

```
┌─────────────────────────────────────────────────┐
│          PROJECT INTELLIGENCE & RISK ENGINE      │  ← LARGEST / MOST PROMINENT
│                                                  │
│   • Dynamic Project Digital Fingerprint          │
│   • Risk Score + Risk Momentum                   │
│   • Project State Representation                 │
└─────────────────────────────────────────────────┘
```

Everything connects **to and from** this central hub.

---

## Module Definitions

### MODULE 1 — PAIMANA / OCMS DATA (Input)
```
Contents:
  • Current project data
  • Historical project records
  • Monthly updates
  • Cost, expenditure, physical progress, milestones

Connects TO:
  → Data & Feature Engineering
  → Historical Similarity Engine
```

---

### MODULE 2 — DATA & FEATURE ENGINEERING
```
Contents:
  • Data validation & cleaning
  • Temporal features
  • Cost / progress / schedule indicators
  • Derived project health metrics

Connects TO:
  → Project Intelligence & Risk Engine
  → Predictive Analytics
  → Anomaly Detection
```

---

### MODULE 3 — PREDICTIVE ANALYTICS
```
Contents:
  • Cost overrun prediction
  • Time overrun prediction
  • Completion forecasting
  • Project risk probability
  • Early-warning probability

Connects TO:
  → Project Intelligence & Risk Engine
  → Explainable AI
  → Prescriptive Analytics
```

---

### MODULE 4 — ANOMALY DETECTION
```
Contents:
  • Expenditure anomalies
  • Progress anomalies
  • Milestone deviations
  • Financial–physical divergence

Connects TO:
  → Project Intelligence & Risk Engine
  → Explainable AI
  → Prescriptive Analytics
```

---

### MODULE 5 — HISTORICAL SIMILARITY ENGINE
```
Contents:
  • Similar project retrieval (KNN)
  • Historical outcome comparison
  • Common failure factors
  • Analogue project evidence

Connects TO:
  ↔ Project Intelligence & Risk Engine  [bidirectional]
  → Prescriptive Analytics
  → LLM + RAG Assistant
```

---

### MODULE 6 — EXPLAINABLE AI
```
Contents:
  • SHAP risk drivers
  • Why is the project risky?
  • Key contributing factors
  • Evidence behind prediction

Receives FROM:
  ← Predictive Analytics
  ← Anomaly Detection
  ← Project Intelligence & Risk Engine

Connects TO:
  → Prescriptive Analytics
  → Dashboard / Alerts
```

---

### MODULE 7 — PRESCRIPTIVE ANALYTICS
```
Contents:
  • Intervention priorities
  • Evidence-based recommendations
  • What-if / scenario analysis
  • Recovery areas requiring review

Receives FROM:
  ← Predictive Analytics
  ← Anomaly Detection
  ← Explainable AI
  ← Historical Similarity Engine

Connects TO:
  → Dashboard / Early Warning Alerts
  → Human Decision Maker

FEEDBACK LOOP:
  ↺ Back to Project Intelligence & Risk Engine
    (continuous monitoring / updated risk assessment)
```

---

### MODULE 8 — LLM + RAG PROJECT ASSISTANT
```
Contents:
  • Natural-language project queries
  • Historical evidence retrieval
  • Project summaries
  • Explain predictions and recommendations

Receives FROM:
  ← Project Intelligence & Risk Engine
  ← Historical Similarity Engine
  ← Explainable AI

Connects TO:
  → Monitoring Authority
```

---

### MODULE 9 — DECISION SUPPORT (Output Layer)
```
Components:
  • AI Monitoring Dashboard
  • Early Warning Alerts
  • Portfolio Prioritization
  • Human Decision Maker

FEEDBACK LOOP:
  ↺ Human Decision Maker → Project Intelligence & Risk Engine
    Label: "Officer feedback / updated project information"
```

---

## Complete Connection Map

```
PAIMANA/OCMS DATA
  → Data & Feature Engineering
  → Historical Similarity Engine

Data & Feature Engineering
  → Predictive Analytics
  → Anomaly Detection
  → Project Intelligence & Risk Engine

Predictive Analytics
  → Project Intelligence & Risk Engine
  → Explainable AI
  → Prescriptive Analytics

Anomaly Detection
  → Project Intelligence & Risk Engine
  → Explainable AI
  → Prescriptive Analytics

Historical Similarity Engine
  ↔ Project Intelligence & Risk Engine   [bidirectional]
  → Prescriptive Analytics
  → LLM + RAG

Project Intelligence & Risk Engine
  → Explainable AI
  → LLM + RAG
  → Prescriptive Analytics

Explainable AI
  → Prescriptive Analytics
  → Dashboard / Alerts

Prescriptive Analytics
  → Dashboard / Alerts
  → Human Decision Maker
  ↺ Project Intelligence & Risk Engine   [feedback loop]

Human Decision Maker
  ↺ Project Intelligence & Risk Engine   [feedback loop]
     "Officer feedback / updated project information"
```

---

## Three Highlighted Concepts (Innovation Claims)

1. **Digital Fingerprint** — Multi-dimensional evolving health profile (not a single score)
2. **Predictive Analytics** — Forward-looking ML (not threshold-based alerting)
3. **Prescriptive Analytics** — Evidence-backed LLM recommendations (not generic advice)

---

## What This Architecture Means for Our Build

| Module | Maps To Code |
|---|---|
| PAIMANA Data | `SIH26103_synthetic_data/` CSV files + future ingestion pipeline |
| Data & Feature Engineering | `app/ml/features/pipeline.py` |
| Project Intelligence & Risk Engine | `app/ml/risk_engine/engine.py` (central hub) |
| Predictive Analytics | `app/ml/predictor/` (to build) |
| Anomaly Detection | `app/ml/anomaly/` (to build — sub-layer of feature engineering) |
| Historical Similarity Engine | `app/ml/analogues/` (to build) |
| Explainable AI | SHAP integration in `app/ml/predictor/` (to build) |
| Prescriptive Analytics | `app/ml/llm/gemini_client.py` (to build) |
| LLM + RAG | `app/ml/rag/` (to build) |
| Dashboard / Alerts | `frontend/src/pages/Dashboard.tsx`, `RisingRisk.tsx` |
| Human Decision Maker | `frontend/src/pages/Intelligence.tsx` (chat interface) |
