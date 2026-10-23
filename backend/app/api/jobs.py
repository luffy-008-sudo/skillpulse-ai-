"""Job search and listing API endpoints."""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database import get_db
from app.models import JobPosting, JobSkill, Skill
from typing import Optional
from datetime import date

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


@router.get("/search")
def search_jobs(
    q: Optional[str] = Query(None, description="Search in job title"),
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    skill: Optional[str] = Query(None),
    employment_type: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    salary_min: Optional[float] = Query(None),
    active_only: bool = Query(True),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Search job postings with filters."""
    query = db.query(JobPosting)
    
    if active_only:
        query = query.filter(JobPosting.is_active == True)
    query = query.filter(JobPosting.is_duplicate == False)
    
    if q:
        query = query.filter(JobPosting.job_title.ilike(f"%{q}%"))
    if state:
        query = query.filter(JobPosting.state == state)
    if district:
        query = query.filter(JobPosting.district == district)
    if sector:
        query = query.filter(JobPosting.sector == sector)
    if employment_type:
        query = query.filter(JobPosting.employment_type == employment_type)
    if date_from:
        query = query.filter(JobPosting.posting_date >= date_from)
    if date_to:
        query = query.filter(JobPosting.posting_date <= date_to)
    if salary_min:
        query = query.filter(JobPosting.salary_min >= salary_min)
    if skill:
        query = query.join(JobSkill).join(Skill).filter(
            Skill.name.ilike(f"%{skill}%")
        )
    
    total = query.count()
    total_pages = (total + page_size - 1) // page_size
    
    jobs = (
        query.order_by(desc(JobPosting.posting_date))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    
    return {
        "items": [
            {
                "id": j.id,
                "job_title": j.job_title,
                "employer_name": j.employer_name,
                "state": j.state,
                "district": j.district,
                "sector": j.sector,
                "salary_min": j.salary_min,
                "salary_max": j.salary_max,
                "experience_min_years": j.experience_min_years,
                "experience_max_years": j.experience_max_years,
                "employment_type": j.employment_type,
                "education_requirement": j.education_requirement,
                "skills_raw": j.skills_raw,
                "posting_date": j.posting_date.isoformat() if j.posting_date else None,
                "is_active": j.is_active,
                "is_synthetic": j.is_synthetic,
            }
            for j in jobs
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.get("/filters")
def get_filter_options(db: Session = Depends(get_db)):
    """Get available filter options."""
    states = [r[0] for r in db.query(func.distinct(JobPosting.state)).filter(
        JobPosting.state.isnot(None)
    ).order_by(JobPosting.state).all()]
    
    sectors = [r[0] for r in db.query(func.distinct(JobPosting.sector)).filter(
        JobPosting.sector.isnot(None)
    ).order_by(JobPosting.sector).all()]
    
    skills = [r[0] for r in db.query(Skill.name).order_by(Skill.name).limit(200).all()]
    
    districts_by_state = {}
    for state in states[:15]:
        districts = [r[0] for r in db.query(func.distinct(JobPosting.district)).filter(
            JobPosting.state == state, JobPosting.district.isnot(None)
        ).order_by(JobPosting.district).all()]
        if districts:
            districts_by_state[state] = districts
    
    return {
        "states": states,
        "sectors": sectors,
        "skills": skills,
        "employment_types": ["Full-time", "Part-time", "Contract", "Internship", "Freelance"],
        "districts_by_state": districts_by_state,
    }
