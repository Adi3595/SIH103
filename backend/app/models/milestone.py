from sqlalchemy import Column, String, Date, Integer, ForeignKey
from app.core.database import Base

class Milestone(Base):
    __tablename__ = "milestones"

    milestone_id = Column(String, primary_key=True, index=True)
    internal_project_id = Column(String, ForeignKey("projects.internal_project_id"), index=True)
    milestone_name = Column(String)
    planned_date = Column(Date)
    actual_date = Column(Date, nullable=True)
    status = Column(String)
    delay_days = Column(Integer)
