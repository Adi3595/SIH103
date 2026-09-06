"""
Layer 03 — Risk Momentum Engine
Computes dimension-level momentum by comparing current fingerprint to 3 months ago.
Identifies which specific health dimensions are deteriorating and at what velocity.
"""
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.feature import ProjectFeature
from app.ml.risk_engine.engine import RiskEngine


# Classification thresholds
ACCEL_THRESHOLD = 15.0   # > 15 = ACCELERATING
RISING_THRESHOLD = 5.0   # 5–15 = RISING
STABLE_THRESHOLD = -5.0  # -5 to +5 = STABLE
                          # < -5 = IMPROVING


def classify_momentum(momentum: float) -> Dict[str, str]:
    if momentum > ACCEL_THRESHOLD:
        return {"label": "ACCELERATING", "severity": "critical",
                "color": "#e76f51", "description": "Risk rising rapidly — immediate review required"}
    elif momentum > RISING_THRESHOLD:
        return {"label": "RISING",       "severity": "high",
                "color": "#f4a261", "description": "Risk trending upward — weekly monitoring needed"}
    elif momentum >= STABLE_THRESHOLD:
        return {"label": "STABLE",       "severity": "medium",
                "color": "#94a3b8", "description": "Risk stable — normal monthly review"}
    else:
        return {"label": "IMPROVING",    "severity": "low",
                "color": "#2a9d8f", "description": "Risk declining — note recovery pattern"}


def get_dimension_momentum(
    current: Dict[str, float],
    past: Optional[Dict[str, float]]
) -> Dict[str, Any]:
    """
    Computes delta for each health dimension between current and 3-months-ago fingerprint.
    Negative delta = dimension deteriorating (health falling).
    """
    dims = ["progress_health", "financial_health", "schedule_health", "milestone_health"]

    if past is None:
        return {d: {"delta": 0.0, "current": current.get(d, 0.0), "past": None} for d in dims}

    result = {}
    for dim in dims:
        curr_val = current.get(dim, 0.0)
        past_val = past.get(dim, 0.0)
        delta = round(curr_val - past_val, 2)  # negative = deteriorating
        result[dim] = {
            "current": round(curr_val, 1),
            "past":    round(past_val, 1),
            "delta":   delta,
        }
    return result


def find_fastest_deteriorating_dimension(dim_momentum: Dict[str, Any]) -> Optional[str]:
    """Returns the dimension name with the largest negative delta (most deteriorating)."""
    if not dim_momentum:
        return None
    worst = min(dim_momentum.items(), key=lambda x: x[1]["delta"])
    return worst[0] if worst[1]["delta"] < 0 else None


def compute_momentum_report(project_id: str, db: Session) -> Dict[str, Any]:
    """
    Full momentum report for a project:
    - Overall score momentum (composite)
    - Dimension-level health deltas (3-month window)
    - Peer-sector comparison placeholder (Layer 03 enhancement)
    - Classification + severity
    """
    # Get all features sorted chronologically
    features: List[ProjectFeature] = db.query(ProjectFeature).filter(
        ProjectFeature.internal_project_id == project_id
    ).order_by(ProjectFeature.reporting_date).all()

    if not features:
        return {"error": "No feature data found"}

    # Current (latest) fingerprint
    current_feature = features[-1]
    current_fp = RiskEngine.generate_fingerprint(current_feature)

    # Past fingerprint — 3 months ago (index -4 if available, else -1)
    WINDOW = 3
    if len(features) > WINDOW:
        past_feature = features[-(WINDOW + 1)]
        past_fp = RiskEngine.generate_fingerprint(past_feature)
    else:
        past_feature = features[0]
        past_fp = RiskEngine.generate_fingerprint(past_feature)

    # Overall score momentum
    overall_momentum = round(current_fp["risk_score"] - past_fp["risk_score"], 2)
    overall_class = classify_momentum(overall_momentum)

    # Dimension-level momentum
    dim_momentum = get_dimension_momentum(current_fp, past_fp)

    # Identify the fastest deteriorating dimension
    worst_dim = find_fastest_deteriorating_dimension(dim_momentum)

    # Issue pressure momentum (higher = worse, so invert sign for consistency)
    issue_delta = round((current_feature.issue_pressure or 0) - (past_feature.issue_pressure or 0), 2)

    # Build ranked list of concerns
    concerns = []
    for dim_key, data in dim_momentum.items():
        if data["delta"] < -5:
            label = dim_key.replace("_", " ").title().replace("Health", "").strip()
            concerns.append({
                "dimension": dim_key,
                "label": label,
                "delta": data["delta"],
                "current": data["current"],
                "severity": "critical" if data["delta"] < -15 else "high" if data["delta"] < -10 else "medium"
            })
    # Sort by most deteriorating first
    concerns.sort(key=lambda x: x["delta"])

    return {
        "project_id": project_id,
        "reporting_date": current_fp["reporting_date"],
        "window_months": WINDOW,
        "overall_momentum": overall_momentum,
        "overall_classification": overall_class,
        "dimension_momentum": dim_momentum,
        "fastest_deteriorating_dimension": worst_dim,
        "issue_pressure_delta": issue_delta,
        "concerns": concerns,
        "current_risk_score": current_fp["risk_score"],
        "past_risk_score": past_fp["risk_score"],
        "risk_level": current_fp["risk_level"],
        "project_state": current_fp["project_state"],
    }
