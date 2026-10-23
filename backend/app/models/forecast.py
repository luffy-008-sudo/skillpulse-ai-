"""Forecast, trend, gap analysis, and recommendation models."""
from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Float, Text, Date, DateTime,
    Boolean, JSON, Index
)
from app.database import Base


class DemandForecast(Base):
    """Forecasted demand for a skill/occupation/sector."""
    __tablename__ = "demand_forecasts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # What is being forecasted
    forecast_type = Column(String(50), nullable=False)  # skill, occupation, sector
    target_name = Column(String(255), nullable=False, index=True)
    target_id = Column(Integer, nullable=True)
    
    # Geography
    state = Column(String(100), nullable=True, index=True)
    district = Column(String(100), nullable=True)
    
    # Forecast details
    forecast_date = Column(Date, nullable=False)  # The date being predicted
    forecast_horizon_months = Column(Integer, nullable=False)
    
    # Values
    predicted_demand = Column(Float, nullable=False)  # Predicted job count
    confidence_lower = Column(Float, nullable=True)  # Lower CI bound
    confidence_upper = Column(Float, nullable=True)  # Upper CI bound
    confidence_level = Column(Float, default=0.95)  # 95% CI
    
    # Model info
    model_name = Column(String(100), nullable=True)
    model_version = Column(String(50), nullable=True)
    training_data_start = Column(Date, nullable=True)
    training_data_end = Column(Date, nullable=True)
    data_points_used = Column(Integer, nullable=True)
    
    # Quality
    is_reliable = Column(Boolean, default=True)
    reliability_note = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    is_synthetic = Column(Boolean, default=False)

    __table_args__ = (
        Index("idx_forecast_type_target", "forecast_type", "target_name"),
        Index("idx_forecast_date_type", "forecast_date", "forecast_type"),
    )


class SkillTrend(Base):
    """Monthly aggregated skill/occupation demand trends."""
    __tablename__ = "skill_trends"

    id = Column(Integer, primary_key=True, autoincrement=True)
    
    trend_type = Column(String(50), nullable=False)  # skill, occupation, sector
    target_name = Column(String(255), nullable=False, index=True)
    
    # Time period
    period_date = Column(Date, nullable=False, index=True)  # First day of month
    period_type = Column(String(20), default="monthly")  # daily, weekly, monthly
    
    # Metrics
    job_count = Column(Integer, nullable=False, default=0)
    job_count_change = Column(Float, nullable=True)  # % change from previous period
    avg_salary_min = Column(Float, nullable=True)
    avg_salary_max = Column(Float, nullable=True)
    avg_experience_years = Column(Float, nullable=True)
    
    # Geography
    state = Column(String(100), nullable=True, index=True)
    district = Column(String(100), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    is_synthetic = Column(Boolean, default=False)

    __table_args__ = (
        Index("idx_trend_type_target_date", "trend_type", "target_name", "period_date"),
    )


class DemandSupplyGap(Base):
    """Computed demand-supply gap analysis."""
    __tablename__ = "demand_supply_gaps"

    id = Column(Integer, primary_key=True, autoincrement=True)
    
    analysis_type = Column(String(50), nullable=False)  # skill, occupation, sector
    target_name = Column(String(255), nullable=False, index=True)
    
    state = Column(String(100), nullable=True, index=True)
    district = Column(String(100), nullable=True)
    sector = Column(String(255), nullable=True)
    
    # Current snapshot
    current_demand = Column(Integer, nullable=True)  # Current open jobs
    current_supply_estimate = Column(Integer, nullable=True)  # Estimated workforce
    
    # Future projection
    forecast_horizon_months = Column(Integer, nullable=True)
    projected_demand = Column(Float, nullable=True)
    projected_supply = Column(Float, nullable=True)
    
    # Gap calculation
    gap_absolute = Column(Float, nullable=True)  # demand - supply (positive = shortage)
    gap_percentage = Column(Float, nullable=True)
    gap_severity = Column(String(20), nullable=True)  # critical, high, moderate, low, surplus
    
    # Evidence
    data_quality_score = Column(Float, nullable=True)  # 0-1
    evidence_summary = Column(Text, nullable=True)
    contributing_factors = Column(JSON, nullable=True)
    
    analysis_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_synthetic = Column(Boolean, default=False)


class TrainingRecommendation(Base):
    """Training program recommendations based on gap analysis."""
    __tablename__ = "training_recommendations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    
    gap_id = Column(Integer, nullable=True)
    
    skill_name = Column(String(255), nullable=False)
    sector = Column(String(255), nullable=True)
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    
    # Recommendation
    priority = Column(String(20), nullable=False)  # critical, high, medium, low
    recommended_training_seats = Column(Integer, nullable=True)
    recommended_course_duration_months = Column(Integer, nullable=True)
    recommended_nsqf_level = Column(Integer, nullable=True)
    
    # Rationale
    rationale = Column(Text, nullable=True)
    supporting_evidence = Column(JSON, nullable=True)
    confidence_score = Column(Float, nullable=True)  # 0-1
    
    # Impact estimate
    estimated_employability_rate = Column(Float, nullable=True)
    estimated_time_to_fill_months = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    is_synthetic = Column(Boolean, default=False)


class ModelEvaluation(Base):
    """Track model performance and backtesting results."""
    __tablename__ = "model_evaluations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    
    model_name = Column(String(100), nullable=False)
    model_version = Column(String(50), nullable=False)
    
    # What it predicts
    forecast_type = Column(String(50), nullable=False)
    target_name = Column(String(255), nullable=True)
    
    # Training info
    training_data_start = Column(Date, nullable=True)
    training_data_end = Column(Date, nullable=True)
    validation_data_start = Column(Date, nullable=True)
    validation_data_end = Column(Date, nullable=True)
    data_points_train = Column(Integer, nullable=True)
    data_points_validation = Column(Integer, nullable=True)
    
    # Metrics
    mae = Column(Float, nullable=True)
    rmse = Column(Float, nullable=True)
    mape = Column(Float, nullable=True)
    r2_score = Column(Float, nullable=True)
    
    # Classification metrics (for shortage risk)
    precision = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    
    # Metadata
    hyperparameters = Column(JSON, nullable=True)
    notes = Column(Text, nullable=True)
    is_baseline = Column(Boolean, default=False)
    
    evaluated_at = Column(DateTime, default=datetime.utcnow)
