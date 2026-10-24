"""SkillPulse AI - FastAPI Application Entry Point."""
import os
import shutil
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import init_db, SessionLocal
from app.api import dashboard, forecast, gaps, ingestion, jobs

settings = get_settings()

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("skillpulse")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown."""
    logger.info("🚀 Starting SkillPulse AI...")
    logger.info(f"   Database: {settings.database_url}")
    logger.info(f"   Demo Mode: {settings.demo_mode}")
    
    # In Vercel serverless environment, copy bundled DB to /tmp if not already there
    if os.environ.get("VERCEL"):
        tmp_db = "/tmp/skillpulse.db"
        if not os.path.exists(tmp_db):
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            bundled_db = os.path.join(base_dir, "skillpulse.db")
            if os.path.exists(bundled_db):
                try:
                    shutil.copyfile(bundled_db, tmp_db)
                    logger.info("📦 Copied bundled SQLite database to /tmp/skillpulse.db")
                except Exception as e:
                    logger.warning(f"Failed to copy bundled database: {e}")
    
    # Initialize database
    init_db()
    logger.info("✅ Database initialized")
    
    # Seed demo data if empty
    if settings.demo_mode:
        db = SessionLocal()
        try:
            from app.models import JobPosting
            count = db.query(JobPosting).count()
            if count == 0:
                logger.info("🌱 Seeding database with synthetic demo data...")
                from app.utils.seed_data import seed_database
                # In serverless environments, limit seed count to avoid function timeouts
                seed_count = 150 if os.environ.get("VERCEL") else 5000
                stats = seed_database(db, num_jobs=seed_count)
                logger.info(f"✅ Seeded: {stats}")
            else:
                logger.info(f"📊 Database already has {count} job postings.")
        finally:
            db.close()
    
    yield
    logger.info("👋 SkillPulse AI shutting down.")


app = FastAPI(
    title=settings.app_name,
    description=(
        "AI-Powered Labour Market Intelligence and Future Skill "
        "Demand-Supply Forecasting Platform for India's Ministry of "
        "Skill Development and Entrepreneurship."
    ),
    version=settings.app_version,
    lifespan=lifespan,
    docs_url="/docs",
    openapi_url="/openapi.json",
)

# CORS - allow all origins including Vercel preview domains
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(dashboard.router)
app.include_router(forecast.router)
app.include_router(gaps.router)
app.include_router(ingestion.router)
app.include_router(jobs.router)


@app.get("/api/health")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
        "demo_mode": settings.demo_mode,
    }


@app.get("/api/config")
@app.get("/config")
def get_app_config():
    """Public config info for frontend."""
    return {
        "app_name": settings.app_name,
        "app_version": settings.app_version,
        "app_tagline": settings.app_tagline,
        "demo_mode": settings.demo_mode,
        "forecast_horizons": settings.default_forecast_horizons,
    }
