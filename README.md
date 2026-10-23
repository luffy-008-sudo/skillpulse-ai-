# SkillPulse AI

**"Today's Skills. Tomorrow's Workforce."**

AI-Powered Labour Market Intelligence and Future Skill Demand-Supply Forecasting Platform
Built for: India's Ministry of Skill Development and Entrepreneurship (MSDE)

---

## ⚠️ Demo Mode Notice

All data in the default setup is **synthetically generated** for demonstration purposes.
It does NOT represent actual Indian labour market statistics. Connect authorised real data sources for production.

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Start the Backend

```bash
cd skillpulse-ai/backend
pip3 install -r requirements.txt
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The first startup automatically seeds 5,000 synthetic job postings, skill trends, forecasts, and gap analyses.

### 2. Start the Frontend

```bash
cd skillpulse-ai/frontend
npm install
npm run dev
```

Open **http://localhost:3000**

### 3. API Documentation

Open **http://localhost:8000/docs** for the interactive OpenAPI documentation.

---

## Architecture

```
skillpulse-ai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point + startup
│   │   ├── config.py            # Settings (env vars)
│   │   ├── database.py          # SQLAlchemy + SQLite setup
│   │   ├── models/              # ORM models
│   │   │   ├── job_posting.py   # JobPosting, JobSkill
│   │   │   ├── skill.py         # Skill, SkillCategory, OccupationCode
│   │   │   ├── forecast.py      # DemandForecast, SkillTrend, GapAnalysis
│   │   │   └── data_source.py   # DataSource, IngestionLog
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── api/                 # FastAPI route handlers
│   │   │   ├── dashboard.py     # Market overview, trends
│   │   │   ├── forecast.py      # Predictions, emerging skills
│   │   │   ├── gaps.py          # Gap analysis, simulator, recommendations
│   │   │   ├── jobs.py          # Job search
│   │   │   └── ingestion.py     # CSV upload, data sources
│   │   ├── services/            # Business logic
│   │   │   ├── analytics_service.py   # Engine 1: Current job intelligence
│   │   │   ├── forecast_service.py    # Engine 2: Future skills forecasting
│   │   │   └── gap_service.py         # Engine 3: Demand-supply decision
│   │   ├── ingestion/
│   │   │   └── naukri_static.py  # Naukri 2019 historical importer
│   │   └── utils/
│   │       ├── indian_data.py    # India reference data (states, sectors, skills)
│   │       └── seed_data.py      # Synthetic data generator
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── app/                 # Next.js App Router pages
    │   │   ├── page.tsx         # Overview dashboard
    │   │   ├── jobs/            # Current Job Intelligence
    │   │   ├── forecast/        # Future Skills Forecast
    │   │   ├── gaps/            # Skill Gap Analysis
    │   │   ├── simulator/       # Training Policy Simulator
    │   │   ├── emerging/        # Emerging Skills Radar
    │   │   ├── data-sources/    # Data management
    │   │   └── models/          # Model performance
    │   ├── components/          # Reusable UI components
    │   └── lib/api.ts           # API client
    └── package.json
```

---

## Key Features

### Engine 1 — Current Job Intelligence
- 5,000 job postings across 16 sectors, 13 states
- Full-text search, multi-filter job browser
- Top skills, sectors, salary distributions
- Monthly trend analysis

### Engine 2 — Future Skills Forecasting
- ARIMA baseline + XGBoost enhanced models
- 12, 36, and 60-month forecasting horizons
- Confidence intervals on all forecasts
- Emerging skills radar with growth rate ranking
- Sector-level growth trend analysis
- Model evaluation with MAE, RMSE, MAPE metrics

### Engine 3 — Demand-Supply Decision Intelligence
- Gap analysis: 80 skills × 5 geographies
- Severity classification: critical / high / moderate / low / surplus
- Evidence-backed training recommendations
- Training Policy Simulator with adjustable:
  - Training seats, course duration
  - Completion rate, employability rate
  - Forecast horizon

### Data Management
- CSV upload with schema validation
- Naukri 2019 historical dataset importer (unofficial, marked clearly)
- Free API sources registry
- Ingestion logs and data quality reports

---

## API Endpoints

| Endpoint | Description |
|---------|-------------|
| `GET /api/health` | Health check |
| `GET /api/dashboard/overview` | Market KPIs |
| `GET /api/dashboard/top-skills` | Top demanded skills |
| `GET /api/dashboard/monthly-trend` | Job posting trends |
| `GET /api/forecast/predict` | Generate/retrieve forecast |
| `GET /api/forecast/emerging-skills` | Skills with highest growth |
| `GET /api/forecast/sector-growth` | Sector growth indicators |
| `GET /api/forecast/model-evaluations` | Model performance metrics |
| `GET /api/gaps/analysis` | Demand-supply gap analysis |
| `POST /api/gaps/simulate` | Run policy simulation |
| `GET /api/gaps/recommendations` | Training recommendations |
| `GET /api/jobs/search` | Search job postings |
| `POST /api/data/upload-csv` | Upload job posting CSV |
| `POST /api/data/import-naukri-static` | Import 2019 historical data |
| `GET /api/data/free-api-sources` | Available free data sources |

Full interactive docs: **http://localhost:8000/docs**

---

## Data Sources

| Source | Type | Status | Note |
|--------|------|--------|------|
| Synthetic Demo Data | Generated | ✅ Active | Clearly labelled, 5,000 records |
| CSV Upload | User-provided | ✅ Available | Any job data CSV |
| Naukri 2019 (Unofficial) | Historical | ⚠️ Unofficial | 2019 data, not authorised by Naukri |
| Adzuna India | Live API | 🔗 Register | Free tier, 1000 calls/month |
| NSDC Open Data | Government | 🔗 Upload | Use CSV upload for NSDC data |

---

## Ethical & Legal Notes

- Synthetic data is **never** presented as real statistics
- All forecasts include confidence intervals and reliability warnings
- The Naukri static dataset is marked as unofficial and from 2019
- No scraping, no ToS violations, no bypassing authentication
- All predictions distinguish observed facts from model projections

---

## Future Production Steps

1. Replace SQLite with PostgreSQL
2. Register for Adzuna India API (free tier)
3. Connect NSDC/e-Shram authorised data feeds
4. Add user authentication
5. Deploy with Docker Compose
6. Set up scheduled ingestion jobs via APScheduler
