from sqlalchemy import Column, String, Date, Float, Integer, ForeignKey
from app.core.database import Base

class ProjectSnapshot(Base):
    __tablename__ = "project_snapshots"

    snapshot_id = Column(String, primary_key=True, index=True)
    internal_project_id = Column(String, ForeignKey("projects.internal_project_id"), index=True)
    reporting_date = Column(Date, index=True)
    planned_progress_pct = Column(Float)
    physical_progress_pct = Column(Float)
    planned_expenditure_cr = Column(Float)
    period_expenditure_cr = Column(Float)
    cumulative_expenditure_cr = Column(Float)
    milestones_planned = Column(Integer)
    milestones_completed = Column(Integer)
    delay_days = Column(Integer)
