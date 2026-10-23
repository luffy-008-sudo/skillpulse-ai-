"""CSV upload and data ingestion service."""
import io
import csv
from datetime import datetime, date
from typing import BinaryIO
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import (
    JobPosting, JobSkill, Skill, DataSource, IngestionLog,
)


class IngestionService:
    """Handles CSV upload and data ingestion."""

    REQUIRED_COLUMNS = ["job_title"]
    OPTIONAL_COLUMNS = [
        "employer_name", "state", "district", "city", "sector",
        "salary_min", "salary_max", "experience_min_years", "experience_max_years",
        "employment_type", "education_requirement", "skills", "posting_date",
        "description",
    ]

    def __init__(self, db: Session):
        self.db = db

    def process_csv(self, file_content: bytes, filename: str) -> dict:
        """Process uploaded CSV file and import job postings."""
        log = IngestionLog(
            source_name=f"CSV Upload: {filename}",
            ingestion_type="csv_upload",
            started_at=datetime.utcnow(),
            status="running",
        )
        self.db.add(log)
        self.db.flush()

        errors = []
        imported = 0
        duplicates = 0
        invalid = 0

        try:
            text = file_content.decode("utf-8")
            reader = csv.DictReader(io.StringIO(text))
            
            # Validate columns
            if not reader.fieldnames:
                raise ValueError("CSV file is empty or has no headers")
            
            headers = [h.strip().lower() for h in reader.fieldnames]
            if "job_title" not in headers:
                raise ValueError(f"Required column 'job_title' not found. Found columns: {reader.fieldnames}")

            # Get or create CSV source
            csv_source = self.db.query(DataSource).filter(
                DataSource.name == "CSV Upload"
            ).first()
            if not csv_source:
                csv_source = DataSource(name="CSV Upload", source_type="csv")
                self.db.add(csv_source)
                self.db.flush()

            rows = list(reader)
            log.records_fetched = len(rows)

            for i, row in enumerate(rows):
                try:
                    # Normalize keys
                    row = {k.strip().lower(): v.strip() if v else None for k, v in row.items()}
                    
                    title = row.get("job_title", "").strip()
                    if not title:
                        invalid += 1
                        errors.append(f"Row {i+2}: Missing job_title")
                        continue

                    # Check for duplicates
                    existing = self.db.query(JobPosting).filter(
                        JobPosting.job_title == title,
                        JobPosting.employer_name == row.get("employer_name"),
                        JobPosting.state == row.get("state"),
                        JobPosting.is_duplicate == False,
                    ).first()
                    
                    if existing:
                        duplicates += 1
                        continue

                    # Parse dates
                    posting_date = None
                    if row.get("posting_date"):
                        try:
                            posting_date = date.fromisoformat(row["posting_date"])
                        except ValueError:
                            try:
                                posting_date = datetime.strptime(row["posting_date"], "%d/%m/%Y").date()
                            except ValueError:
                                pass  # Leave as None

                    # Parse numeric fields
                    def parse_float(val):
                        if val is None: return None
                        try: return float(val.replace(",", ""))
                        except (ValueError, AttributeError): return None

                    job = JobPosting(
                        source_id=csv_source.id,
                        external_id=f"CSV-{filename}-{i+1}",
                        job_title=title,
                        job_title_normalized=title.lower(),
                        employer_name=row.get("employer_name"),
                        state=row.get("state"),
                        district=row.get("district"),
                        city=row.get("city"),
                        sector=row.get("sector"),
                        salary_min=parse_float(row.get("salary_min")),
                        salary_max=parse_float(row.get("salary_max")),
                        experience_min_years=parse_float(row.get("experience_min_years")),
                        experience_max_years=parse_float(row.get("experience_max_years")),
                        employment_type=row.get("employment_type"),
                        education_requirement=row.get("education_requirement"),
                        skills_raw=row.get("skills"),
                        posting_date=posting_date,
                        description=row.get("description"),
                        is_active=True,
                        is_synthetic=False,
                    )
                    self.db.add(job)
                    self.db.flush()

                    # Process skills
                    if row.get("skills"):
                        skill_names = [s.strip() for s in row["skills"].split(",") if s.strip()]
                        for skill_name in skill_names:
                            skill = self.db.query(Skill).filter(
                                Skill.name_normalized == skill_name.lower()
                            ).first()
                            if not skill:
                                skill = Skill(
                                    name=skill_name,
                                    name_normalized=skill_name.lower(),
                                    skill_type="technical",
                                )
                                self.db.add(skill)
                                self.db.flush()
                            
                            js = JobSkill(
                                job_posting_id=job.id,
                                skill_id=skill.id,
                                is_required=True,
                            )
                            self.db.add(js)

                    imported += 1

                except Exception as e:
                    invalid += 1
                    errors.append(f"Row {i+2}: {str(e)}")

            # Update source stats
            csv_source.total_records_ingested = (csv_source.total_records_ingested or 0) + imported
            csv_source.last_ingestion_at = datetime.utcnow()

            # Update log
            log.status = "success"
            log.completed_at = datetime.utcnow()
            log.records_new = imported
            log.records_duplicate = duplicates
            log.records_invalid = invalid

            self.db.commit()

        except Exception as e:
            log.status = "failed"
            log.completed_at = datetime.utcnow()
            log.error_message = str(e)
            self.db.commit()
            return {
                "status": "error",
                "records_processed": 0,
                "records_imported": 0,
                "records_duplicate": 0,
                "records_invalid": 0,
                "errors": [str(e)],
            }

        return {
            "status": "success",
            "records_processed": log.records_fetched or 0,
            "records_imported": imported,
            "records_duplicate": duplicates,
            "records_invalid": invalid,
            "errors": errors[:20],  # Limit error messages
        }

    def get_data_sources(self) -> list[dict]:
        sources = self.db.query(DataSource).all()
        return [
            {
                "id": s.id,
                "name": s.name,
                "source_type": s.source_type,
                "description": s.description,
                "is_active": s.is_active,
                "total_records": s.total_records_ingested or 0,
                "last_ingestion": s.last_ingestion_at.isoformat() if s.last_ingestion_at else None,
                "data_quality_score": s.data_quality_score,
                "coverage_notes": s.coverage_notes,
            }
            for s in sources
        ]

    def get_ingestion_logs(self, limit: int = 20) -> list[dict]:
        logs = (
            self.db.query(IngestionLog)
            .order_by(IngestionLog.started_at.desc())
            .limit(limit)
            .all()
        )
        return [
            {
                "id": l.id,
                "source_name": l.source_name,
                "ingestion_type": l.ingestion_type,
                "started_at": l.started_at.isoformat(),
                "completed_at": l.completed_at.isoformat() if l.completed_at else None,
                "status": l.status,
                "records_fetched": l.records_fetched,
                "records_new": l.records_new,
                "records_duplicate": l.records_duplicate,
                "records_invalid": l.records_invalid,
                "error_message": l.error_message,
            }
            for l in logs
        ]
