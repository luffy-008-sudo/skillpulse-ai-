"""Generate realistic synthetic Indian labour market data for demo mode."""
import random
import math
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from app.models import (
    JobPosting, JobSkill, Skill, SkillCategory, OccupationCode,
    DemandForecast, SkillTrend, DemandSupplyGap,
    TrainingRecommendation, ModelEvaluation,
    DataSource, IngestionLog, DataQualityReport
)
from app.utils.indian_data import (
    INDIAN_STATES, STATE_DISTRICTS, SECTORS, SECTOR_SKILLS,
    EMPLOYERS, EDUCATION_LEVELS, EMPLOYMENT_TYPES
)


def seed_database(db: Session, num_jobs: int = 5000) -> dict:
    """Seed the database with synthetic data. Returns stats."""
    print("🌱 Seeding SkillPulse AI database with synthetic data...")
    
    stats = {}
    
    # 1. Create data sources
    sources = _create_data_sources(db)
    stats["data_sources"] = len(sources)
    
    # 2. Create skill categories and skills
    categories, skills_map = _create_skills(db)
    stats["skill_categories"] = len(categories)
    stats["skills"] = sum(len(v) for v in skills_map.values())
    
    # 3. Create occupation codes
    occ_codes = _create_occupation_codes(db)
    stats["occupation_codes"] = len(occ_codes)
    
    # 4. Create job postings
    jobs = _create_job_postings(db, sources, skills_map, num_jobs)
    stats["job_postings"] = len(jobs)
    
    # 5. Generate skill trends
    trends = _create_skill_trends(db, skills_map)
    stats["skill_trends"] = trends
    
    # 6. Generate forecasts
    forecasts = _create_forecasts(db, skills_map)
    stats["forecasts"] = forecasts
    
    # 7. Generate gap analysis
    gaps = _create_gap_analysis(db, skills_map)
    stats["gap_analyses"] = gaps
    
    # 8. Generate recommendations
    recs = _create_recommendations(db)
    stats["recommendations"] = recs
    
    # 9. Create model evaluations
    evals = _create_model_evaluations(db)
    stats["model_evaluations"] = evals
    
    # 10. Data quality report
    _create_quality_report(db, len(jobs))
    
    db.commit()
    print(f"✅ Seeding complete: {stats}")
    return stats


def _create_data_sources(db: Session) -> list:
    sources_data = [
        {"name": "Synthetic Demo Dataset", "source_type": "synthetic",
         "description": "AI-generated synthetic data for demonstration. NOT real labour market statistics.",
         "is_active": True, "data_quality_score": 0.85,
         "total_records_ingested": 5000,
         "coverage_notes": "Synthetic data covering major Indian states and sectors."},
        {"name": "CSV Upload", "source_type": "csv",
         "description": "User-uploaded CSV job posting data.",
         "is_active": True, "data_quality_score": None},
    ]
    sources = []
    for s in sources_data:
        source = DataSource(**s)
        db.add(source)
        sources.append(source)
    db.flush()
    return sources


def _create_skills(db: Session) -> tuple:
    categories = {}
    skills_map = {}  # sector -> list of Skill objects
    
    for sector, info in SECTOR_SKILLS.items():
        cat = SkillCategory(name=sector, description=f"Skills for {sector} sector", sector=sector)
        db.add(cat)
        db.flush()
        categories[sector] = cat
        
        skills_map[sector] = []
        for skill_name in info["skills"]:
            skill = Skill(
                name=skill_name,
                name_normalized=skill_name.lower().strip(),
                category_id=cat.id,
                skill_type="technical",
                is_emerging=skill_name in [
                    "Generative AI", "LLM Engineering", "Prompt Engineering",
                    "EV Technology", "5G Networks", "Blockchain", "Quantum Computing",
                    "Green Building", "AgriTech", "Connected Vehicles", "Smart Grid",
                ],
            )
            db.add(skill)
            skills_map[sector].append(skill)
    
    db.flush()
    return categories, skills_map


def _create_occupation_codes(db: Session) -> list:
    codes = [
        ("2511", "Software Developer", "IT", 4),
        ("2512", "Database Administrator", "IT", 4),
        ("2513", "Network Engineer", "IT", 4),
        ("2514", "Data Scientist", "IT", 4),
        ("2411", "Accountant", "Banking & Financial Services", 4),
        ("2412", "Financial Analyst", "Banking & Financial Services", 4),
        ("2211", "Medical Practitioner", "Healthcare & Pharmaceuticals", 4),
        ("2212", "Pharmacist", "Healthcare & Pharmaceuticals", 4),
        ("2141", "Industrial Engineer", "Manufacturing", 4),
        ("2142", "Civil Engineer", "Construction & Real Estate", 4),
        ("3311", "Sales Representative", "Retail & E-Commerce", 4),
        ("2310", "University Teacher", "Education & Training", 4),
        ("2144", "Mechanical Engineer", "Automotive", 4),
        ("2153", "Telecom Engineer", "Telecommunications", 4),
        ("6111", "Field Crop Farmer", "Agriculture & Food Processing", 4),
        ("4321", "Logistics Clerk", "Logistics & Supply Chain", 4),
    ]
    occ_list = []
    for code, title, sector, level in codes:
        occ = OccupationCode(code=code, title=title, sector=sector, level=level)
        db.add(occ)
        occ_list.append(occ)
    db.flush()
    return occ_list


def _create_job_postings(db: Session, sources, skills_map, num_jobs) -> list:
    random.seed(42)
    jobs = []
    source = sources[0]  # Synthetic source
    
    # Weight states by economic activity
    weighted_states = []
    state_weights = {
        "Maharashtra": 18, "Karnataka": 16, "Delhi": 14, "Telangana": 12,
        "Tamil Nadu": 10, "Gujarat": 8, "Uttar Pradesh": 7, "Haryana": 6,
        "West Bengal": 4, "Kerala": 4, "Rajasthan": 3, "Punjab": 3,
        "Andhra Pradesh": 3,
    }
    for state, weight in state_weights.items():
        weighted_states.extend([state] * weight)
    
    # Weight sectors
    weighted_sectors = []
    for sector, info in SECTOR_SKILLS.items():
        weight = int(info["growth_rate"] * 100) + 3
        weighted_sectors.extend([sector] * weight)
    
    # Generate jobs spanning 36 months
    end_date = date(2026, 9, 30)
    start_date = end_date - timedelta(days=36 * 30)
    
    for i in range(num_jobs):
        state = random.choice(weighted_states)
        districts = STATE_DISTRICTS.get(state, [state])
        district = random.choice(districts) if districts else None
        
        sector = random.choice(weighted_sectors)
        info = SECTOR_SKILLS[sector]
        
        title = random.choice(info["titles"])
        sal_min, sal_max = info["salary_range"]
        base_salary = random.uniform(sal_min, sal_max)
        
        # More recent jobs are more numerous (growth trend)
        days_ago = int(random.triangular(0, (end_date - start_date).days, 60))
        posting_date = end_date - timedelta(days=days_ago)
        
        # Seasonal variation
        month = posting_date.month
        seasonal_factor = 1.0 + 0.15 * math.sin(2 * math.pi * (month - 1) / 12)
        
        exp_min = round(random.choice([0, 0, 1, 1, 2, 2, 3, 5, 7, 10]), 1)
        exp_max = exp_min + random.choice([1, 2, 3, 5])
        
        job = JobPosting(
            source_id=source.id,
            external_id=f"SYN-{i+1:06d}",
            job_title=title,
            job_title_normalized=title.lower(),
            employer_name=random.choice(EMPLOYERS),
            employer_industry=sector,
            state=state,
            district=district,
            city=district,
            location_raw=f"{district}, {state}" if district else state,
            is_remote=random.random() < 0.15,
            salary_min=round(base_salary * 0.8),
            salary_max=round(base_salary * 1.2),
            salary_currency="INR",
            salary_period="yearly",
            experience_min_years=exp_min,
            experience_max_years=exp_max,
            employment_type=random.choices(
                EMPLOYMENT_TYPES, weights=[60, 5, 20, 10, 5]
            )[0],
            education_requirement=random.choice(EDUCATION_LEVELS),
            sector=sector,
            skills_raw=", ".join(random.sample(info["skills"], min(5, len(info["skills"])))),
            posting_date=posting_date,
            expiry_date=posting_date + timedelta(days=random.choice([30, 45, 60, 90])),
            is_active=posting_date > (end_date - timedelta(days=90)),
            is_duplicate=False,
            is_synthetic=True,
        )
        db.add(job)
        jobs.append(job)
    
    db.flush()
    
    # Link skills to jobs
    for job in jobs:
        sector = job.sector
        if sector in skills_map:
            num_skills = random.randint(2, min(5, len(skills_map[sector])))
            selected = random.sample(skills_map[sector], num_skills)
            for skill in selected:
                js = JobSkill(
                    job_posting_id=job.id,
                    skill_id=skill.id,
                    is_required=random.random() < 0.7,
                )
                db.add(js)
    
    db.flush()
    return jobs


def _create_skill_trends(db: Session, skills_map) -> int:
    """Create monthly skill demand trends over 36 months."""
    random.seed(123)
    count = 0
    end_date = date(2026, 9, 1)
    
    states_for_trends = ["Maharashtra", "Karnataka", "Delhi", "Tamil Nadu", "Telangana", None]
    
    for sector, skills in skills_map.items():
        info = SECTOR_SKILLS[sector]
        growth = info["growth_rate"]
        
        for skill in skills[:5]:  # Top 5 skills per sector
            for state in states_for_trends:
                base = random.randint(20, 200)
                
                for m in range(36):
                    period = date(end_date.year, end_date.month, 1) - timedelta(days=30 * (35 - m))
                    period = period.replace(day=1)
                    
                    # Trend + seasonality + noise
                    trend_val = base * (1 + growth * m / 12)
                    seasonal = trend_val * 0.1 * math.sin(2 * math.pi * (period.month - 1) / 12)
                    noise = random.gauss(0, trend_val * 0.08)
                    value = max(1, int(trend_val + seasonal + noise))
                    
                    prev_val = base * (1 + growth * max(0, m - 1) / 12) if m > 0 else base
                    change_pct = ((value - prev_val) / prev_val * 100) if prev_val > 0 else 0
                    
                    trend = SkillTrend(
                        trend_type="skill",
                        target_name=skill.name,
                        period_date=period,
                        period_type="monthly",
                        job_count=value,
                        job_count_change=round(change_pct, 2),
                        avg_salary_min=info["salary_range"][0] * (1 + 0.05 * m / 12),
                        avg_salary_max=info["salary_range"][1] * (1 + 0.05 * m / 12),
                        state=state,
                        is_synthetic=True,
                    )
                    db.add(trend)
                    count += 1
    
    # Also create sector-level trends
    for sector, info in SECTOR_SKILLS.items():
        growth = info["growth_rate"]
        base = random.randint(100, 500)
        
        for m in range(36):
            period = date(end_date.year, end_date.month, 1) - timedelta(days=30 * (35 - m))
            period = period.replace(day=1)
            
            trend_val = base * (1 + growth * m / 12)
            seasonal = trend_val * 0.1 * math.sin(2 * math.pi * (period.month - 1) / 12)
            noise = random.gauss(0, trend_val * 0.05)
            value = max(1, int(trend_val + seasonal + noise))
            
            trend = SkillTrend(
                trend_type="sector",
                target_name=sector,
                period_date=period,
                period_type="monthly",
                job_count=value,
                is_synthetic=True,
            )
            db.add(trend)
            count += 1
    
    db.flush()
    return count


def _create_forecasts(db: Session, skills_map) -> int:
    """Generate forecasts for future periods."""
    random.seed(456)
    count = 0
    
    for sector, skills in skills_map.items():
        info = SECTOR_SKILLS[sector]
        growth = info["growth_rate"]
        
        for skill in skills[:3]:  # Top 3 skills
            for horizon in [12, 36, 60]:
                base_demand = random.randint(50, 300)
                
                for m in range(horizon):
                    forecast_date = date(2026, 10, 1) + timedelta(days=30 * m)
                    
                    predicted = base_demand * (1 + growth * m / 12)
                    uncertainty = predicted * (0.1 + 0.005 * m)
                    
                    fc = DemandForecast(
                        forecast_type="skill",
                        target_name=skill.name,
                        forecast_date=forecast_date,
                        forecast_horizon_months=horizon,
                        predicted_demand=round(predicted, 1),
                        confidence_lower=round(predicted - uncertainty, 1),
                        confidence_upper=round(predicted + uncertainty, 1),
                        confidence_level=0.95,
                        model_name="ARIMA_baseline" if horizon <= 12 else "XGBoost_v1",
                        model_version="1.0",
                        training_data_start=date(2023, 10, 1),
                        training_data_end=date(2026, 9, 30),
                        data_points_used=36,
                        is_reliable=horizon <= 36,
                        reliability_note="Limited reliability for >36 month forecasts" if horizon > 36 else None,
                        is_synthetic=True,
                    )
                    db.add(fc)
                    count += 1
    
    db.flush()
    return count


def _create_gap_analysis(db: Session, skills_map) -> int:
    random.seed(789)
    count = 0
    
    for sector, skills in skills_map.items():
        info = SECTOR_SKILLS[sector]
        growth = info["growth_rate"]
        
        for skill in skills[:5]:
            demand = random.randint(100, 800)
            supply = int(demand * random.uniform(0.4, 1.3))
            gap = demand - supply
            gap_pct = (gap / demand * 100) if demand > 0 else 0
            
            severity = "surplus"
            if gap_pct > 40: severity = "critical"
            elif gap_pct > 25: severity = "high"
            elif gap_pct > 10: severity = "moderate"
            elif gap_pct > 0: severity = "low"
            
            for state in ["Maharashtra", "Karnataka", "Delhi", "Tamil Nadu", None]:
                state_factor = random.uniform(0.6, 1.4)
                s_demand = int(demand * state_factor * (0.2 if state else 1.0))
                s_supply = int(supply * state_factor * (0.2 if state else 1.0))
                s_gap = s_demand - s_supply
                s_gap_pct = (s_gap / s_demand * 100) if s_demand > 0 else 0
                
                s_severity = "surplus"
                if s_gap_pct > 40: s_severity = "critical"
                elif s_gap_pct > 25: s_severity = "high"
                elif s_gap_pct > 10: s_severity = "moderate"
                elif s_gap_pct > 0: s_severity = "low"
                
                gap_obj = DemandSupplyGap(
                    analysis_type="skill",
                    target_name=skill.name,
                    state=state,
                    sector=sector,
                    current_demand=s_demand,
                    current_supply_estimate=s_supply,
                    forecast_horizon_months=12,
                    projected_demand=round(s_demand * (1 + growth), 1),
                    projected_supply=round(s_supply * 1.03, 1),
                    gap_absolute=float(s_gap),
                    gap_percentage=round(s_gap_pct, 1),
                    gap_severity=s_severity,
                    data_quality_score=round(random.uniform(0.6, 0.95), 2),
                    evidence_summary=f"Based on {random.randint(50, 500)} synthetic job postings and estimated workforce data.",
                    contributing_factors={"growth_rate": growth, "sector": sector},
                    analysis_date=date(2026, 10, 1),
                    is_synthetic=True,
                )
                db.add(gap_obj)
                count += 1
    
    db.flush()
    return count


def _create_recommendations(db: Session) -> int:
    random.seed(321)
    count = 0
    
    emerging_skills = [
        ("Generative AI", "Information Technology", "critical", 500, 6, 8),
        ("LLM Engineering", "Information Technology", "critical", 300, 6, 8),
        ("EV Technology", "Automotive", "high", 400, 12, 6),
        ("5G Networks", "Telecommunications", "high", 250, 9, 7),
        ("Cybersecurity", "Information Technology", "critical", 600, 6, 7),
        ("Data Science", "Information Technology", "high", 800, 6, 7),
        ("Cloud Computing", "Information Technology", "high", 700, 6, 7),
        ("Renewable Energy", "Energy & Utilities", "high", 350, 12, 6),
        ("IoT", "Manufacturing", "medium", 200, 9, 6),
        ("Blockchain", "Banking & Financial Services", "medium", 150, 6, 7),
        ("Health Informatics", "Healthcare & Pharmaceuticals", "high", 300, 9, 6),
        ("AgriTech", "Agriculture & Food Processing", "medium", 200, 12, 5),
        ("Digital Marketing", "Retail & E-Commerce", "high", 400, 3, 5),
        ("BIM Modelling", "Construction & Real Estate", "medium", 150, 6, 6),
    ]
    
    for skill, sector, priority, seats, duration, nsqf in emerging_skills:
        rec = TrainingRecommendation(
            skill_name=skill,
            sector=sector,
            priority=priority,
            recommended_training_seats=seats,
            recommended_course_duration_months=duration,
            recommended_nsqf_level=nsqf,
            rationale=f"Synthetic analysis: {skill} shows sustained demand growth in {sector}. "
                      f"Current estimated gap suggests {seats} additional training seats needed. "
                      f"This is a demonstration recommendation based on synthetic data.",
            supporting_evidence={
                "demand_trend": "increasing",
                "gap_severity": priority,
                "data_source": "synthetic",
            },
            confidence_score=round(random.uniform(0.55, 0.85), 2),
            estimated_employability_rate=round(random.uniform(0.60, 0.85), 2),
            estimated_time_to_fill_months=duration + 3,
            is_synthetic=True,
        )
        db.add(rec)
        count += 1
    
    db.flush()
    return count


def _create_model_evaluations(db: Session) -> int:
    evals = [
        {"model_name": "ARIMA_baseline", "model_version": "1.0",
         "forecast_type": "skill", "mae": 12.5, "rmse": 18.3,
         "mape": 15.2, "r2_score": 0.72, "is_baseline": True,
         "data_points_train": 24, "data_points_validation": 12,
         "notes": "Baseline ARIMA(1,1,1) model on synthetic data."},
        {"model_name": "XGBoost_v1", "model_version": "1.0",
         "forecast_type": "skill", "mae": 9.8, "rmse": 14.1,
         "mape": 11.7, "r2_score": 0.81, "is_baseline": False,
         "data_points_train": 24, "data_points_validation": 12,
         "notes": "XGBoost with sector, seasonal, and trend features on synthetic data."},
        {"model_name": "Linear_Trend", "model_version": "1.0",
         "forecast_type": "sector", "mae": 25.1, "rmse": 32.4,
         "mape": 18.9, "r2_score": 0.65, "is_baseline": True,
         "data_points_train": 24, "data_points_validation": 12,
         "notes": "Simple linear trend baseline on synthetic sector data."},
        {"model_name": "ShortageRisk_RF", "model_version": "1.0",
         "forecast_type": "gap_classification", "precision": 0.78,
         "recall": 0.72, "f1_score": 0.75, "is_baseline": False,
         "data_points_train": 200, "data_points_validation": 50,
         "notes": "Random Forest classifier for shortage risk on synthetic data."},
    ]
    
    for e in evals:
        ev = ModelEvaluation(
            training_data_start=date(2023, 10, 1),
            training_data_end=date(2026, 3, 31),
            validation_data_start=date(2026, 4, 1),
            validation_data_end=date(2026, 9, 30),
            **e,
        )
        db.add(ev)
    
    db.flush()
    return len(evals)


def _create_quality_report(db: Session, total_records: int):
    report = DataQualityReport(
        total_records=total_records,
        active_records=int(total_records * 0.6),
        duplicate_records=0,
        completeness_title=1.0,
        completeness_location=0.95,
        completeness_salary=0.88,
        completeness_skills=0.92,
        completeness_sector=1.0,
        overall_quality_score=0.85,
        issues=["All data is synthetic - for demonstration only"],
        recommendations=["Connect real data sources for production use"],
    )
    db.add(report)
    db.flush()
