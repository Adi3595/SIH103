from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.api.router import router
from app.core.database import engine, Base

# Import all models so SQLAlchemy knows about them before create_all
import app.models.project      # noqa: F401
import app.models.snapshot     # noqa: F401
import app.models.milestone    # noqa: F401
import app.models.issue        # noqa: F401

# ─────────────────────────────────────────────
# Rate Limiter
# ─────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])


# ─────────────────────────────────────────────
# Security Headers Middleware
# ─────────────────────────────────────────────
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Cache-Control"] = "no-store"
        # Remove server fingerprint
        response.headers.pop("Server", None)
        return response


# ─────────────────────────────────────────────
# App
# ─────────────────────────────────────────────
app = FastAPI(
    title="AI-Powered Predictive & Prescriptive Infrastructure Monitoring System",
    description="Backend API for SIH26103 Dashboard",
    version="1.0.0",
    # Disable auto-generated docs in production for security
    docs_url="/docs",
    redoc_url=None,
)

# Rate limiter state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security headers
app.add_middleware(SecurityHeadersMiddleware)

# CORS — only allow our known origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://nirikshan103.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://nirikshan103.vercel.app/"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# Startup
# ─────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    """Auto-create all database tables on first startup."""
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created/verified.")


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────
app.include_router(router, prefix="/api")


@app.get("/")
@limiter.limit("30/minute")
def read_root(request: Request):
    return {"message": "PAIMANA Infrastructure Monitoring API", "status": "operational"}
