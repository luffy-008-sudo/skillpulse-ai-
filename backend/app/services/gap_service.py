"""Demand-Supply Gap Analysis and Policy Simulator - Engine 3."""
from datetime import date, datetime
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.models import (
    DemandSupplyGap, TrainingRecommendation,
    JobPosting, JobSkill, Skill, SkillTrend,
)
from app.schemas.forecast import (
    GapAnalysisItem, GapAnalysisResponse,
    SimulatorRequest, SimulatorResult,
    TrainingRecommendationResponse,
)


class GapService:
    def __init__(self, db: Session):
        self.db = db

    def get_gap_analysis(
        self, analysis_type: str = "skill",
        target_name: str = None, state: str = None,
        district: str = None, sector: str = None,
        horizon_months: int = 12, limit: int = 20,
    ) -> GapAnalysisResponse:
        query = self.db.query(DemandSupplyGap).filter(
            DemandSupplyGap.analysis_type == analysis_type,
        )
        if target_name:
            query = query.filter(DemandSupplyGap.target_name == target_name)
        if state:
            query = query.filter(DemandSupplyGap.state == state)
        else:
            query = query.filter(DemandSupplyGap.state.is_(None))
        if district:
            query = query.filter(DemandSupplyGap.district == district)
        if sector:
            query = query.filter(DemandSupplyGap.sector == sector)
        
        gaps = query.order_by(desc(DemandSupplyGap.gap_absolute)).limit(limit).all()
        
        items = []
        for g in gaps:
            # Get top skills for this gap
            top_skills = []
            if g.sector:
                top_skills_q = (
                    self.db.query(Skill.name)
                    .join(JobSkill, JobSkill.skill_id == Skill.id)
                    .join(JobPosting, JobPosting.id == JobSkill.job_posting_id)
                    .filter(JobPosting.sector == g.sector)
                    .group_by(Skill.name)
                    .order_by(desc(func.count(JobSkill.id)))
                    .limit(5)
                    .all()
                )
                top_skills = [s[0] for s in top_skills_q]
            
            items.append(GapAnalysisItem(
                target_name=g.target_name,
                sector=g.sector,
                state=g.state,
                current_demand=g.current_demand or 0,
                projected_demand=g.projected_demand or 0,
                estimated_supply=g.current_supply_estimate or 0,
                gap_absolute=g.gap_absolute or 0,
                gap_percentage=g.gap_percentage or 0,
                gap_severity=g.gap_severity or "unknown",
                top_skills_needed=top_skills,
                evidence_summary=g.evidence_summary or "No evidence data available.",
                data_quality_score=g.data_quality_score or 0,
                is_synthetic=g.is_synthetic,
            ))
        
        return GapAnalysisResponse(
            analysis_type=analysis_type,
            items=items,
            analysis_date=date.today(),
            horizon_months=horizon_months,
            total_items=len(items),
        )

    def run_simulator(self, req: SimulatorRequest) -> SimulatorResult:
        """Run training policy simulator with user-defined parameters."""
        
        # Get current gap data
        query = self.db.query(DemandSupplyGap)
        if req.skill_name:
            query = query.filter(DemandSupplyGap.target_name == req.skill_name)
        if req.sector:
            query = query.filter(DemandSupplyGap.sector == req.sector)
        if req.state:
            query = query.filter(DemandSupplyGap.state == req.state)
        else:
            query = query.filter(DemandSupplyGap.state.is_(None))
        
        gap_data = query.first()
        
        if not gap_data:
            # Use reasonable defaults if no data
            current_demand = 200
            current_supply = 120
            projected_demand = 240
            growth_rate = 0.10
            is_synthetic = True
        else:
            current_demand = gap_data.current_demand or 200
            current_supply = gap_data.current_supply_estimate or 120
            projected_demand = gap_data.projected_demand or current_demand * 1.1
            growth_rate = ((projected_demand / current_demand) - 1) if current_demand > 0 else 0.1
            is_synthetic = gap_data.is_synthetic
        
        # Calculate
        current_gap = current_demand - current_supply
        
        # Future demand (no intervention)
        future_demand = current_demand * (1 + growth_rate * req.horizon_months / 12)
        natural_supply_growth = current_supply * (1 + 0.03 * req.horizon_months / 12)
        gap_no_intervention = future_demand - natural_supply_growth
        
        # Training pipeline calculations
        # Account for course duration + time to employment
        training_batches = max(1, req.horizon_months // max(1, req.course_duration_months))
        total_enrolled = req.training_seats * training_batches
        completers = total_enrolled * req.completion_rate
        employable = completers * req.employability_rate
        
        # Account for timing - first batch available after course_duration_months
        effective_supply_addition = employable * min(1.0, (req.horizon_months - req.course_duration_months) / req.horizon_months)
        effective_supply_addition = max(0, effective_supply_addition)
        
        new_supply = natural_supply_growth + effective_supply_addition
        gap_with_training = future_demand - new_supply
        
        gap_reduction = gap_no_intervention - gap_with_training
        gap_reduction_pct = (gap_reduction / abs(gap_no_intervention) * 100) if gap_no_intervention != 0 else 0
        
        scenario_label = req.skill_name or req.sector or "Selected segment"
        
        assumptions = [
            f"Training seats: {req.training_seats} per batch",
            f"Course duration: {req.course_duration_months} months",
            f"Expected completion rate: {req.completion_rate*100:.0f}%",
            f"Expected employability rate: {req.employability_rate*100:.0f}%",
            f"Natural supply growth: 3% per year (assumed)",
            f"Demand growth rate: {growth_rate*100:.1f}% per year (from historical data)" if gap_data else "Demand growth rate: 10% per year (default assumption)",
            f"Forecast horizon: {req.horizon_months} months",
        ]
        
        return SimulatorResult(
            scenario_label=scenario_label,
            current_gap=round(current_gap, 1),
            projected_gap_no_intervention=round(gap_no_intervention, 1),
            projected_gap_with_training=round(gap_with_training, 1),
            trainees_produced=round(completers, 1),
            employable_graduates=round(employable, 1),
            gap_reduction=round(gap_reduction, 1),
            gap_reduction_pct=round(gap_reduction_pct, 1),
            time_to_impact_months=req.course_duration_months + 3,
            assumptions=assumptions,
            is_synthetic=is_synthetic,
        )

    def get_recommendations(
        self, sector: str = None, state: str = None,
        priority: str = None, limit: int = 20,
    ) -> list[TrainingRecommendationResponse]:
        query = self.db.query(TrainingRecommendation)
        if sector:
            query = query.filter(TrainingRecommendation.sector == sector)
        if state:
            query = query.filter(TrainingRecommendation.state == state)
        if priority:
            query = query.filter(TrainingRecommendation.priority == priority)
        
        # Order by priority
        priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        recs = query.all()
        recs.sort(key=lambda r: priority_order.get(r.priority, 4))
        
        return [
            TrainingRecommendationResponse(
                skill_name=r.skill_name,
                sector=r.sector,
                state=r.state,
                priority=r.priority,
                recommended_seats=r.recommended_training_seats,
                recommended_duration_months=r.recommended_course_duration_months,
                recommended_nsqf_level=r.recommended_nsqf_level,
                rationale=r.rationale or "",
                confidence_score=r.confidence_score or 0,
                is_synthetic=r.is_synthetic,
            )
            for r in recs[:limit]
        ]

    def get_gap_summary(self) -> dict:
        """Summary statistics for gap analysis."""
        total = self.db.query(func.count(DemandSupplyGap.id)).filter(
            DemandSupplyGap.state.is_(None)
        ).scalar() or 0
        critical = self.db.query(func.count(DemandSupplyGap.id)).filter(
            DemandSupplyGap.gap_severity == "critical",
            DemandSupplyGap.state.is_(None),
        ).scalar() or 0
        high = self.db.query(func.count(DemandSupplyGap.id)).filter(
            DemandSupplyGap.gap_severity == "high",
            DemandSupplyGap.state.is_(None),
        ).scalar() or 0
        surplus = self.db.query(func.count(DemandSupplyGap.id)).filter(
            DemandSupplyGap.gap_severity == "surplus",
            DemandSupplyGap.state.is_(None),
        ).scalar() or 0
        
        return {
            "total_skills_analyzed": total,
            "critical_shortages": critical,
            "high_shortages": high,
            "surplus_skills": surplus,
            "analysis_date": date.today().isoformat(),
        }
