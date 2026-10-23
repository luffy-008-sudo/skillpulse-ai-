"""Application configuration using pydantic-settings."""
import os
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "SkillPulse AI"
    app_version: str = "1.0.0"
    app_tagline: str = "Today's Skills. Tomorrow's Workforce."
    
    database_url: str = "sqlite:///./skillpulse.db"
    secret_key: str = "change-me-in-production"
    
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    frontend_url: str = "http://localhost:3000"
    
    demo_mode: bool = True
    log_level: str = "INFO"
    
    # Forecasting defaults
    default_forecast_horizons: list[int] = [12, 36, 60]  # months
    min_data_points_for_forecast: int = 6
    
    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

@lru_cache()
def get_settings() -> Settings:
    return Settings()
