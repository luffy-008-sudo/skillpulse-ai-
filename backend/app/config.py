"""Application configuration using pydantic-settings."""
import os
from pydantic_settings import BaseSettings
from functools import lru_cache

def get_default_database_url() -> str:
    # If explicitly set in environment, use it
    if os.environ.get("DATABASE_URL"):
        return os.environ["DATABASE_URL"]
    # On Vercel serverless, only /tmp is writable
    if os.environ.get("VERCEL"):
        return "sqlite:////tmp/skillpulse.db"
    
    # Locate skillpulse.db relative to backend package directory
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    bundled_db = os.path.join(backend_dir, "skillpulse.db")
    if os.path.exists(bundled_db):
        return f"sqlite:///{bundled_db}"
    return "sqlite:///./skillpulse.db"

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
