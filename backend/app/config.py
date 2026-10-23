"""Application configuration using pydantic-settings."""
import os
from pydantic_settings import BaseSettings
from functools import lru_cache

def get_default_database_url() -> str:
    # On Vercel serverless, only /tmp is writable
    if os.environ.get("VERCEL"):
        return os.environ.get("DATABASE_URL") or "sqlite:////tmp/skillpulse.db"
    return os.environ.get("DATABASE_URL") or "sqlite:///./skillpulse.db"

class Settings(BaseSettings):
    app_name: str = "SkillPulse AI"
    app_version: str = "1.0.0"
    app_tagline: str = "Today's Skills. Tomorrow's Workforce."
    
    database_url: str = get_default_database_url()
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
