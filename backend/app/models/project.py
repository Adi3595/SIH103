from sqlalchemy import Column, String, Date, Float, Integer
from app.core.database import Base

class Project(Base):
    __tablename__ = "projects"

    internal_project_id = Column(String, primary_key=True, index=True)
    project_name = Column(String, nullable=False)
    ministry = Column(String)
    agency = Column(String)
    sector = Column(String)
    state = Column(String)
    project_type = Column(String)
    approval_date = Column(Date)
    start_date = Column(Date)
    original_end_date = Column(Date)
    revised_end_date = Column(Date)
    original_cost_cr = Column(Float)
    revised_cost_cr = Column(Float)
    project_code = Column(String)
    legacy_ocms_code = Column(String)
    pmgid = Column(String)
