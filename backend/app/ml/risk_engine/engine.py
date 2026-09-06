from typing import Dict, Any
from app.models.feature import ProjectFeature

class RiskEngine:
    """
    Central Risk Engine for calculating Project Digital Fingerprint.
    """
    
    @staticmethod
    def calculate_health(score: float, invert: bool = False) -> float:
        """
        Normalize a metric to 0-100 health scale.
        Higher health = better.
        """
        health = max(0.0, min(100.0, score))
        if invert:
            return 100.0 - health
        return health

    @classmethod
    def generate_fingerprint(cls, feature: ProjectFeature) -> Dict[str, Any]:
        """
        Generates the fingerprint based on the latest feature row.
        """
        # Progress Health: 100 - absolute variance, capped
        progress_health = cls.calculate_health(100 - abs(feature.progress_variance_pct or 0) * 100)
        
        # Financial Health: based on divergence
        financial_health = cls.calculate_health(100 - abs(feature.financial_physical_divergence or 0))
        
        # Schedule Health: based on time overrun pct
        schedule_health = cls.calculate_health(100 - (feature.time_overrun_pct or 0) * 100)
        
        # Milestone Health
        milestone_health = cls.calculate_health((feature.milestone_completion_ratio or 0) * 100)
        
        # Risk levels
        risk_score = feature.risk_score or 0
        if risk_score < 25:
            risk_level = "LOW"
        elif risk_score < 50:
            risk_level = "MEDIUM"
        elif risk_score < 75:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"
            
        # Project State
        momentum = feature.risk_momentum or 0
        if risk_level == "CRITICAL":
            state = "CRITICAL"
        elif momentum > 5:
            state = "DETERIORATING"
        elif momentum < -5:
            state = "IMPROVING"
        elif (feature.progress_completion_ratio or 0) > 0.9:
            state = "COMPLETING"
        else:
            state = "STABLE"
            
        return {
            "project_id": feature.internal_project_id,
            "reporting_date": feature.reporting_date if isinstance(feature.reporting_date, str) else (feature.reporting_date.isoformat() if feature.reporting_date else None),
            "progress_health": round(progress_health, 1),
            "financial_health": round(financial_health, 1),
            "schedule_health": round(schedule_health, 1),
            "milestone_health": round(milestone_health, 1),
            "issue_pressure": round(feature.issue_pressure or 0, 1),
            "risk_score": round(risk_score, 1),
            "risk_momentum": round(momentum, 2),
            "risk_level": risk_level,
            "project_state": state
        }
