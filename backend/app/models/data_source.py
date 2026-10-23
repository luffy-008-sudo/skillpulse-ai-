"""Data source and ingestion tracking models."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class DataSource(Base):
    """Registry of data sources (APIs, CSV uploads, etc.)."""
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, autoincrement=True)
    
    name = Column(String(255), nullable=False, unique=True)
    source_type = Column(String(50), nullable=False)  # api, csv, scraper, manual
    description = Column(Text, nullable=True)
    url = Column(Text, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_authorized = Column(Boolean, default=True)
    
    # Refresh info
    refresh_frequency = Column(String(50), nullable=True)  # daily, weekly, monthly
    last_ingestion_at = Column(DateTime, nullable=True)
    next_ingestion_at = Column(DateTime, nullable=True)
    
    # Stats
    total_records_ingested = Column(Integer, default=0)
    total_records_active = Column(Integer, default=0)
    
    # Data quality
    data_quality_score = Column(Float, nullable=True)  # 0-1
    coverage_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    job_postings = relationship("JobPosting", back_populates="source")


class IngestionLog(Base):
    """Log of data ingestion runs."""
    __tablename__ = "ingestion_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    
    source_name = Column(String(255), nullable=False)
    ingestion_type = Column(String(50), nullable=False)  # full, incremental, csv_upload
    
    started_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    status = Column(String(20), nullable=False, default="running")  # running, success, failed, partial
    
    records_fetched = Column(Integer, default=0)
    records_new = Column(Integer, default=0)
    records_updated = Column(Integer, default=0)
    records_duplicate = Column(Integer, default=0)
    records_invalid = Column(Integer, default=0)
    
    error_message = Column(Text, nullable=True)
    details = Column(JSON, nullable=True)


class DataQualityReport(Base):
    """Periodic data quality assessment."""
    __tablename__ = "data_quality_reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    
    report_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    total_records = Column(Integer, default=0)
    active_records = Column(Integer, default=0)
    duplicate_records = Column(Integer, default=0)
    
    # Completeness scores (% of non-null)
    completeness_title = Column(Float, nullable=True)
    completeness_location = Column(Float, nullable=True)
    completeness_salary = Column(Float, nullable=True)
    completeness_skills = Column(Float, nullable=True)
    completeness_sector = Column(Float, nullable=True)
    
    # Overall
    overall_quality_score = Column(Float, nullable=True)
    issues = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
