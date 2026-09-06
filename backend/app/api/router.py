from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from app.core.database import get_db
from app.models.project import Project
from app.models.feature import ProjectFeature
from app.schemas.project import ProjectResponse, DigitalFingerprintResponse, DashboardSummaryResponse
from app.ml.risk_engine.engine import RiskEngine

router = APIRouter()

@router.get("/projects", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    projects = db.query(Project).offset(skip).limit(limit).all()
    return projects

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
