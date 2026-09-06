# Layer 04A: Predictive ML Models Documentation

As part of the PAIMANA Intelligence Engine, we have trained and deployed four specialized Machine Learning models. These models analyze the continuous stream of Digital Fingerprint data to predict future project outcomes before they manifest into critical issues.

---

## 1. Model Overview & Architecture

All four predictors utilize the **Random Forest Classifier** architecture. Random Forests were chosen because they:
1. Handle non-linear relationships well without requiring extensive hyperparameter tuning.
2. Are robust against outliers in infrastructure data.
3. Provide built-in **Feature Importance (SHAP-compatible)**, allowing us to explain *why* a project was flagged (Prescriptive AI).

The models evaluate vectors constructed from the `project_features` table, scaled using standard normal distribution scaling (`StandardScaler`).

---

## 2. The Four Predictors

### Model 1: Cost Overrun Predictor
**Objective:** Predict if a project will exceed its revised budget threshold (`cost_progress_divergence > 10%`).
* **Algorithm:** Random Forest Classifier (Depth: 10, Estimators: 100)
* **Top Drivers (Feature Importance):**
  1. `financial_physical_divergence` (77.9% Importance)
  2. `monthly_expenditure_rate` (9.1% Importance)
  3. `expenditure_ratio` (7.8% Importance)

> [!NOTE]
> The model heavily relies on the divergence between physical completion and financial spending. If financial spending outpaces physical progress by a significant margin, the model flags a high probability of impending cost overrun.

### Model 2: Schedule Delay Predictor
**Objective:** Predict if a project will suffer severe timeline delays (`time_overrun_pct > 15%`).
* **Algorithm:** Random Forest Classifier
* **Top Drivers (Feature Importance):**
  1. `progress_velocity`
  2. `progress_acceleration`
  3. `days_remaining`

> [!TIP]
> This model acts as an early warning system. Rather than waiting for the deadline to pass, it analyzes whether the *current velocity* and *acceleration* are sufficient to cover the `days_remaining`.

### Model 3: Milestone Failure Predictor
**Objective:** Forecast if a project will fail to meet its near-term critical milestones (`milestone_completion_ratio < 0.5` AND experiencing delays).
* **Algorithm:** Random Forest Classifier
* **Top Drivers (Feature Importance):**
  1. `milestone_delay_rate` (52.6% Importance)
  2. `delay_momentum` (16.7% Importance)
  3. `schedule_progress_gap` (13.9% Importance)

> [!IMPORTANT]
> This model successfully identified strong correlations. It determined that projects with high `delay_momentum` (delays accelerating over recent months) almost universally fail their upcoming milestones.

### Model 4: Escalation Risk Predictor
**Objective:** Predict if a project's risk state will escalate to 'CRITICAL' in the upcoming quarter (`risk_momentum > 5`).
* **Algorithm:** Random Forest Classifier
* **Top Drivers (Feature Importance):**
  1. `issue_pressure` (55.6% Importance)
  2. `risk_score` (19.1% Importance)
  3. `progress_acceleration` (13.9% Importance)

> [!WARNING]
> Unresolved issues (`issue_pressure`) are the absolute strongest leading indicator of future risk escalation. Even if progress is currently acceptable, high issue pressure guarantees future deterioration.

---

## 3. Explainability (SHAP & Prescriptive Layer)

Because we used tree-based models, every prediction can be decomposed into its constituent drivers. In Layer 04C (The LLM Prescription Layer), these feature importance weights will be fed directly into the Large Language Model (Gemini).

**Example Workflow:**
1. The `Escalation Risk Predictor` flags Project A with an 85% probability of turning CRITICAL.
2. The model outputs its feature weights: `[issue_pressure: +0.6, progress_acceleration: -0.2]`.
3. The LLM reads this and prescribes: *"Project A is highly likely to escalate. The primary driver is unresolved issues. You must immediately resolve the pending land acquisition bottlenecks, despite the fact that physical progress is currently stable."*
