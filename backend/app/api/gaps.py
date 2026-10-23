"""Gap analysis and simulator API endpoints."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.gap_service import GapService
from app.schemas.forecast import SimulatorRequest
from typing import Optional

router = APIRouter(prefix="/api/gaps", tags=["Gap Analysis"])


@router.get("/analysis")
def get_gap_analysis(
    analysis_type: str = Query("skill"),
    target_name: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    horizon_months: int = Query(12, ge=1, le=60),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Get demand-supply gap analysis."""
    svc = GapService(db)
    return svc.get_gap_analysis(
        analysis_type=analysis_type,
        target_name=target_name,
        state=state, district=district,
        sector=sector,
        horizon_months=horizon_months,
        limit=limit,
    )


@router.post("/simulate")
def run_simulator(req: SimulatorRequest, db: Session = Depends(get_db)):
    """Run training policy simulator."""
    svc = GapService(db)
    return svc.run_simulator(req)


@router.get("/recommendations")
def get_recommendations(
    sector: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Get training recommendations."""
    svc = GapService(db)
    return svc.get_recommendations(sector=sector, state=state, priority=priority, limit=limit)


@router.get("/summary")
def get_gap_summary(db: Session = Depends(get_db)):
    """Get gap analysis summary statistics."""
    svc = GapService(db)
    return svc.get_gap_summary()
