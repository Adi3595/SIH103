# PAIMANA: The 4-Layer Intelligence Engine

PAIMANA’s core differentiation is its 4-layer AI/ML architecture. Rather than simply displaying raw data, the system ingests monthly project snapshots, engineers temporal features, and processes them through four distinct intelligence layers.

---

## 🏗️ Data Foundation & Feature Engineering

Before reaching the ML layers, raw data from the SQLite database (`sih26103.db`) is processed by `app/ml/features/pipeline.py`. 

### Raw Inputs
- `projects`: Static master data (Sector, State, Budget, Timeline).
- `project_snapshots`: Monthly time-series data (Physical Progress %, Financial Expenditure ₹, Active Issues).

### Feature Engineering Pipeline
The pipeline calculates 19 derivative features that capture the **momentum** of a project. Key engineered features include:
1. **Progress Velocity:** $\Delta$ Physical Progress / $\Delta$ Time (Month-over-Month).
2. **Progress Acceleration:** $\Delta$ Velocity / $\Delta$ Time.
3. **Financial-Physical Divergence:** $(Expenditure \%) - (Physical Progress \%)$. A high positive divergence indicates funds are bleeding without physical results.
4. **Delay Momentum:** Month-over-Month change in projected schedule variance.
5. **Issue Pressure Index:** An aggregated severity score of unresolved roadblocks.

All features are normalized using `scikit-learn`'s `StandardScaler` to ensure mean=0 and variance=1 before inference.

---

## 🔍 Layer 01: Digital Fingerprint (Deterministic Rules Engine)
**File:** `app/ml/risk_engine/engine.py`

Layer 01 acts as the baseline deterministic health assessor. It maps the 19 continuous features into four human-readable dimensions (scored 0-100) and computes a composite `risk_score`.

### Mathematical Formulation
Each dimension is bounded using a modified sigmoid or linear clamping function.
- **Progress Health ($H_p$):** 
  $$H_p = \max(0, 100 - (\text{progress\_variance\_pct} \times 100) + (\text{progress\_velocity} \times 50))$$
- **Financial Health ($H_f$):** 
  $$H_f = \max(0, 100 - (\text{financial\_physical\_divergence} \times 200))$$
- **Schedule Health ($H_s$):**
  $$H_s = \max(0, 100 - (\text{time\_overrun\_pct} \times 150))$$
- **Milestone Health ($H_m$):**
  $$H_m = \text{milestone\_completion\_ratio} \times 100$$

### Composite Risk Score
The final risk score (0-100 scale) is an inverted weighted average:
$$\text{Score} = 100 - \left(0.4 H_s + 0.3 H_f + 0.2 H_p + 0.1 H_m\right)$$

Risk Levels are bucketed strictly:
- **LOW:** $< 40$
- **MEDIUM:** $40 - 65$
- **HIGH:** $65 - 85$
- **CRITICAL:** $\ge 85$

---

## 🕰️ Layer 02: Historical Analogues (KNN)
**File:** `app/ml/risk_engine/analogues.py`

Layer 02 provides context by finding historically similar projects using the **K-Nearest Neighbors (KNN)** algorithm. 

### Implementation Details
- **Algorithm:** Euclidean Distance KNN in a 5-dimensional sub-space (`progress_health`, `financial_health`, `schedule_health`, `milestone_health`, `risk_score`).
- **Data Source:** Only searches against completed projects (`project_state = "COMPLETED"`).
- **Output:** Returns the top $K=3$ analogues, allowing us to display how similar projects ultimately performed (e.g., "75% of similar projects suffered cost overruns").

---

## 📈 Layer 03: Risk Momentum (Time-Series Delta)
**File:** `app/ml/risk_engine/momentum.py`

Risk is dynamic. A project sitting at a score of 6.0 is stable if it was 6.0 last month, but critical if it was 2.0 last month. 

### Implementation Details
- **Lookback Window:** Extracts the last 3 monthly snapshots for a given `project_id`.
- **Delta Calculation:** Computes $\frac{d(\text{Risk Score})}{dt}$. 
- **Categorization:**
  - `overall_momentum > 3`: **ACCELERATING** (Rapid deterioration)
  - `1 < overall_momentum <= 3`: **RISING** (Gradual decay)
  - `-1 <= overall_momentum <= 1`: **STABLE**
  - `overall_momentum < -1`: **IMPROVING** (Recovery)

---

## 🔮 Layer 04A: Predictive Classifiers (Random Forest)
**File:** `app/ml/risk_engine/predictive.py`

This layer forecasts future states. To ensure maximum accuracy and explainability (via SHAP feature importances), we use **Random Forest** algorithms for all four predictive models.

> **Data Leakage Fix & Statistical Baseline:** During training, highly deterministic "leaky" features (such as `financial_physical_divergence` for cost overruns) were deliberately dropped to ensure the models are genuinely predicting risk rather than simply reporting algebraic thresholds. Additionally, a **Logistic Regression baseline** was evaluated; Random Forest consistently outperformed the statistical baseline (e.g., F1 0.77 vs 0.74 on Milestone Failure), justifying the use of non-linear ML.

### 1. Cost Overrun Model
- **Target:** Will the project exceed its revised budget threshold?
- **Key Features:** `expenditure_ratio`, `monthly_expenditure_rate`, `expenditure_growth`, `issue_pressure`.

### 2. Schedule Delay Model
- **Target:** Will `time_overrun_pct` exceed 15%?
- **Key Features:** `progress_velocity`, `progress_acceleration`, `days_remaining`, `delay_momentum`, `schedule_progress_gap`.

### 3. Milestone Failure Model
- **Target:** Will `milestone_completion_ratio` drop below 0.5 with active delays?
- **Key Features:** `delay_momentum`, `milestone_delay_rate`, `issue_pressure`, `schedule_progress_gap`.

### 4. Escalation Risk Model
- **Target:** Will `risk_momentum` escalate to CRITICAL in the next quarter?
- **Key Features:** `issue_pressure` (highest importance), `risk_score`, `progress_acceleration`.

> **Tech Stack:** Models are trained offline via `retrain_models.py`, saved as optimized `.pkl` binaries in `app/ml/models/`, and loaded dynamically by the FastAPI `PredictiveEngine` singleton.

---

## 🧠 Layer 04C: Prescriptive AI (LLM / Google Gemini)
**File:** `app/ml/risk_engine/prescriptive.py`

Layer 04C translates the numerical risk data into actionable, plain-English policy recommendations.

### Implementation Details
- **Provider:** Google Gemini Native API (Gemini Flash).
- **Prompt Engineering:** The backend constructs an extensive JSON prompt containing:
  - The project's basic meta-data.
  - The Layer 01 Digital Fingerprint (Health scores).
  - The Layer 03 Momentum data.
  - The Layer 04A Predictive probabilities.
- **System Prompt:** Instructs the LLM to act as an "infrastructure advisory AI", enforcing a strict markdown response format containing Root Cause Analysis, 3-5 Immediate Action Items, and Escalation Recommendation.
