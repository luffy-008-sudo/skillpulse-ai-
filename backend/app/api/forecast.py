"""Forecast API endpoints."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.forecast_service import ForecastService
from typing import Optional

router = APIRouter(prefix="/api/forecast", tags=["Forecast"])


@router.get("/predict")
def get_forecast(
    forecast_type: str = Query("skill", pattern="^(skill|occupation|sector)$"),
    target_name: str = Query(...),
    state: Optional[str] = Query(None),
    horizon_months: int = Query(12, ge=1, le=60),
    db: Session = Depends(get_db),
):
    """Get demand forecast for a skill, occupation, or sector."""
    svc = ForecastService(db)
    return svc.get_forecast(forecast_type, target_name, state, horizon_months)


@router.get("/emerging-skills")
def get_emerging_skills(
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Get skills with strongest upward growth trends."""
    svc = ForecastService(db)
    return svc.get_emerging_skills(limit=limit)


@router.get("/sector-growth")
def get_sector_growth(db: Session = Depends(get_db)):
    """Get sector-level growth indicators."""
    svc = ForecastService(db)
    return svc.get_sector_growth()


@router.get("/model-evaluations")
def get_model_evaluations(db: Session = Depends(get_db)):
    """Get model performance evaluation metrics."""
    svc = ForecastService(db)
    return svc.get_model_evaluations()
