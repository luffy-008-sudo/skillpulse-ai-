"""Job posting and job-skill association models."""
from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Float, Text, Date, DateTime,
    Boolean, ForeignKey, Index, Table
)
from sqlalchemy.orm import relationship
from app.database import Base


class JobPosting(Base):
    """Represents a single job posting from any data source."""
    __tablename__ = "job_postings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Source tracking
    source_id = Column(Integer, ForeignKey("data_sources.id"), nullable=True)
    external_id = Column(String(255), nullable=True)  # ID from original source
    source_url = Column(Text, nullable=True)
    
    # Core job information
    job_title = Column(String(500), nullable=False, index=True)
    job_title_normalized = Column(String(500), nullable=True, index=True)
    employer_name = Column(String(500), nullable=True)
    employer_industry = Column(String(255), nullable=True)
    
    # Location (India-focused)
    state = Column(String(100), nullable=True, index=True)
    district = Column(String(100), nullable=True, index=True)
    city = Column(String(100), nullable=True)
    location_raw = Column(String(500), nullable=True)
    is_remote = Column(Boolean, default=False)
    
    # Compensation
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    salary_currency = Column(String(10), default="INR")
    salary_period = Column(String(20), default="yearly")  # yearly, monthly, daily
    
    # Job details
    experience_min_years = Column(Float, nullable=True)
    experience_max_years = Column(Float, nullable=True)
    employment_type = Column(String(50), nullable=True)  # full-time, part-time, contract, internship
    education_requirement = Column(String(255), nullable=True)
    
    # Classification
    sector = Column(String(255), nullable=True, index=True)
    occupation_code = Column(String(20), nullable=True, index=True)  # NCO code
    nsqf_level = Column(Integer, nullable=True)  # 1-10
    
    # Description
    description = Column(Text, nullable=True)
    skills_raw = Column(Text, nullable=True)  # Comma-separated raw skills
    
    # Status and dates
    posting_date = Column(Date, nullable=True, index=True)
    expiry_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    is_duplicate = Column(Boolean, default=False)
    duplicate_of_id = Column(Integer, ForeignKey("job_postings.id"), nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_synthetic = Column(Boolean, default=False)  # Flag for demo data
    
    # Relationships
    source = relationship("DataSource", back_populates="job_postings")
    skills = relationship("JobSkill", back_populates="job_posting", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index("idx_posting_state_sector", "state", "sector"),
        Index("idx_posting_date_sector", "posting_date", "sector"),
        Index("idx_posting_state_date", "state", "posting_date"),
    )

    def __repr__(self):
        return f"<JobPosting(id={self.id}, title='{self.job_title}', state='{self.state}')>"


class JobSkill(Base):
    """Many-to-many relationship between jobs and skills."""
    __tablename__ = "job_skills"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_posting_id = Column(Integer, ForeignKey("job_postings.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    
    is_required = Column(Boolean, default=True)  # required vs preferred
    proficiency_level = Column(String(50), nullable=True)  # beginner, intermediate, advanced
    
    job_posting = relationship("JobPosting", back_populates="skills")
    skill = relationship("Skill", back_populates="job_skills")

    __table_args__ = (
        Index("idx_jobskill_job_skill", "job_posting_id", "skill_id", unique=True),
    )
