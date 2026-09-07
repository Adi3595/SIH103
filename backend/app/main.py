from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import router
from app.core.database import engine, Base

# Import all models so SQLAlchemy knows about them before create_all
import app.models.project      # noqa: F401
import app.models.snapshot     # noqa: F401
import app.models.milestone    # noqa: F401
import app.models.issue        # noqa: F401

app = FastAPI(
    title="AI-Powered Predictive & Prescriptive Infrastructure Monitoring System",
    description="Backend API for SIH26103 Dashboard",
    version="1.0.0"
)

@app.on_event("startup")
def on_startup():
    """Auto-create all database tables on first startup."""
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created/verified.")

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to SIH26103 Infrastructure Monitoring System API"}
