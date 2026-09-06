import numpy as np
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors

from app.models.project import Project
from app.models.feature import ProjectFeature
from app.ml.risk_engine.engine import RiskEngine

class AnalogueEngine:
    """
    Layer 02: Historical Analogue Risk Engine
    Uses K-Nearest Neighbors to find similar projects based on:
    - Base metrics (original_cost_cr)
    - Dynamic fingerprint dimensions (health scores, issue pressure)
    """

    @classmethod
    def find_analogues(cls, db: Session, target_project_id: str, k: int = 3) -> Dict[str, Any]:
        # 1. Fetch latest features for all projects
        all_features = db.query(ProjectFeature).order_by(desc(ProjectFeature.reporting_date)).all()
        
        latest_features = {}
        for f in all_features:
            if f.internal_project_id not in latest_features:
                latest_features[f.internal_project_id] = f
                
        if target_project_id not in latest_features:
            return {"error": "Target project not found or has no data."}

        # Fetch projects metadata for base features
        projects = db.query(Project).all()
        project_map = {p.internal_project_id: p for p in projects}

        # 2. Build feature matrix
        # Features: [original_cost_cr, progress_health, financial_health, schedule_health, issue_pressure]
        project_ids = []
        X_raw = []
        
        target_X = None

        for pid, feat in latest_features.items():
            if pid not in project_map:
                continue
                
            proj = project_map[pid]
            fp = RiskEngine.generate_fingerprint(feat)
            
            # Extract features
            cost = proj.original_cost_cr or 0.0
            
            vec = [
                cost,
                fp["progress_health"],
                fp["financial_health"],
                fp["schedule_health"],
                fp["issue_pressure"]
            ]
            
            if pid == target_project_id:
                target_X = vec
            else:
                project_ids.append(pid)
                X_raw.append(vec)

        if not target_X or not X_raw:
            return {"analogues": []}

        # 3. Normalize features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_raw)
        target_X_scaled = scaler.transform([target_X])

        # 4. Find Nearest Neighbors
        # Limit k to the number of available projects if small
        actual_k = min(k, len(X_raw))
        nn = NearestNeighbors(n_neighbors=actual_k, metric="euclidean")
        nn.fit(X_scaled)
        
        distances, indices = nn.kneighbors(target_X_scaled)

        # 5. Format output
        analogues = []
        for i in range(actual_k):
            idx = indices[0][i]
            dist = distances[0][i]
            pid = project_ids[idx]
            
            # Convert distance to a similarity percentage
            # Euclidean distance after standard scaling: 0 is exact match
            # Typical max distance in standard space might be around 5-10
            similarity = max(0.0, min(100.0, 100 - (dist * 15))) 

            feat = latest_features[pid]
            proj = project_map[pid]
            fp = RiskEngine.generate_fingerprint(feat)
            
            analogues.append({
                "project_id": pid,
                "project_name": proj.project_name,
                "sector": proj.sector or "Unknown",
                "similarity_score": round(similarity, 1),
                "risk_level": fp["risk_level"],
                "project_state": fp["project_state"],
                "risk_score": fp["risk_score"],
                "original_cost_cr": proj.original_cost_cr
            })

        return {
            "target_project_id": target_project_id,
            "analogues": analogues
        }
