"""Data ingestion and upload API endpoints."""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.ingestion_service import IngestionService

router = APIRouter(prefix="/api/data", tags=["Data Ingestion"])


@router.post("/upload-csv")
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload a CSV file with job posting data."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")
    
    content = await file.read()
    if len(content) > 50 * 1024 * 1024:  # 50MB limit
        raise HTTPException(status_code=400, detail="File too large. Maximum 50MB.")
    
    svc = IngestionService(db)
    result = svc.process_csv(content, file.filename)
    return result


@router.get("/sources")
def get_data_sources(db: Session = Depends(get_db)):
    """Get registered data sources."""
    svc = IngestionService(db)
    return svc.get_data_sources()


@router.get("/ingestion-logs")
def get_ingestion_logs(
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """Get recent ingestion logs."""
    svc = IngestionService(db)
    return svc.get_ingestion_logs(limit=limit)


@router.post("/import-naukri-static")
def import_naukri_static_dataset(db: Session = Depends(get_db)):
    """
    Import the static Naukri 2019 dataset for historical reference.
    NOTE: This is NOT an official Naukri API. Data is from 2019 only.
    """
    from app.ingestion.naukri_static import import_naukri_static
    return import_naukri_static(db, max_records=2000)


@router.get("/free-api-sources")
def list_free_api_sources():
    """List available free job data API sources with instructions."""
    return {
        "sources": [
            {
                "name": "Adzuna India (Free Tier)",
                "url": "https://api.adzuna.com/v1/api/jobs/in/",
                "free_tier": "1000 calls/month",
                "signup": "https://developer.adzuna.com/",
                "status": "available",
                "data_type": "live",
                "note": "Requires free API key. Covers Indian job market.",
            },
            {
                "name": "Naukri Static Dataset 2019",
                "url": "https://suraj-996.github.io/Naukri.com-API/api.json",
                "free_tier": "Static file - unlimited reads",
                "signup": "None required",
                "status": "available_unofficial",
                "data_type": "historical_2019",
                "note": "NOT official Naukri API. 2019 data only. Use via /api/data/import-naukri-static.",
            },
            {
                "name": "LinkedIn Jobs (RSS - Limited)",
                "url": "https://www.linkedin.com/jobs/",
                "free_tier": "RSS feed only",
                "signup": "None",
                "status": "limited",
                "data_type": "live",
                "note": "RSS feed provides limited job listings. No scraping allowed per ToS.",
            },
            {
                "name": "Government NSDC Data (Open)",
                "url": "https://nsdcindia.org/",
                "free_tier": "Free - government open data",
                "signup": "None",
                "status": "available",
                "data_type": "official_statistics",
                "note": "Official NSDC training and placement data. Upload CSV via /api/data/upload-csv.",
            },
            {
                "name": "CSV Upload",
                "url": "/api/data/upload-csv",
                "free_tier": "Unlimited",
                "signup": "None",
                "status": "available",
                "data_type": "user_provided",
                "note": "Upload your own job posting CSV. See /api/data/upload-csv for format.",
            },
        ],
        "recommendation": "Use Adzuna India free tier for live data. Register at developer.adzuna.com for a free API key.",
    }
