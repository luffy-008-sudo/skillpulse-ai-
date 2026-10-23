"""Dashboard and market overview API endpoints."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.analytics_service import AnalyticsService
from typing import Optional

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/overview")
def get_market_overview(
    state: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Get complete market overview for dashboard."""
    svc = AnalyticsService(db)
    return svc.get_market_overview(state=state, sector=sector)


@router.get("/top-skills")
def get_top_skills(
    state: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    limit: int = Query(15, ge=1, le=50),
    db: Session = Depends(get_db),
):
    svc = AnalyticsService(db)
    return svc.get_top_skills(state=state, sector=sector, limit=limit)


@router.get("/top-sectors")
def get_top_sectors(
    state: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=30),
    db: Session = Depends(get_db),
):
    svc = AnalyticsService(db)
    return svc.get_top_sectors(state=state, limit=limit)


@router.get("/state-distribution")
def get_state_distribution(
    sector: Optional[str] = Query(None),
    limit: int = Query(15, ge=1, le=30),
    db: Session = Depends(get_db),
):
    svc = AnalyticsService(db)
    return svc.get_state_distribution(sector=sector, limit=limit)


@router.get("/salary-distribution")
def get_salary_distribution(
    sector: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    svc = AnalyticsService(db)
    return svc.get_salary_distribution(sector=sector, state=state)


@router.get("/monthly-trend")
def get_monthly_trend(
    months: int = Query(12, ge=1, le=60),
    sector: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    svc = AnalyticsService(db)
    return svc.get_monthly_trend(months=months, sector=sector, state=state)


@router.get("/skill-trend/{skill_name}")
def get_skill_trend(
    skill_name: str,
    state: Optional[str] = Query(None),
    months: int = Query(36, ge=1, le=60),
    db: Session = Depends(get_db),
):
    svc = AnalyticsService(db)
    return svc.get_skill_trends(skill_name=skill_name, state=state, months=months)
