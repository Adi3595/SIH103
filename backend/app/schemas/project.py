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
