"""Analytics and dashboard schemas."""
from datetime import date, datetime
from pydantic import BaseModel
from typing import Optional, Any


class DashboardOverview(BaseModel):
    total_jobs: int
    active_jobs: int
    total_skills_tracked: int
    total_sectors: int
    total_states_covered: int
    data_freshness: Optional[datetime] = None
    is_demo_mode: bool = False
    last_updated: datetime


class TrendDataPoint(BaseModel):
    period: str  # "2025-01", "2025-W05", etc.
    value: float
    change_pct: Optional[float] = None


class SkillDemandItem(BaseModel):
    skill_name: str
    job_count: int
    change_pct: Optional[float] = None
    is_emerging: bool = False
    avg_salary: Optional[float] = None


class SectorDemandItem(BaseModel):
    sector: str
    job_count: int
    change_pct: Optional[float] = None
    top_skills: list[str] = []


class StateDemandItem(BaseModel):
    state: str
    job_count: int
    change_pct: Optional[float] = None
    top_sectors: list[str] = []


class SalaryDistribution(BaseModel):
    range_label: str
    count: int
    percentage: float


class JobTrendResponse(BaseModel):
    trend_type: str
    data: list[TrendDataPoint]
    total_data_points: int
    period_type: str


class TopSkillsResponse(BaseModel):
    skills: list[SkillDemandItem]
    period: str
    state: Optional[str] = None
    sector: Optional[str] = None


class MarketOverviewResponse(BaseModel):
    overview: DashboardOverview
    top_skills: list[SkillDemandItem]
    top_sectors: list[SectorDemandItem]
    state_distribution: list[StateDemandItem]
    salary_distribution: list[SalaryDistribution]
    monthly_trend: list[TrendDataPoint]
