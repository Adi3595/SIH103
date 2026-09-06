# PAIMANA: Dataset & Synthetic Data Guide

## 1. Overview

PAIMANA v1.0 operates entirely on **synthetic data** generated to mirror the statistical properties of real government infrastructure projects tracked under MoSPI's PAIMANA (Project Analysis & Monitoring for National Assets) system.

> ⚠️ **Important for Judges / Evaluators**
> This dataset was generated programmatically for the SIH 2026 hackathon prototype. It does not contain any real project data from any ministry, contractor, or government body.

---

## 2. Database: `sih26103.db` (SQLite, 9MB)

### Table: `projects` — 750 Records

Simulates the master project registry from MoSPI's PAIMANA portal.

| Column | Type | Description |
|---|---|---|
| `internal_project_id` | TEXT PK | Unique identifier (e.g., `PAI-00001`) |
| `project_name` | TEXT | Full project name |
| `ministry` | TEXT | Parent Ministry |
| `agency` | TEXT | Implementing agency |
| `sector` | TEXT | Infrastructure sector (Roads, Power, Railways, Metro Rail, Ports, Dams) |
| `state` | TEXT | State of implementation |
| `project_type` | TEXT | NEW / EXPANSION / MODERNIZATION |
| `original_cost_cr` | FLOAT | Original approved budget (₹ Crore) |
| `revised_cost_cr` | FLOAT | Revised budget after cost amendments |
| `original_end_date` | DATE | Original contractual completion date |
| `revised_end_date` | DATE | Revised completion date |
| `project_state` | TEXT | ONGOING / COMPLETED / DELAYED / STALLED |
| `risk_level` | TEXT | LOW / MEDIUM / HIGH / CRITICAL (computed) |

---

### Table: `project_snapshots` — 18,000 Records

Monthly time-series data for each project (24 months of history × 750 projects).

| Column | Type | Description |
|---|---|---|
| `snapshot_id` | INT PK | Auto-increment ID |
| `internal_project_id` | TEXT FK | References `projects` |
| `reporting_month` | DATE | First day of the reporting month |
| `physical_progress_pct` | FLOAT | Cumulative physical completion % (0–100) |
| `financial_expenditure_cr` | FLOAT | Cumulative funds released (₹ Crore) |
| `milestones_completed` | INT | Number of milestones completed to date |
| `milestones_total` | INT | Total milestones planned |
| `active_issues_count` | INT | Active unresolved roadblocks |
| `issue_severity_score` | FLOAT | Weighted severity (0–10) of active issues |

---

### Table: `project_features` — 18,000 Records

ML-ready feature vectors pre-computed by `run_feature_pipeline.py`.

| Column | Type | ML Usage |
|---|---|---|
| `progress_velocity` | FLOAT | How fast physical completion is moving (% / month) |
| `progress_acceleration` | FLOAT | Rate of change of velocity (positive = speeding up) |
| `expenditure_ratio` | FLOAT | Financial expenditure / Revised Budget |
| `monthly_expenditure_rate` | FLOAT | Financial spending rate per month |
| `expenditure_growth` | FLOAT | Month-over-month change in spending |
| `financial_physical_divergence` | FLOAT | (Expenditure %) − (Progress %) |
| `time_overrun_days` | FLOAT | Current projected delay vs revised deadline |
| `time_overrun_pct` | FLOAT | Time overrun as a % of original duration |
| `days_remaining` | FLOAT | Days until revised deadline |
| `schedule_progress_gap` | FLOAT | Expected progress vs Actual progress |
| `milestone_completion_ratio` | FLOAT | Milestones completed / Total |
| `milestone_delay_rate` | FLOAT | % of milestones behind schedule |
| `delay_momentum` | FLOAT | Month-over-month change in projected delay |
| `issue_pressure` | FLOAT | Normalized severity of active issues (0–10) |
| `risk_score` | FLOAT | Layer 01 composite risk score (0–10) |
| `risk_momentum` | FLOAT | Month-over-month change in risk_score |

---

## 3. Synthetic Data Generation Logic

### Sector & State Distribution
Projects are distributed across 6 sectors and 20 Indian states using weighted sampling that mirrors India's infrastructure investment patterns:
- **Roads & Highways:** 28%
- **Railways:** 22%
- **Power (Thermal + Hydro):** 18%
- **Metro Rail (Urban):** 14%
- **Ports & Waterways:** 10%
- **Dams & Irrigation:** 8%

High-density states (Maharashtra, Uttar Pradesh, Gujarat) receive proportionally more projects.

### Cost Distribution
Project costs follow a **log-normal distribution** (₹ 50 Cr – ₹ 5,000 Cr) to mirror the actual tail-heavy distribution of Indian infrastructure capital costs.

### Snapshot Simulation
Monthly snapshots simulate realistic project trajectories:
1. **On-Track Projects (~40%):** Physical progress closely follows the planned S-curve.
2. **Steadily Delayed Projects (~35%):** Progress velocity decelerates after Month 6.
3. **Stalled Projects (~15%):** Progress stops entirely for 3–6 months, simulating land acquisition or clearance bottlenecks.
4. **Recovering Projects (~10%):** Initial delays followed by acceleration (simulate additional resource allocation).

This distribution is intentional — it ensures the ML models are trained on a realistic mix of failure modes rather than artificially uniform data.
