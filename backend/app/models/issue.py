from sqlalchemy import Column, String, Date, ForeignKey
from app.core.database import Base

class Issue(Base):
    __tablename__ = "issues"

    issue_id = Column(String, primary_key=True, index=True)
    internal_project_id = Column(String, ForeignKey("projects.internal_project_id"), index=True)
    reporting_date = Column(Date, index=True)
    issue_category = Column(String)
    issue_description = Column(String)
    issue_status = Column(String)
    severity = Column(String)
