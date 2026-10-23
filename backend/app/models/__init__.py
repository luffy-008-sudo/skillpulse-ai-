"""Database models for SkillPulse AI."""
from app.models.job_posting import JobPosting, JobSkill
from app.models.skill import Skill, SkillCategory, OccupationCode
from app.models.forecast import (
    DemandForecast, SkillTrend, DemandSupplyGap,
    TrainingRecommendation, ModelEvaluation
)
from app.models.data_source import DataSource, IngestionLog, DataQualityReport

__all__ = [
    "JobPosting", "JobSkill", "Skill", "SkillCategory", "OccupationCode",
    "DemandForecast", "SkillTrend", "DemandSupplyGap",
    "TrainingRecommendation", "ModelEvaluation",
    "DataSource", "IngestionLog", "DataQualityReport",
]
