# PAIMANA: User Flow & UI Mapping

This document describes exactly how a user navigates the PAIMANA platform and maps our ML features to the specific UI tabs and components where they are surfaced.

---

## 1. Primary User Flow

**Target User:** Ministry Secretary, Nodal Officer, or Portfolio Manager.

1. **Authentication (Security Layer):** User logs in securely (JWT/RBAC).
2. **Dashboard (The 10,000 ft View):** User lands on the main Command Center. They instantly see the total count of CRITICAL and HIGH risk projects. 
3. **Priorities Triage:** The user looks at the auto-sorted **Priority Queue**, which immediately lists the 10 worst-performing projects based on Risk Momentum.
4. **Project Deep-Dive:** The user clicks a specific failing project (e.g., `PAI-00001`).
5. **Intelligence Review:** On the Project Detail page, the user reviews the Digital Fingerprint (Why is it failing?), Predictive Analysis (What will happen?), and Prescriptive Analysis (How do I fix it?).
6. **Action:** The user takes the AI-generated prescription and escalates the issue offline to the relevant state nodal officer.

---

## 2. Tab-by-Tab Feature Mapping

### 1. Dashboard (`/`)
- **What it has:** High-level KPI cards, a Risk Distribution doughnut chart, and a Priority Table.
- **Features Implemented Here:**
  - **Portfolio Aggregation:** Counts of all projects sorted by their Layer 01 Risk Level.
  - **Priority Sorting:** The table uses Layer 03 (Risk Momentum) to push rapidly deteriorating projects to the top.

### 2. Projects (`/projects`)
- **What it has:** A master searchable, filterable data grid of all 750 projects.
- **Features Implemented Here:**
  - **Search & Filter:** Find projects by Ministry, Sector, State, and exact `project_id`.

### 3. Project Detail (`/projects/:id`)
*This is the core intelligence view where all 4 ML layers converge.*
- **What it has & Features Implemented:**
  - **Digital Fingerprint (Layer 01):** Visualized as a 4-bar health metric panel showing exactly which dimension (Cost, Schedule, Progress, Milestone) is failing.
  - **Risk Momentum (Layer 03):** A dedicated panel showing if the risk is ACCELERATING or STABLE, identifying the fastest deteriorating metric.
  - **Predictive Analysis (Layer 04A):** A grid showing % probabilities for Cost Overrun, Schedule Delay, Milestone Failure, and Escalation (driven by XGBoost/LightGBM/RF).
  - **Prescriptive Analysis (Layer 04C):** The "AI Advisor" panel at the top, generating English recommendations on how to fix the project.
  - **Comparative Analysis (Layer 02):** The "Historical Analogues" panel. Shows the 3 most mathematically similar past projects and their final outcomes (Cost/Time overruns).
  - **Basic Project Data:** Cost (Revised vs Original), End Date, Sector, State, Ministry.

### 4. Geospatial View (`/map`)
- **What it has:** An interactive choropleth map of India.
- **Features Implemented Here:**
  - **Geospatial Analytics:** State-by-state aggregation.
  - **Interactive Tooltips:** Hovering over a state reveals total project count, total budget/cost invested in that state, average risk score, and critical project counts.

### 5. Analytics (`/analytics`)
- **What it has:** Macro-level portfolio charts.
- **Features Implemented Here:**
  - **Sector Risk Comparison:** Which sectors (e.g., Roads vs Power) have the highest average risk.
  - **Budget vs Risk Mapping:** Scatter plots or bar charts comparing capital deployed vs risk generated.

### 6. Data Quality (`/data`)
- **What it has:** System integrity metrics.
- **Features Implemented Here:**
  - **Ingestion Tracking:** Monitors the synthetic dataset generation, missing fields, and reporting gaps, ensuring the ML pipeline has clean data.
