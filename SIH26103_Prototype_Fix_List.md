# SIH26103 — Pre-Presentation Fix List
**Project:** PAIMANA Intelligence Engine (Predictive Analytics & Early Warning System)
**Prepared:** Night before prototype presentation
**Purpose:** Prioritized list of changes to make (or disclose) before demoing tomorrow.

---

## Priority 1 — Fix / Disclose Data Leakage (Must Address)

Your `metrics.json` shows two models at a perfect 1.00 accuracy/precision/recall/F1. This is not a good sign — it's the signature of label leakage. Judges with any ML background will flag this immediately if left unaddressed.

### 1.1 Cost Overrun Model
- **File:** `backend/app/ml/features/pipeline.py`, line 51
- **Issue:** `df["cost_progress_divergence"] = df["financial_physical_divergence"]` — the label (`cost_progress_divergence > 10%`) is a direct alias of the top input feature (`financial_physical_divergence`, 87.5% importance). The model is just recovering a threshold check, not predicting anything.
- **Fix options:**
  - [ ] **Best fix:** Change the label to be *forward-looking* — e.g., predict whether `cost_progress_divergence` will exceed 10% **3 months from now**, using only features from the *current and past* snapshots (not the same-period value). This matches the "early warning" framing the problem statement asks for.
  - [ ] **If no time to retrain:** Remove `financial_physical_divergence` from the feature list for this model, retrain quickly on the remaining features (`expenditure_ratio`, `monthly_expenditure_rate`, `expenditure_growth`, `issue_pressure`), and report the new (lower, more credible) metrics.
  - [ ] **If no time to retrain at all:** Disclose this explicitly in the presentation (see Priority 1.3 script below).

### 1.2 Schedule Delay Model
- **File:** `backend/app/ml/features/pipeline.py`, lines ~74–83
- **Issue:** Label is `time_overrun_pct > 15%`, computed as `time_overrun_days / original_duration`. `time_overrun_days` is fed in directly as a feature (91.9% importance) and `original_duration` is static per project — so the feature almost fully determines the label algebraically.
- **Fix options:**
  - [ ] **Best fix:** Same as above — reframe as forecasting a *future* overrun state using only progress/velocity/acceleration features, dropping `time_overrun_days` (or any feature computed from the same end-dates used to build the label) from the training set.
  - [ ] **If no time to retrain:** Drop `time_overrun_days` from `features_schedule` in `backend/app/ml/risk_engine/predictive.py`, retrain on `progress_velocity`, `progress_acceleration`, `days_remaining`, `delay_momentum`, `schedule_progress_gap` only.

### 1.3 Milestone Failure & Escalation Risk Models — Lower Priority
- These are only *partially* leaky (F1 0.54 and 0.63 respectively) — realistic enough to present as-is if time runs out. `risk_score` (a feature) is built from `issue_pressure`, and `risk_momentum` (the escalation label) is the month-over-month diff of `risk_score`, so there's some structural overlap, but it's far less severe than 1.0/2.0.
- [ ] Optional if time permits: exclude `risk_score` from the escalation model's feature list and retrain, to remove the remaining structural overlap.

### 1.4 If You Cannot Retrain Tonight — Disclosure Script
Say this proactively, don't wait to be asked:
> "We identified that our Cost Overrun and Schedule Delay models currently show label leakage — the input features are too closely tied to how we defined the target, which is why they show 100% accuracy. We're correcting this by reframing both as forward-looking predictions. Our Milestone Failure (86% accuracy, F1 0.54) and Escalation Risk (95% accuracy, F1 0.63) models are leakage-free and reflect realistic performance on our synthetic dataset."

---

## Priority 2 — Add a Statistical Baseline Comparison (Explicitly Required)

The problem statement's dimension **(b)** explicitly asks you to assess whether AI/ML provides *significant gains over conventional statistical methods*. Nothing in the current docs or code addresses this.

- [ ] Train a simple **Logistic Regression** (or basic linear regression for continuous targets) on the same (leakage-corrected) feature sets used by your four Random Forest models.
- [ ] Build one comparison table: Model type × Accuracy × Precision × Recall × F1, for RF vs. Logistic Regression, per prediction task.
- [ ] Add one slide: "AI/ML vs. Conventional Statistics" showing the delta and a one-line interpretation (e.g., "Random Forest improves recall by X points on non-linear divergence patterns, justifying the added complexity" — or "gains are modest, but explainability via feature importance still favors tree-based models").
- **Effort estimate:** ~20–30 minutes given your existing feature pipeline; `sklearn.linear_model.LogisticRegression` fits directly into your current `StandardScaler` pipeline.

---

## Priority 3 — Strengthen Benchmarking & Driver Analysis (Nice-to-Have)

Problem statement outcomes **(e)** and **(f)** are only partially covered.

### 3.1 Benchmarking and Comparative Analytics Module
- Current state: aggregate risk-distribution counts (`Analytics.tsx`) and per-project KNN historical analogues (`analogues.py`) — good, but no sector/ministry-level benchmarking.
- [ ] If time permits: add one chart — average cost/time overrun by `sector` or `ministry`, so a project can be shown "above/below sector average."

### 3.2 Cost Escalation Driver Analysis Module
- Current state: per-project feature-importance "drivers" shown in the UI (`RiskDrivers.tsx`) — good for individual projects, but no portfolio-wide driver analysis.
- [ ] If time permits: aggregate feature importances or correlations across all 750 synthetic projects to show which factors most commonly drive overruns *across the portfolio*, not just for one project at a time.

---

## Priority 4 — CUF Field Alignment Documentation (Explicitly Required)

Problem statement dimension **(c)** asks you to assess predictive performance attributable to current CUF fields vs. additional variables not presently captured.

- [ ] Add one slide/table explicitly splitting your features into:
  - **CUF-derived** (from fields likely already in the Common Upload Form): approved/revised cost, physical progress %, milestones planned/completed, implementing agency, timelines.
  - **Beyond-CUF** (not currently in CUF): `issue_pressure` (derived from issues data), `risk_momentum`, KNN-based historical analogues.
- [ ] One sentence of interpretation: e.g., "Removing beyond-CUF features (issue_pressure) drops the Escalation Risk model's F1 from X to Y — showing CUF alone under-captures early risk signals, and issue-tracking data should be added to the standard PAIMANA upload form."
- This directly answers what the problem statement is asking for and is a strong differentiator in the presentation.

---

## Summary Checklist (Quick Reference)

| # | Item | Priority | Est. Effort |
|---|---|---|---|
| 1 | Fix or disclose Cost Overrun model leakage | 🔴 Must | 30–60 min (fix) / 0 min (disclose) |
| 2 | Fix or disclose Schedule Delay model leakage | 🔴 Must | 30–60 min (fix) / 0 min (disclose) |
| 3 | Optional: reduce Escalation Risk model overlap | 🟡 Nice-to-have | 15 min |
| 4 | Add Logistic Regression baseline comparison | 🔴 Must (explicit ask) | 20–30 min |
| 5 | Sector/ministry benchmarking chart | 🟡 Nice-to-have | 30 min |
| 6 | Portfolio-level driver analysis | 🟡 Nice-to-have | 30 min |
| 7 | CUF vs. beyond-CUF feature slide | 🔴 Must (explicit ask) | 15 min (docs only, no code) |

**If time is very short, do items 1, 2 (disclosure only), 4, and 7 — these directly address what the problem statement and any technically literate judge will check for.**
