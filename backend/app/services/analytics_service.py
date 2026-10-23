"""Analytics service for current job market intelligence."""
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_, case, extract
from app.models import JobPosting, JobSkill, Skill, SkillCategory, SkillTrend
from app.schemas.analytics import (
    DashboardOverview, TrendDataPoint, SkillDemandItem,
    SectorDemandItem, StateDemandItem, SalaryDistribution,
    MarketOverviewResponse,
)


class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def get_dashboard_overview(self) -> DashboardOverview:
        total = self.db.query(func.count(JobPosting.id)).scalar() or 0
        active = self.db.query(func.count(JobPosting.id)).filter(
            JobPosting.is_active == True
        ).scalar() or 0
        skills = self.db.query(func.count(Skill.id)).scalar() or 0
        sectors = self.db.query(func.count(func.distinct(JobPosting.sector))).filter(
            JobPosting.sector.isnot(None)
        ).scalar() or 0
        states = self.db.query(func.count(func.distinct(JobPosting.state))).filter(
            JobPosting.state.isnot(None)
        ).scalar() or 0
        
        latest = self.db.query(func.max(JobPosting.created_at)).scalar()
        has_synthetic = self.db.query(JobPosting).filter(
            JobPosting.is_synthetic == True
        ).first() is not None
        
        return DashboardOverview(
            total_jobs=total,
            active_jobs=active,
            total_skills_tracked=skills,
            total_sectors=sectors,
            total_states_covered=states,
            data_freshness=latest,
            is_demo_mode=has_synthetic,
            last_updated=datetime.utcnow(),
        )

    def get_top_skills(self, state: str = None, sector: str = None, limit: int = 15) -> list[SkillDemandItem]:
        query = (
            self.db.query(
                Skill.name,
                func.count(JobSkill.id).label("job_count"),
                Skill.is_emerging,
            )
            .join(JobSkill, JobSkill.skill_id == Skill.id)
            .join(JobPosting, JobPosting.id == JobSkill.job_posting_id)
        )
        
        if state:
            query = query.filter(JobPosting.state == state)
        if sector:
            query = query.filter(JobPosting.sector == sector)
        
        results = (
            query.group_by(Skill.name, Skill.is_emerging)
            .order_by(desc("job_count"))
            .limit(limit)
            .all()
        )
        
        # Get average salaries
        items = []
        for name, count, emerging in results:
            avg_sal = (
                self.db.query(func.avg(JobPosting.salary_max))
                .join(JobSkill, JobSkill.job_posting_id == JobPosting.id)
                .join(Skill, Skill.id == JobSkill.skill_id)
                .filter(Skill.name == name)
                .scalar()
            )
            items.append(SkillDemandItem(
                skill_name=name,
                job_count=count,
                is_emerging=emerging or False,
                avg_salary=round(avg_sal) if avg_sal else None,
            ))
        return items

    def get_top_sectors(self, state: str = None, limit: int = 10) -> list[SectorDemandItem]:
        query = (
            self.db.query(
                JobPosting.sector,
                func.count(JobPosting.id).label("job_count"),
            )
            .filter(JobPosting.sector.isnot(None))
        )
        if state:
            query = query.filter(JobPosting.state == state)
        
        results = query.group_by(JobPosting.sector).order_by(desc("job_count")).limit(limit).all()
        
        items = []
        for sector, count in results:
            # Get top skills for this sector
            top_skills = (
                self.db.query(Skill.name)
                .join(JobSkill, JobSkill.skill_id == Skill.id)
                .join(JobPosting, JobPosting.id == JobSkill.job_posting_id)
                .filter(JobPosting.sector == sector)
                .group_by(Skill.name)
                .order_by(desc(func.count(JobSkill.id)))
                .limit(3)
                .all()
            )
            items.append(SectorDemandItem(
                sector=sector,
                job_count=count,
                top_skills=[s[0] for s in top_skills],
            ))
        return items

    def get_state_distribution(self, sector: str = None, limit: int = 15) -> list[StateDemandItem]:
        query = (
            self.db.query(
                JobPosting.state,
                func.count(JobPosting.id).label("job_count"),
            )
            .filter(JobPosting.state.isnot(None))
        )
        if sector:
            query = query.filter(JobPosting.sector == sector)
        
        results = query.group_by(JobPosting.state).order_by(desc("job_count")).limit(limit).all()
        
        items = []
        for state, count in results:
            top_sectors = (
                self.db.query(JobPosting.sector)
                .filter(JobPosting.state == state, JobPosting.sector.isnot(None))
                .group_by(JobPosting.sector)
                .order_by(desc(func.count(JobPosting.id)))
                .limit(3)
                .all()
            )
            items.append(StateDemandItem(
                state=state,
                job_count=count,
                top_sectors=[s[0] for s in top_sectors],
            ))
        return items

    def get_salary_distribution(self, sector: str = None, state: str = None) -> list[SalaryDistribution]:
        query = self.db.query(JobPosting.salary_max).filter(JobPosting.salary_max.isnot(None))
        if sector:
            query = query.filter(JobPosting.sector == sector)
        if state:
            query = query.filter(JobPosting.state == state)
        
        salaries = [r[0] for r in query.all()]
        if not salaries:
            return []
        
        ranges = [
            ("< 3 LPA", 0, 300000),
            ("3-5 LPA", 300000, 500000),
            ("5-8 LPA", 500000, 800000),
            ("8-12 LPA", 800000, 1200000),
            ("12-20 LPA", 1200000, 2000000),
            ("20-35 LPA", 2000000, 3500000),
            ("35+ LPA", 3500000, float("inf")),
        ]
        
        total = len(salaries)
        result = []
        for label, low, high in ranges:
            count = sum(1 for s in salaries if low <= s < high)
            result.append(SalaryDistribution(
                range_label=label,
                count=count,
                percentage=round(count / total * 100, 1) if total > 0 else 0,
            ))
        return result

    def get_monthly_trend(self, months: int = 12, sector: str = None, state: str = None) -> list[TrendDataPoint]:
        """Get monthly job posting counts."""
        cutoff = date.today() - timedelta(days=months * 30)
        
        query = (
            self.db.query(
                func.strftime("%Y-%m", JobPosting.posting_date).label("period"),
                func.count(JobPosting.id).label("count"),
            )
            .filter(JobPosting.posting_date >= cutoff)
            .filter(JobPosting.posting_date.isnot(None))
        )
        if sector:
            query = query.filter(JobPosting.sector == sector)
        if state:
            query = query.filter(JobPosting.state == state)
        
        results = query.group_by("period").order_by("period").all()
        
        items = []
        prev = None
        for period, count in results:
            change = None
            if prev is not None and prev > 0:
                change = round((count - prev) / prev * 100, 1)
            items.append(TrendDataPoint(period=period, value=float(count), change_pct=change))
            prev = count
        return items

    def get_skill_trends(self, skill_name: str, state: str = None, months: int = 36) -> list[TrendDataPoint]:
        """Get historical trend for a specific skill."""
        cutoff = date.today() - timedelta(days=months * 30)
        
        query = (
            self.db.query(SkillTrend)
            .filter(
                SkillTrend.target_name == skill_name,
                SkillTrend.period_date >= cutoff,
                SkillTrend.trend_type == "skill",
            )
        )
        if state:
            query = query.filter(SkillTrend.state == state)
        else:
            query = query.filter(SkillTrend.state.is_(None))
        
        results = query.order_by(SkillTrend.period_date).all()
        
        return [
            TrendDataPoint(
                period=r.period_date.strftime("%Y-%m"),
                value=float(r.job_count),
                change_pct=r.job_count_change,
            )
            for r in results
        ]

    def get_market_overview(self, state: str = None, sector: str = None) -> MarketOverviewResponse:
        return MarketOverviewResponse(
            overview=self.get_dashboard_overview(),
            top_skills=self.get_top_skills(state=state, sector=sector),
            top_sectors=self.get_top_sectors(state=state),
            state_distribution=self.get_state_distribution(sector=sector),
            salary_distribution=self.get_salary_distribution(sector=sector, state=state),
            monthly_trend=self.get_monthly_trend(sector=sector, state=state),
        )
