"""Skill, SkillCategory, and OccupationCode models."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Index
from sqlalchemy.orm import relationship
from app.database import Base


class SkillCategory(Base):
    """Top-level skill categories (e.g., IT, Healthcare, Manufacturing)."""
    __tablename__ = "skill_categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    sector = Column(String(255), nullable=True)
    
    skills = relationship("Skill", back_populates="category")
    created_at = Column(DateTime, default=datetime.utcnow)


class Skill(Base):
    """Individual skill (e.g., Python, Welding, Data Analysis)."""
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    name_normalized = Column(String(255), nullable=True, index=True)
    
    category_id = Column(Integer, ForeignKey("skill_categories.id"), nullable=True)
    skill_type = Column(String(50), nullable=True)  # technical, soft, domain
    
    # NSQF alignment
    nsqf_level_min = Column(Integer, nullable=True)
    nsqf_level_max = Column(Integer, nullable=True)
    
    is_emerging = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    
    # Relationships
    category = relationship("SkillCategory", back_populates="skills")
    job_skills = relationship("JobSkill", back_populates="skill")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("idx_skill_name_category", "name_normalized", "category_id"),
    )

    def __repr__(self):
        return f"<Skill(id={self.id}, name='{self.name}')>"


class OccupationCode(Base):
    """NCO (National Classification of Occupations) codes."""
    __tablename__ = "occupation_codes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(20), nullable=False, unique=True, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    level = Column(Integer, nullable=True)  # 1-digit, 2-digit, etc.
    parent_code = Column(String(20), nullable=True)
    sector = Column(String(255), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
