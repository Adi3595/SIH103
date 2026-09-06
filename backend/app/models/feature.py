from sqlalchemy import Column, String, Date, DateTime, Float, Integer, ForeignKey
from app.core.database import Base

class ProjectFeature(Base):
    __tablename__ = "project_features"

    internal_project_id = Column(String, ForeignKey("projects.internal_project_id"), primary_key=True, index=True)
    reporting_date = Column(String, primary_key=True, index=True)

    # Progress Features
    progress_variance_pct = Column(Float)
    progress_completion_ratio = Column(Float)
    progress_velocity = Column(Float)
    progress_acceleration = Column(Float)

    # Financial Features
    expenditure_ratio = Column(Float)
    monthly_expenditure_rate = Column(Float)
    expenditure_growth = Column(Float)
    cost_progress_divergence = Column(Float)
    financial_physical_divergence = Column(Float)

    # Schedule Features
    schedule_progress_gap = Column(Float)
    days_remaining = Column(Integer)
    time_overrun_days = Column(Integer)
    time_overrun_pct = Column(Float)
    delay_momentum = Column(Float)

    # Milestone Features
    milestone_completion_ratio = Column(Float)
    milestone_delay_rate = Column(Float)

    # Issue Features
    issue_pressure = Column(Float)

    # Risk Features
    risk_score = Column(Float)
    risk_momentum = Column(Float)
