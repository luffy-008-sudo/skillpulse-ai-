"""
Naukri Static Dataset Importer.

Uses the publicly available static JSON dataset from:
  https://suraj-996.github.io/Naukri.com-API/api.json
  (GitHub: suraj-996/Naukri.com-API)

IMPORTANT DISCLAIMER:
- This is a static snapshot of Naukri data from 2019, not an official API.
- Naukri.com does not authorise this redistribution.
- Data is labelled as 'naukri_static_2019' and treated as historical reference only.
- Do NOT present this as current market data.
"""
import json
import re
import httpx
from datetime import datetime, date
from sqlalchemy.orm import Session
from app.models import JobPosting, JobSkill, Skill, DataSource, IngestionLog

SOURCE_URL = "https://suraj-996.github.io/Naukri.com-API/api.json"
SOURCE_NAME = "Naukri Static Dataset 2019 (Unofficial)"


def _parse_salary(salary_str: str):
    """Parse Indian salary string like '3,00,000 - 8,00,000 PA.'"""
    if not salary_str or "Not Disclosed" in salary_str:
        return None, None
    try:
        nums = re.findall(r"[\d,]+", salary_str)
        nums = [int(n.replace(",", "")) for n in nums if len(n.replace(",", "")) >= 4]
        if len(nums) >= 2:
            return float(nums[0]), float(nums[1])
        elif len(nums) == 1:
            return float(nums[0]), float(nums[0])
    except Exception:
        pass
    return None, None


def _parse_experience(exp_str: str):
    """Parse '5 - 10 yrs' or '1 yrs' etc."""
    if not exp_str:
        return None, None
    try:
        nums = re.findall(r"\d+", exp_str)
        if len(nums) >= 2:
            return float(nums[0]), float(nums[1])
        elif len(nums) == 1:
            return float(nums[0]), None
    except Exception:
        pass
    return None, None


def _map_functional_area_to_sector(functional_area: str, role_category: str) -> str:
    if not functional_area:
        return None
    fa = functional_area.lower()
    if "it software" in fa or "it hardware" in fa or "software" in fa:
        return "Information Technology"
    if "teaching" in fa or "education" in fa or "training" in fa:
        return "Education & Training"
    if "banking" in fa or "finance" in fa or "financial" in fa:
        return "Banking & Financial Services"
    if "health" in fa or "medical" in fa or "pharma" in fa:
        return "Healthcare & Pharmaceuticals"
    if "manufacturing" in fa or "production" in fa:
        return "Manufacturing"
    if "retail" in fa or "ecommerce" in fa:
        return "Retail & E-Commerce"
    if "hospitality" in fa or "hotel" in fa or "travel" in fa:
        return "Tourism & Hospitality"
    if "telecom" in fa:
        return "Telecommunications"
    if "automobile" in fa or "automotive" in fa:
        return "Automotive"
    if "logistics" in fa or "supply chain" in fa:
        return "Logistics & Supply Chain"
    return None


def import_naukri_static(db: Session, max_records: int = 2000) -> dict:
    """
    Download and import the static Naukri dataset.
    Clearly labelled as historical 2019 data, not current market intelligence.
    """
    log = IngestionLog(
        source_name=SOURCE_NAME,
        ingestion_type="naukri_static_import",
        started_at=datetime.utcnow(),
        status="running",
    )
    db.add(log)
    db.flush()

    # Get or create data source
    source = db.query(DataSource).filter(DataSource.name == SOURCE_NAME).first()
    if not source:
        source = DataSource(
            name=SOURCE_NAME,
            source_type="static_dataset",
            description=(
                "Static JSON snapshot of Naukri job postings from 2019. "
                "Source: github.com/suraj-996/Naukri.com-API. "
                "NOT an official Naukri API. Data from 2019 only. "
                "Used for historical reference and demo purposes."
            ),
            url=SOURCE_URL,
            is_active=True,
            is_authorized=False,  # Not officially authorised
            data_quality_score=0.6,
            coverage_notes="Historical India job data, 2019. Locations: major metros. Not representative of current market.",
        )
        db.add(source)
        db.flush()

    try:
        resp = httpx.get(SOURCE_URL, timeout=30.0)
        resp.raise_for_status()
        data = resp.json()
        records = data.get("content", data) if isinstance(data, dict) else data
    except Exception as e:
        log.status = "failed"
        log.completed_at = datetime.utcnow()
        log.error_message = f"Failed to fetch: {e}"
        db.commit()
        return {"status": "error", "error": str(e)}

    imported = 0
    duplicates = 0
    invalid = 0
    log.records_fetched = min(len(records), max_records)

    for i, rec in enumerate(records[:max_records]):
        try:
            title = rec.get("job_title", "").strip()
            if not title:
                invalid += 1
                continue

            # Skip existing
            if db.query(JobPosting).filter(
                JobPosting.external_id == rec.get("uniq_id")
            ).first():
                duplicates += 1
                continue

            sal_min, sal_max = _parse_salary(rec.get("job_salary", ""))
            exp_min, exp_max = _parse_experience(rec.get("job_experience_required", ""))
            sector = _map_functional_area_to_sector(
                rec.get("functional_area", ""), rec.get("role_category", "")
            )

            # Parse posting date
            posting_date = None
            ts = rec.get("timestamp")
            if ts:
                try:
                    posting_date = datetime.strptime(ts[:10], "%Y-%m-%d").date()
                except Exception:
                    pass

            # Parse location (may be multiple: "Delhi NCR,Chennai,Bengaluru")
            location_raw = rec.get("location", "")
            locations = [l.strip() for l in location_raw.split(",")]
            primary_location = locations[0] if locations else None

            # Map location to state
            loc_state_map = {
                "Mumbai": "Maharashtra", "Pune": "Maharashtra", "Nagpur": "Maharashtra",
                "Bengaluru": "Karnataka", "Bangalore": "Karnataka", "Mysuru": "Karnataka",
                "Delhi": "Delhi", "Delhi NCR": "Delhi", "New Delhi": "Delhi",
                "Gurgaon": "Haryana", "Gurugram": "Haryana", "Faridabad": "Haryana",
                "Chennai": "Tamil Nadu", "Coimbatore": "Tamil Nadu",
                "Hyderabad": "Telangana", "Secunderabad": "Telangana",
                "Kolkata": "West Bengal",
                "Ahmedabad": "Gujarat", "Surat": "Gujarat",
                "Lucknow": "Uttar Pradesh", "Noida": "Uttar Pradesh", "Kanpur": "Uttar Pradesh",
                "Jaipur": "Rajasthan",
                "Chandigarh": "Chandigarh",
                "Kochi": "Kerala", "Thiruvananthapuram": "Kerala",
            }
            state = loc_state_map.get(primary_location)

            job = JobPosting(
                source_id=source.id,
                external_id=rec.get("uniq_id"),
                job_title=title,
                job_title_normalized=title.lower().strip(),
                employer_industry=rec.get("industry"),
                state=state,
                city=primary_location,
                location_raw=location_raw,
                salary_min=sal_min,
                salary_max=sal_max,
                salary_currency="INR",
                salary_period="yearly",
                experience_min_years=exp_min,
                experience_max_years=exp_max,
                sector=sector,
                skills_raw=rec.get("key_skills", "").replace("|", ","),
                posting_date=posting_date,
                is_active=False,  # 2019 data - not active
                is_synthetic=False,
                description=f"Role: {rec.get('role', '')} | Category: {rec.get('role_category', '')} | Area: {rec.get('functional_area', '')}",
            )
            db.add(job)
            db.flush()

            # Skills
            skills_raw = rec.get("key_skills", "")
            if skills_raw:
                skill_names = [s.strip() for s in skills_raw.split("|") if s.strip()][:8]
                for skill_name in skill_names:
                    skill = db.query(Skill).filter(
                        Skill.name_normalized == skill_name.lower()
                    ).first()
                    if not skill:
                        skill = Skill(
                            name=skill_name,
                            name_normalized=skill_name.lower(),
                            skill_type="technical",
                        )
                        db.add(skill)
                        db.flush()
                    js = JobSkill(job_posting_id=job.id, skill_id=skill.id)
                    db.add(js)

            imported += 1

        except Exception as e:
            invalid += 1

    source.total_records_ingested = (source.total_records_ingested or 0) + imported
    source.last_ingestion_at = datetime.utcnow()

    log.status = "success"
    log.completed_at = datetime.utcnow()
    log.records_new = imported
    log.records_duplicate = duplicates
    log.records_invalid = invalid
    db.commit()

    return {
        "status": "success",
        "source": SOURCE_NAME,
        "disclaimer": "This is 2019 historical data, NOT current market intelligence. Not officially authorized by Naukri.com.",
        "records_fetched": log.records_fetched,
        "records_imported": imported,
        "records_duplicate": duplicates,
        "records_invalid": invalid,
    }
