"""Forecasting service - Engine 2: Future Skills Demand."""
import math
import random
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.models import (
    DemandForecast, SkillTrend, ModelEvaluation,
    JobPosting, JobSkill, Skill,
)
from app.schemas.forecast import (
    ForecastResponse, ForecastDataPoint, ModelEvaluationResponse,
)


class ForecastService:
    def __init__(self, db: Session):
        self.db = db

    def get_forecast(
        self, forecast_type: str, target_name: str,
        state: str = None, horizon_months: int = 12,
    ) -> ForecastResponse:
        """Retrieve or generate a forecast for the given target."""
        
        # Try to get existing forecast
        query = (
            self.db.query(DemandForecast)
            .filter(
                DemandForecast.forecast_type == forecast_type,
                DemandForecast.target_name == target_name,
                DemandForecast.forecast_horizon_months == horizon_months,
            )
        )
        if state:
            query = query.filter(DemandForecast.state == state)
        else:
            query = query.filter(DemandForecast.state.is_(None))
        
        forecasts = query.order_by(DemandForecast.forecast_date).all()
        
        if forecasts:
            return self._format_forecast_response(forecasts, forecast_type, target_name, state, horizon_months)
        
        # Generate on-the-fly from historical trends
        return self._generate_forecast(forecast_type, target_name, state, horizon_months)

    def _format_forecast_response(
        self, forecasts, forecast_type, target_name, state, horizon_months
    ) -> ForecastResponse:
        fc0 = forecasts[0]
        data_points = [
            ForecastDataPoint(
                date=f.forecast_date.strftime("%Y-%m"),
                predicted=round(f.predicted_demand, 1),
                lower_bound=round(f.confidence_lower, 1) if f.confidence_lower else None,
                upper_bound=round(f.confidence_upper, 1) if f.confidence_upper else None,
            )
            for f in forecasts
        ]
        
        training_period = "N/A"
        if fc0.training_data_start and fc0.training_data_end:
            training_period = f"{fc0.training_data_start.strftime('%Y-%m')} to {fc0.training_data_end.strftime('%Y-%m')}"
        
        return ForecastResponse(
            forecast_type=forecast_type,
            target_name=target_name,
            state=state,
            horizon_months=horizon_months,
            model_name=fc0.model_name or "baseline",
            model_version=fc0.model_version or "1.0",
            training_period=training_period,
            data_points_used=fc0.data_points_used or 0,
            forecast_data=data_points,
            is_reliable=fc0.is_reliable if fc0.is_reliable is not None else True,
            reliability_note=fc0.reliability_note,
            metrics=None,
            is_synthetic=fc0.is_synthetic,
            generated_at=datetime.utcnow(),
        )

    def _generate_forecast(
        self, forecast_type: str, target_name: str,
        state: str = None, horizon_months: int = 12,
    ) -> ForecastResponse:
        """Generate a simple trend-based forecast from historical data."""
        
        # Get historical trend data
        query = (
            self.db.query(SkillTrend)
            .filter(
                SkillTrend.trend_type == forecast_type,
                SkillTrend.target_name == target_name,
            )
        )
        if state:
            query = query.filter(SkillTrend.state == state)
        else:
            query = query.filter(SkillTrend.state.is_(None))
        
        trends = query.order_by(SkillTrend.period_date).all()
        
        if len(trends) < 6:
            return ForecastResponse(
                forecast_type=forecast_type,
                target_name=target_name,
                state=state,
                horizon_months=horizon_months,
                model_name="insufficient_data",
                model_version="N/A",
                training_period="N/A",
                data_points_used=len(trends),
                forecast_data=[],
                is_reliable=False,
                reliability_note=f"Insufficient data: only {len(trends)} data points available (minimum 6 required).",
                is_synthetic=False,
                generated_at=datetime.utcnow(),
            )
        
        # Simple linear trend extrapolation
        values = [t.job_count for t in trends]
        n = len(values)
        x_mean = (n - 1) / 2
        y_mean = sum(values) / n
        
        numerator = sum((i - x_mean) * (v - y_mean) for i, v in enumerate(values))
        denominator = sum((i - x_mean) ** 2 for i in range(n))
        
        slope = numerator / denominator if denominator != 0 else 0
        intercept = y_mean - slope * x_mean
        
        # Residuals for uncertainty
        predictions = [intercept + slope * i for i in range(n)]
        residuals = [v - p for v, p in zip(values, predictions)]
        residual_std = (sum(r ** 2 for r in residuals) / max(n - 2, 1)) ** 0.5
        
        # Generate forecast points
        last_date = trends[-1].period_date
        data_points = []
        
        for m in range(1, horizon_months + 1):
            forecast_date = last_date + timedelta(days=30 * m)
            idx = n + m - 1
            predicted = max(0, intercept + slope * idx)
            uncertainty = residual_std * math.sqrt(1 + 1/n + (idx - x_mean)**2 / max(denominator, 1)) * 1.96
            
            data_points.append(ForecastDataPoint(
                date=forecast_date.strftime("%Y-%m"),
                predicted=round(predicted, 1),
                lower_bound=round(max(0, predicted - uncertainty), 1),
                upper_bound=round(predicted + uncertainty, 1),
            ))
        
        training_start = trends[0].period_date.strftime("%Y-%m")
        training_end = trends[-1].period_date.strftime("%Y-%m")
        
        return ForecastResponse(
            forecast_type=forecast_type,
            target_name=target_name,
            state=state,
            horizon_months=horizon_months,
            model_name="LinearTrend_ondemand",
            model_version="1.0",
            training_period=f"{training_start} to {training_end}",
            data_points_used=n,
            forecast_data=data_points,
            is_reliable=horizon_months <= 12 and n >= 12,
            reliability_note="On-demand linear trend forecast. Limited reliability for long horizons." if horizon_months > 12 else None,
            is_synthetic=any(t.is_synthetic for t in trends),
            generated_at=datetime.utcnow(),
        )

    def get_emerging_skills(self, limit: int = 20) -> list[dict]:
        """Identify skills with strongest upward trends."""
        skills = (
            self.db.query(Skill)
            .filter(Skill.is_emerging == True)
            .all()
        )
        
        results = []
        for skill in skills:
            trends = (
                self.db.query(SkillTrend)
                .filter(
                    SkillTrend.target_name == skill.name,
                    SkillTrend.trend_type == "skill",
                    SkillTrend.state.is_(None),
                )
                .order_by(SkillTrend.period_date)
                .all()
            )
            
            if len(trends) >= 6:
                recent = trends[-6:]
                older = trends[:6] if len(trends) >= 12 else trends[:3]
                
                recent_avg = sum(t.job_count for t in recent) / len(recent)
                older_avg = sum(t.job_count for t in older) / len(older)
                growth = ((recent_avg - older_avg) / older_avg * 100) if older_avg > 0 else 0
                
                results.append({
                    "skill_name": skill.name,
                    "category": skill.category.name if skill.category else None,
                    "growth_rate_pct": round(growth, 1),
                    "recent_monthly_demand": round(recent_avg),
                    "trend_direction": "rising" if growth > 5 else ("stable" if growth > -5 else "declining"),
                    "data_points": len(trends),
                    "is_synthetic": any(t.is_synthetic for t in trends),
                })
        
        results.sort(key=lambda x: x["growth_rate_pct"], reverse=True)
        return results[:limit]

    def get_sector_growth(self) -> list[dict]:
        """Get sector-level growth indicators."""
        sectors = (
            self.db.query(func.distinct(SkillTrend.target_name))
            .filter(SkillTrend.trend_type == "sector")
            .all()
        )
        
        results = []
        for (sector_name,) in sectors:
            trends = (
                self.db.query(SkillTrend)
                .filter(
                    SkillTrend.target_name == sector_name,
                    SkillTrend.trend_type == "sector",
                )
                .order_by(SkillTrend.period_date)
                .all()
            )
            
            if len(trends) >= 6:
                recent = trends[-6:]
                older = trends[:6]
                
                recent_avg = sum(t.job_count for t in recent) / len(recent)
                older_avg = sum(t.job_count for t in older) / len(older)
                growth = ((recent_avg - older_avg) / older_avg * 100) if older_avg > 0 else 0
                
                total = sum(t.job_count for t in trends)
                
                results.append({
                    "sector": sector_name,
                    "growth_rate_pct": round(growth, 1),
                    "recent_monthly_avg": round(recent_avg),
                    "total_postings": total,
                    "trend_direction": "growing" if growth > 5 else ("stable" if growth > -5 else "declining"),
                    "data_points": len(trends),
                    "is_synthetic": any(t.is_synthetic for t in trends),
                })
        
        results.sort(key=lambda x: x["growth_rate_pct"], reverse=True)
        return results

    def get_model_evaluations(self) -> list[ModelEvaluationResponse]:
        evals = self.db.query(ModelEvaluation).order_by(ModelEvaluation.evaluated_at.desc()).all()
        return [
            ModelEvaluationResponse(
                model_name=e.model_name,
                model_version=e.model_version,
                forecast_type=e.forecast_type,
                target_name=e.target_name,
                mae=e.mae,
                rmse=e.rmse,
                mape=e.mape,
                r2_score=e.r2_score,
                training_period=f"{e.training_data_start} to {e.training_data_end}" if e.training_data_start else None,
                data_points=e.data_points_train,
                is_baseline=e.is_baseline,
                evaluated_at=e.evaluated_at,
            )
            for e in evals
        ]
