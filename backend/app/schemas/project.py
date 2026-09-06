from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class ProjectBase(BaseModel):
    internal_project_id: str
    project_name: str
    ministry: Optional[str] = None
    agency: Optional[str] = None
    sector: Optional[str] = None
    state: Optional[str] = None
    project_type: Optional[str] = None

class ProjectResponse(ProjectBase):
    approval_date: Optional[date] = None
    start_date: Optional[date] = None
    original_end_date: Optional[date] = None
    revised_end_date: Optional[date] = None
    original_cost_cr: Optional[float] = None
    revised_cost_cr: Optional[float] = None
    
    class Config:
        from_attributes = True

class DigitalFingerprintResponse(BaseModel):
    project_id: str
    reporting_date: Optional[str]
    progress_health: float
    financial_health: float
    schedule_health: float
    milestone_health: float
    issue_pressure: float
    risk_score: float
    risk_momentum: float
    risk_level: str
    project_state: str

class DashboardSummaryResponse(BaseModel):
    total_projects: int
    low_risk: int
    medium_risk: int
    high_risk: int
    critical_risk: int
    rising_risk: int
    top_priorities: List[DigitalFingerprintResponse]

# ── Layer 03: Risk Momentum ──────────────────────────────────────────────────

class DimensionDelta(BaseModel):
    current: float
    past: Optional[float]
    delta: float

class MomentumClassification(BaseModel):
    label: str        # ACCELERATING | RISING | STABLE | IMPROVING
    severity: str     # critical | high | medium | low
    color: str        # hex color for UI
    description: str

class MomentumConcern(BaseModel):
    dimension: str
    label: str
    delta: float
    current: float
    severity: str

class MomentumReportResponse(BaseModel):
    project_id: str
    reporting_date: Optional[str]
    window_months: int
    overall_momentum: float
    overall_classification: MomentumClassification
    dimension_momentum: dict           # keyed by dimension name
    fastest_deteriorating_dimension: Optional[str]
    issue_pressure_delta: float
    concerns: List[MomentumConcern]
    current_risk_score: float
    past_risk_score: float
    risk_level: str
    project_state: str

# ── Layer 02: Historical Analogues ───────────────────────────────────────────

class AnalogueProject(BaseModel):
    project_id: str
    project_name: str
    sector: str
    similarity_score: float
    risk_level: str
    project_state: str
    risk_score: float
    original_cost_cr: Optional[float]

class AnalogueResponse(BaseModel):
    target_project_id: str
    analogues: List[AnalogueProject]
