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
5. **Issue Pressure Index:** An aggregated severity score of unresolved roadblocks (Land Acquisition, Env Clearance, etc.).

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
The final risk score (0-10 scale) is an inverted weighted average:
$$\text{Score} = 10 - \left(0.4 H_s + 0.3 H_f + 0.2 H_p + 0.1 H_m\right) \times 0.1$$

Risk Levels are bucketed strictly:
- **LOW:** $< 4.0$
- **MEDIUM:** $4.0 - 6.5$
- **HIGH:** $6.5 - 8.5$
- **CRITICAL:** $\ge 8.5$

---

## 🕰️ Layer 02: Historical Analogues (KNN)
**File:** `app/ml/risk_engine/analogues.py`

Layer 02 provides context by finding historically similar projects using the **K-Nearest Neighbors (KNN)** algorithm. 

### Implementation Details
- **Algorithm:** Euclidean Distance KNN in a 5-dimensional sub-space (`progress_health`, `financial_health`, `schedule_health`, `milestone_health`, `risk_score`).
- **Data Source:** Only searches against completed projects (`project_state = "COMPLETED"`).
- **Execution:** Vectorizes the target project's fingerprint and runs a brute-force distance calculation (or KDTree for larger sets) against the historical DB.
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
- **Root Cause Isolation:** Identifies which of the 4 health dimensions degraded the fastest over the window to flag the specific active concern.

---

## 🔮 Layer 04A: Predictive Classifiers (Random Forest)
**File:** `app/ml/risk_engine/predictive.py`

This layer forecasts future states using four distinct `RandomForestClassifier` models (scikit-learn), trained on the 18,000-row synthetic dataset.

### 1. Cost Overrun Model (`cost_overrun_model.pkl`)
- **Target:** Will `cost_progress_divergence` exceed 10%?
- **Architecture:** `RandomForestClassifier(max_depth=10, n_estimators=100, class_weight='balanced', random_state=42)`
- **Key Features:** `financial_physical_divergence`, `monthly_expenditure_rate`.
- **Threshold Tuning:** Default probability threshold adjusted to $0.35$ to prioritize high Recall (minimizing false negatives on critical budget blowouts).

### 2. Schedule Delay Model (`schedule_delay_model.pkl`)
- **Target:** Will `time_overrun_pct` exceed 15%?
- **Architecture:** Same parameters, balanced class weights.
- **Key Features:** `progress_velocity`, `days_remaining`.
- **Threshold Tuning:** $0.30$

### 3. Milestone Failure Model (`milestone_failure_model.pkl`)
- **Target:** Will `milestone_completion_ratio` drop below 0.5 with active delays?
- **Key Features:** `delay_momentum`, `milestone_delay_rate`.
- **Threshold Tuning:** $0.25$

### 4. Escalation Risk Model (`escalation_risk_model.pkl`)
- **Target:** Will `risk_momentum` exceed 5 in the next quarter?
- **Key Features:** `issue_pressure` (highest importance), `risk_score`.
- **Threshold Tuning:** $0.30$

> **Tech Stack:** Models were trained offline via `train_models.py`, pickled (`.pkl` + `joblib` scalers), and are loaded dynamically by the FastAPI `PredictiveEngine` singleton at startup to ensure sub-10ms inference times.

---

## 🧠 Layer 04C: Prescriptive AI (LLM / OpenRouter)
**File:** `app/ml/risk_engine/prescriptive.py`

Prediction without action is useless. Layer 04C translates the numerical risk data into actionable, plain-English policy recommendations.

### Implementation Details
- **Provider:** OpenRouter API (allows seamless switching between Mistral, Llama, and Claude).
- **Prompt Engineering:** The backend constructs an extensive JSON prompt containing:
  - The project's basic meta-data.
  - The Layer 01 Digital Fingerprint (Health scores).
  - The Layer 03 Momentum data.
  - The Layer 04A Predictive probabilities.
- **System Prompt:** Instructs the LLM to act as an "infrastructure advisory AI", enforcing a strict markdown response format containing:
  1. Root Cause Analysis
  2. 3-5 Immediate Action Items
  3. Escalation Recommendation
- **Fallback:** Uses basic hardcoded heuristic prescriptions if the API fails or rate-limits, ensuring the dashboard never breaks.
