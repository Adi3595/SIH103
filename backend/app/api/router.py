from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.models.project import Project
from app.models.feature import ProjectFeature
from app.schemas.project import (
    ProjectResponse, DigitalFingerprintResponse,
    DashboardSummaryResponse, MomentumReportResponse,
    AnalogueResponse
)
from app.ml.risk_engine.engine import RiskEngine
from app.ml.risk_engine.momentum import compute_momentum_report
from app.ml.risk_engine.analogues import AnalogueEngine

router = APIRouter()

@router.get("/projects", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    projects = db.query(Project).offset(skip).limit(limit).all()
    return projects

# ── Geospatial endpoint MUST come before /{project_id} wildcard ──────────────
class StateStats(BaseModel):
    state: str
    project_count: int
    total_cost_cr: float
    avg_risk_score: float
    critical_projects: int

@router.get("/projects/geospatial", response_model=List[StateStats])
def get_geospatial_stats(ministry: Optional[str] = None, sector: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Returns aggregated project metrics grouped by state for the Map View.
    """
    query = db.query(Project)
    if ministry and ministry != 'ALL':
        query = query.filter(Project.ministry == ministry)
    if sector and sector != 'ALL':
        query = query.filter(Project.sector == sector)

    projects = query.all()
    state_map = {}

    # Pre-fetch all features and map to the latest per project to avoid N+1 DB queries
    all_features = db.query(ProjectFeature).all()
    latest_features_map = {}
    for f in all_features:
        pid = f.internal_project_id
        if pid not in latest_features_map or f.reporting_date > latest_features_map[pid].reporting_date:
            latest_features_map[pid] = f

    for p in projects:
        if not p.state: continue
        st = p.state
        if st not in state_map:
            state_map[st] = {'count': 0, 'cost': 0.0, 'risk_sum': 0.0, 'critical': 0}
        state_map[st]['count'] += 1
        state_map[st]['cost'] += (p.revised_cost_cr or 0.0)
        
        latest = latest_features_map.get(p.internal_project_id)
        if latest:
            fp = RiskEngine.generate_fingerprint(latest)
            state_map[st]['risk_sum'] += fp['risk_score']
            if fp['risk_level'] == 'CRITICAL':
                state_map[st]['critical'] += 1

    result = []
    for st, stats in state_map.items():
        avg_risk = stats['risk_sum'] / stats['count'] if stats['count'] > 0 else 0.0
        result.append({
            "state": st,
            "project_count": stats['count'],
            "total_cost_cr": round(stats['cost'], 2),
            "avg_risk_score": round(avg_risk, 1),
            "critical_projects": stats['critical']
        })
    return result

@router.get("/projects/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.internal_project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.get("/projects/{project_id}/fingerprint", response_model=DigitalFingerprintResponse)
def get_project_fingerprint(project_id: str, db: Session = Depends(get_db)):
    # Get the latest feature row for this project
    feature = db.query(ProjectFeature).filter(
        ProjectFeature.internal_project_id == project_id
    ).order_by(desc(ProjectFeature.reporting_date)).first()
    
    if not feature:
        raise HTTPException(status_code=404, detail="Fingerprint not found for project")
        
    return RiskEngine.generate_fingerprint(feature)

@router.get("/projects/{project_id}/fingerprint/history", response_model=List[DigitalFingerprintResponse])
def get_project_fingerprint_history(project_id: str, db: Session = Depends(get_db)):
    # Get all feature rows for this project ordered chronologically
    features = db.query(ProjectFeature).filter(
        ProjectFeature.internal_project_id == project_id
    ).order_by(ProjectFeature.reporting_date).all()
    
    if not features:
        raise HTTPException(status_code=404, detail="No history found for project")
        
    return [RiskEngine.generate_fingerprint(f) for f in features]

@router.get("/dashboard/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    # Get the latest feature for all projects
    # Since sqlite doesn't support distinct on easily, we can just fetch all and group in python
    # Or for this MVP, fetch all features and take the latest per project
    all_features = db.query(ProjectFeature).order_by(desc(ProjectFeature.reporting_date)).all()
    
    latest_features = {}
    for f in all_features:
        if f.internal_project_id not in latest_features:
            latest_features[f.internal_project_id] = f
            
    fingerprints = [RiskEngine.generate_fingerprint(f) for f in latest_features.values()]
    
    low = sum(1 for fp in fingerprints if fp["risk_level"] == "LOW")
    medium = sum(1 for fp in fingerprints if fp["risk_level"] == "MEDIUM")
    high = sum(1 for fp in fingerprints if fp["risk_level"] == "HIGH")
    critical = sum(1 for fp in fingerprints if fp["risk_level"] == "CRITICAL")
    rising = sum(1 for fp in fingerprints if fp["risk_momentum"] > 5)
    
    # Sort by risk score for top priorities
    sorted_fps = sorted(fingerprints, key=lambda x: x["risk_score"], reverse=True)
    
    return {
        "total_projects": len(latest_features),
        "low_risk": low,
        "medium_risk": medium,
        "high_risk": high,
        "critical_risk": critical,
        "rising_risk": rising,
        "top_priorities": sorted_fps[:10]
    }

# ── Layer 03: Risk Momentum ────────────────────────────────────────────────

@router.get("/projects/{project_id}/momentum", response_model=MomentumReportResponse)
def get_project_momentum(project_id: str, db: Session = Depends(get_db)):
    """
    Returns a full Layer 03 momentum report for a project:
    - Overall score momentum (3-month delta)
    - Dimension-level health deltas
    - Fastest deteriorating dimension
    - Momentum classification (ACCELERATING / RISING / STABLE / IMPROVING)
    - List of active concerns ranked by severity
    """
    report = compute_momentum_report(project_id, db)
    if "error" in report:
        raise HTTPException(status_code=404, detail=report["error"])
    return report

@router.get("/dashboard/rising", response_model=List[MomentumReportResponse])
def get_rising_risk_portfolio(limit: int = 20, db: Session = Depends(get_db)):
    """
    Returns momentum reports for the top N projects with the highest overall_momentum.
    Used by the Rising Risk Tracker page (sorted by acceleration, not raw score).
    """
    all_features = db.query(ProjectFeature).order_by(desc(ProjectFeature.reporting_date)).all()
    latest_ids: dict = {}
    for f in all_features:
        if f.internal_project_id not in latest_ids:
            latest_ids[f.internal_project_id] = f.internal_project_id

    reports = []
    for pid in list(latest_ids.keys())[:200]:   # sample first 200 for speed
        try:
            r = compute_momentum_report(pid, db)
            if "error" not in r:
                reports.append(r)
        except Exception:
            continue

    # Sort by overall_momentum descending (fastest accelerating first)
    reports.sort(key=lambda x: x["overall_momentum"], reverse=True)
    return reports[:limit]

@router.get("/projects/{project_id}/analogues", response_model=AnalogueResponse)
def get_project_analogues(project_id: str, db: Session = Depends(get_db)):
    """
    Layer 02: Returns the most similar historical analogue projects using KNN.
    """
    res = AnalogueEngine.find_analogues(db, project_id, k=3)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

from app.ml.risk_engine.predictive import PredictiveEngine

class FeatureDriver(BaseModel):
    name: str
    weight: int

class PredictionDetail(BaseModel):
    prob: float
    drivers: List[FeatureDriver]

class PredictionResponse(BaseModel):
    cost_overrun: PredictionDetail
    schedule_delay: PredictionDetail
    milestone_failure: PredictionDetail
    escalation_risk: PredictionDetail

@router.get("/projects/{project_id}/predictions", response_model=PredictionResponse)
def get_project_predictions(project_id: str, db: Session = Depends(get_db)):
    """
    Layer 04A: Returns ML predictive probabilities for various failure modes.
    """
    res = PredictiveEngine.predict(db, project_id)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

from app.ml.risk_engine.prescriptive import PrescriptiveEngine

class PrescriptionResponse(BaseModel):
    prescription: str

@router.get("/projects/{project_id}/prescription", response_model=PrescriptionResponse)
def get_project_prescription(project_id: str, db: Session = Depends(get_db)):
    """
    Layer 04C: Generates a natural language prescription using OpenRouter.
    """
    res = PrescriptiveEngine.generate_prescription(db, project_id)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@router.post("/projects/{project_id}/chat", response_model=ChatResponse)
def chat_with_project(project_id: str, request: ChatRequest, db: Session = Depends(get_db)):
    """
    RAG/Conversational AI: Answer queries based on the project's data.
    """
    # For now, we will reuse PrescriptiveEngine logic but pass the query
    # In a full RAG implementation, this would query a vector store.
    # Here we just pass the user's message to OpenRouter along with the project context.
    res = PrescriptiveEngine.generate_prescription(db, project_id, query=request.message)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return {"reply": res["prescription"]}

from fastapi import UploadFile, File
import pandas as pd
from sqlalchemy import create_engine
from app.core.database import DATABASE_URL
from app.scripts.run_feature_pipeline import run_pipeline
from fastapi.concurrency import run_in_threadpool

@router.post("/ingestion/upload")
async def upload_data_ingestion(files: list[UploadFile] = File(...)):
    """
    Accepts CSV files (e.g. projects.csv, project_snapshots.csv), appends them to the DB, 
    and regenerates the ML features once at the end.
    """
    engine = create_engine(DATABASE_URL)
    results = []

    for file in files:
        if not file.filename.endswith('.csv'):
            results.append(f"{file.filename}: Skipped (Only CSV allowed)")
            continue
            
        try:
            df = pd.read_csv(file.file)
            
            # Determine table based on columns
            table_name = None
            if "physical_progress_pct" in df.columns:
                table_name = "project_snapshots"
            elif "issue_status" in df.columns:
                table_name = "issues"
            elif "project_name" in df.columns:
                table_name = "projects"
            elif "milestone_name" in df.columns:
                table_name = "milestones"
            else:
                results.append(f"{file.filename}: Failed (Unknown schema)")
                continue
                
            # Prevent UNIQUE constraint failure for projects
            if table_name == "projects" and "internal_project_id" in df.columns:
                with engine.connect() as conn:
                    existing_ids = pd.read_sql("SELECT internal_project_id FROM projects", conn)
                    existing_set = set(existing_ids["internal_project_id"])
                df = df[~df["internal_project_id"].isin(existing_set)]
                
                if df.empty:
                    results.append(f"{file.filename}: Skipped (All projects already exist)")
                    continue

            from sqlalchemy import inspect
            inspector = inspect(engine)
            db_columns = [col['name'] for col in inspector.get_columns(table_name)]
            
            if table_name == "project_snapshots" and "snapshot_id" not in df.columns:
                import uuid
                df["snapshot_id"] = [str(uuid.uuid4()) for _ in range(len(df))]
            elif table_name == "issues" and "issue_id" not in df.columns:
                import uuid
                df["issue_id"] = [str(uuid.uuid4()) for _ in range(len(df))]
            elif table_name == "milestones" and "milestone_id" not in df.columns:
                import uuid
                df["milestone_id"] = [str(uuid.uuid4()) for _ in range(len(df))]
                
            cols_to_keep = [c for c in df.columns if c in db_columns]
            df = df[cols_to_keep]

            df.to_sql(table_name, engine, if_exists="append", index=False)
            results.append(f"{file.filename}: Ingested {len(df)} records into {table_name}")
            
        except Exception as e:
            results.append(f"{file.filename}: Failed ({str(e)})")

    # Run ML feature pipeline asynchronously in threadpool since it uses pandas/sqlalchemy sync
    await run_in_threadpool(run_pipeline)
    
    return {"status": "success", "message": " | ".join(results)}
