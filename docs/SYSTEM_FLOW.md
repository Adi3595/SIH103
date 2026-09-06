# PAIMANA: Data & System Flow

This document traces the exact lifecycle of data within PAIMANA, from ingestion to the end-user's screen.

---

## 1. The Data Ingestion Phase

In a production environment, MoSPI receives monthly Excel sheets, CSVs, or API pushes from contractors on the ground. For this prototype, we simulate this via the `sih26103.db` database.

1. **Static Data Ingestion:** A new project is awarded. It is inserted into the `projects` table (e.g., `PAI-0751`, "Mumbai-Pune Expressway Expansion"). It has an Original Cost and an Original Timeline.
2. **Monthly Snapshots:** Every 30 days, the contractor uploads a report. This creates a new row in the `project_snapshots` table, containing the current `physical_progress_pct` (e.g., 20%) and `financial_expenditure_cr` (e.g., 50Cr).

## 2. The Offline ML Pipeline (Asynchronous)

Because calculating complex temporal derivatives on the fly for 750 projects would crash the FastAPI server, we run an offline cron job (`run_feature_pipeline.py`).

1. **Extraction:** The script pulls all historical snapshots for a project.
2. **Transformation:** Using `pandas`, it calculates rolling windows:
   - What was the velocity over the last 3 months?
   - What is the acceleration?
   - Is financial spending diverging from physical progress?
3. **Load:** The resulting 19-dimensional vector is saved into the `project_features` table.
4. **Model Training (Optional):** Periodically, `train_models.py` pulls all `project_features` to retrain the XGBoost, LightGBM, and Random Forest `.pkl` files to ensure they adapt to new macro-economic trends.

## 3. The Runtime Inference Phase (Synchronous)

When a user opens the PAIMANA dashboard, they trigger the runtime inference flow.

1. **Request:** The React frontend fires a `GET /api/projects/PAI-0751/predictions`.
2. **Database Query:** The FastAPI route queries SQLAlchemy for the single latest row in `project_features` for `PAI-0751`.
3. **Singleton Loading:** The `PredictiveEngine` singleton (which keeps the `.pkl` models loaded in RAM to prevent disk I/O bottlenecks) receives the feature vector.
4. **Inference:** The models (XGBoost/LightGBM/RF) run `.predict_proba()` on the vector, returning a JSON dictionary:
   ```json
   {
     "cost_overrun_probability": 0.85,
     "schedule_delay_probability": 0.40
   }
   ```
5. **Response:** FastAPI serializes the response and sends it back to the client in under 50ms.

## 4. The Prescriptive AI Flow (GenAI)

If the user wants advice on how to fix the project, they trigger the Prescriptive Flow.

1. **Request:** The user clicks "Generate Advice". The frontend calls `GET /api/projects/PAI-0751/prescription`.
2. **Context Gathering:** FastAPI aggregates the output from Layer 01 (Digital Fingerprint), Layer 03 (Momentum), and Layer 04A (Predictive ML) for that specific project.
3. **Prompt Construction:** The data is injected into a heavily engineered JSON prompt.
4. **External API Call:** FastAPI sends a synchronous HTTPS request to OpenRouter (Mistral/Claude).
5. **Markdown Parsing:** The LLM returns a markdown string. FastAPI forwards it to the frontend.
6. **Rendering:** React uses `react-markdown` to render the advice natively within the "AI Advisor" glass panel.
