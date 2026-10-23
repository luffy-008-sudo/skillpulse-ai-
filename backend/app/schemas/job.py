"""Job-related Pydantic schemas."""
from datetime import date, datetime
from pydantic import BaseModel, Field
from typing import Optional


class JobPostingBase(BaseModel):
    job_title: str
    employer_name: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    sector: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    experience_min_years: Optional[float] = None
    experience_max_years: Optional[float] = None
    employment_type: Optional[str] = None
    education_requirement: Optional[str] = None
    skills_raw: Optional[str] = None
    posting_date: Optional[date] = None
    description: Optional[str] = None


class JobPostingCreate(JobPostingBase):
    pass


class JobPostingResponse(JobPostingBase):
    id: int
    job_title_normalized: Optional[str] = None
    occupation_code: Optional[str] = None
    is_active: bool = True
    is_synthetic: bool = False
    created_at: datetime
    skills: list["SkillBrief"] = []

    model_config = {"from_attributes": True}


class SkillBrief(BaseModel):
    id: int
    name: str
    skill_type: Optional[str] = None
    
    model_config = {"from_attributes": True}


class JobSearchParams(BaseModel):
    state: Optional[str] = None
    district: Optional[str] = None
    sector: Optional[str] = None
    skill: Optional[str] = None
    employment_type: Optional[str] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    salary_min: Optional[float] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    page_size: int
    total_pages: int


class CSVUploadResponse(BaseModel):
    status: str
    records_processed: int
    records_imported: int
    records_duplicate: int
    records_invalid: int
    errors: list[str] = []
