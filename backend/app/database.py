"""Database connection and session management."""
import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import get_settings

settings = get_settings()

def ensure_sqlite_file():
    """Ensure SQLite database exists in /tmp before engine connection on Vercel."""
    if os.environ.get("VERCEL") and settings.database_url.startswith("sqlite:////tmp"):
        import shutil
        tmp_db = "/tmp/skillpulse.db"
        if not os.path.exists(tmp_db) or os.path.getsize(tmp_db) == 0:
            candidates = [
                os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "skillpulse.db"),
                os.path.join(os.getcwd(), "backend", "skillpulse.db"),
                os.path.join(os.getcwd(), "skillpulse.db"),
                "/var/task/backend/skillpulse.db",
                "/var/task/skillpulse.db",
            ]
            for candidate in candidates:
                if os.path.exists(candidate) and os.path.getsize(candidate) > 0:
                    try:
                        shutil.copyfile(candidate, tmp_db)
                        print(f"📦 Pre-loaded bundled database from {candidate} to {tmp_db} ({os.path.getsize(tmp_db)} bytes)")
                        return
                    except Exception as e:
                        print(f"Failed copying database from {candidate} to {tmp_db}: {e}")

ensure_sqlite_file()

connect_args = {}
if settings.database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    echo=False,
)

# SQLite pragmas
if settings.database_url.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        try:
            cursor.execute("PRAGMA foreign_keys=ON")
            # Only enable WAL outside of Vercel serverless (where shared-memory files might fail)
            if not os.environ.get("VERCEL"):
                cursor.execute("PRAGMA journal_mode=WAL")
        except Exception:
            pass
        finally:
            cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    """Dependency for FastAPI routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Create all tables."""
    from app.models import job_posting, skill, forecast, data_source  # noqa
    Base.metadata.create_all(bind=engine)
