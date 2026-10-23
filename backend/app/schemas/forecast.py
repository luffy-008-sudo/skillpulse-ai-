"""Forecast and gap analysis schemas."""
from datetime import date, datetime
from pydantic import BaseModel
from typing import Optional, Any


class ForecastRequest(BaseModel):
    forecast_type: str = "skill"  # skill, occupation, sector
    target_name: str
    state: Optional[str] = None
    horizon_months: int = 12


class ForecastDataPoint(BaseModel):
    date: str
    predicted: float
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    actual: Optional[float] = None  # For backtesting


class ForecastResponse(BaseModel):
    forecast_type: str
    target_name: str
    state: Optional[str] = None
    horizon_months: int
    model_name: str
    model_version: str
    training_period: str
    data_points_used: int
    forecast_data: list[ForecastDataPoint]
    is_reliable: bool
    reliability_note: Optional[str] = None
    metrics: Optional[dict] = None
    is_synthetic: bool = False
    generated_at: datetime


class GapAnalysisRequest(BaseModel):
    analysis_type: str = "skill"
    target_name: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    sector: Optional[str] = None
    horizon_months: int = 12


class GapAnalysisItem(BaseModel):
    target_name: str
    sector: Optional[str] = None
    state: Optional[str] = None
    current_demand: int
    projected_demand: float
    estimated_supply: int
    gap_absolute: float
    gap_percentage: float
    gap_severity: str
    top_skills_needed: list[str] = []
    evidence_summary: str
    data_quality_score: float
    is_synthetic: bool = False


class GapAnalysisResponse(BaseModel):
    analysis_type: str
    items: list[GapAnalysisItem]
    analysis_date: date
    horizon_months: int
    total_items: int


class SimulatorRequest(BaseModel):
    state: Optional[str] = None
    district: Optional[str] = None
    sector: Optional[str] = None
    skill_name: Optional[str] = None
    horizon_months: int = 12
    training_seats: int = 100
    course_duration_months: int = 6
    completion_rate: float = 0.75
    employability_rate: float = 0.70


class SimulatorResult(BaseModel):
    scenario_label: str
    current_gap: float
    projected_gap_no_intervention: float
    projected_gap_with_training: float
    trainees_produced: float
    employable_graduates: float
    gap_reduction: float
    gap_reduction_pct: float
    time_to_impact_months: int
    assumptions: list[str]
    disclaimer: str = "These are scenario projections, not guaranteed outcomes."
    is_synthetic: bool = False


class TrainingRecommendationResponse(BaseModel):
    skill_name: str
    sector: Optional[str] = None
    state: Optional[str] = None
    priority: str
    recommended_seats: Optional[int] = None
    recommended_duration_months: Optional[int] = None
    recommended_nsqf_level: Optional[int] = None
    rationale: str
    confidence_score: float
    is_synthetic: bool = False


class ModelEvaluationResponse(BaseModel):
    model_name: str
    model_version: str
    forecast_type: str
    target_name: Optional[str] = None
    mae: Optional[float] = None
    rmse: Optional[float] = None
    mape: Optional[float] = None
    r2_score: Optional[float] = None
    training_period: Optional[str] = None
    data_points: Optional[int] = None
    is_baseline: bool = False
    evaluated_at: datetime
