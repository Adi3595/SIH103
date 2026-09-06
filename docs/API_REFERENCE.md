# PAIMANA: API Reference

Complete reference for all backend REST API endpoints. Base URL: `http://127.0.0.1:8000/api`

Interactive docs (Swagger UI): http://127.0.0.1:8000/docs

---

## Projects

### `GET /projects`
Returns a paginated list of all projects.

| Query Param | Type | Default | Description |
|---|---|---|---|
| `skip` | int | 0 | Pagination offset |
| `limit` | int | 100 | Max records to return |

**Response:** Array of `ProjectResponse`

---

### `GET /projects/{project_id}`
Returns metadata for a single project.

**Response:**
```json
{
  "internal_project_id": "PAI-00001",
  "project_name": "Mumbai Metro Extension",
  "ministry": "Urban Development",
  "sector": "Metro Rail",
  "state": "Maharashtra",
  "original_cost_cr": 850.0,
  "revised_cost_cr": 1020.0,
  "original_end_date": "2024-12-31",
  "revised_end_date": "2025-09-30"
}
```

---

### `GET /projects/{project_id}/fingerprint`
**Layer 01 — Digital Fingerprint**. Returns current health dimensions.

**Response:**
```json
{
  "project_id": "PAI-00001",
  "reporting_date": "2025-06-30",
  "progress_health": 42.0,
  "financial_health": 35.0,
  "schedule_health": 28.0,
  "milestone_health": 55.0,
  "issue_pressure": 6.8,
  "risk_score": 7.9,
  "risk_momentum": 2.4,
  "risk_level": "HIGH",
  "project_state": "ONGOING"
}
```

---

### `GET /projects/{project_id}/fingerprint/history`
Returns a time-series array of fingerprints for all months — used to drive the timeline chart.

---

### `GET /projects/{project_id}/momentum`
**Layer 03 — Risk Momentum**. Returns 3-month delta analysis.

**Response:**
```json
{
  "project_id": "PAI-00001",
  "overall_momentum": 3.2,
  "overall_classification": {
    "label": "ACCELERATING",
    "severity": "critical",
    "color": "#be123c",
    "description": "Risk is rapidly deteriorating — immediate intervention required."
  },
  "fastest_deteriorating_dimension": "financial_health",
  "current_risk_score": 7.9,
  "past_risk_score": 4.7,
  "concerns": [...]
}
```

---

### `GET /projects/{project_id}/analogues`
**Layer 02 — Historical Analogues**. Returns 3 most similar completed projects via KNN.

**Response:**
```json
{
  "target_project_id": "PAI-00001",
  "analogues": [
    {
      "project_id": "PAI-00342",
      "project_name": "Ahmedabad BRT Phase 2",
      "similarity_score": 0.91,
      "risk_level": "CRITICAL",
      "project_state": "COMPLETED"
    }
  ]
}
```

---

### `GET /projects/{project_id}/predictions`
**Layer 04A — Predictive ML**. Returns failure mode probabilities + XAI feature drivers.

**Response:**
```json
{
  "cost_overrun": {
    "prob": 82.4,
    "drivers": [
      { "name": "Financial Physical Divergence", "weight": 78 },
      { "name": "Monthly Expenditure Rate", "weight": 9 }
    ]
  },
  "schedule_delay": { "prob": 64.1, "drivers": [...] },
  "milestone_failure": { "prob": 71.0, "drivers": [...] },
  "escalation_risk": { "prob": 88.2, "drivers": [...] }
}
```

---

### `GET /projects/{project_id}/prescription`
**Layer 04C — Prescriptive AI**. Generates LLM-based intervention advice.

**Response:**
```json
{
  "prescription": "## Root Cause Analysis\n\n**Primary Issue:** Financial spending is outpacing physical progress by 38%...\n\n## Action Items\n1. **Audit Q3 Expenditure**...\n2. **Escalate Land Acquisition**...\n"
}
```

---

### `POST /projects/{project_id}/chat`
**RAG Chat**. Allows conversational querying about a specific project.

**Request Body:**
```json
{ "message": "Why is the cost overrun risk so high?" }
```

**Response:**
```json
{
  "reply": "The cost overrun risk of 82% is primarily driven by **Financial-Physical Divergence** (78% impact). This means the project has spent 65% of its budget but only completed 27% of physical work..."
}
```

---

## Dashboard

### `GET /dashboard/summary`
Returns portfolio-level KPI counts and the top 10 priority projects.

### `GET /dashboard/rising`
Returns top 20 projects sorted by rising Risk Momentum score.

---

## Geospatial

### `GET /projects/geospatial`
Returns project stats aggregated by state for the India map view.

| Query Param | Type | Description |
|---|---|---|
| `sector` | string | Filter by sector (e.g., "Roads") |
| `ministry` | string | Filter by ministry |

**Response:** Array of `StateStats`
```json
[
  {
    "state": "Maharashtra",
    "project_count": 48,
    "total_cost_cr": 24500.0,
    "avg_risk_score": 6.2,
    "critical_projects": 7
  }
]
```
