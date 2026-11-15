# AgroChrono-BD

Farmer crop-calendar assessment, private planning and forecast advisories in Bengali and English. React/Vite frontend, Express Node API, durable MongoDB and the existing accepted Isolation Forest FastAPI inference. No paid API key, LLM, OTP service or billing resource is required. No fabricated agricultural accuracy is claimed.

## Live application

- **Website:** [agrochronobd-sigma.vercel.app](https://agrochronobd-sigma.vercel.app/)
- **ML service:** [ml-service-agro.vercel.app](https://ml-service-agro.vercel.app/)

Farmers use the website to register, plan crop calendars, view assessments and manage activities. The Python ML service is called by the application API using an internal service token; opening its URL directly may return an authentication error.

## Tools and technologies

| Area | Tools | Purpose |
| --- | --- | --- |
| Frontend | JavaScript, React 18, Vite | Farmer dashboard, forms, calendars and assessment views |
| UI and styling | CSS, Tailwind CSS, Lucide React | Responsive layout, styling and icons |
| Application API | Node.js, Express 4, Axios, dotenv | Authentication, validation, assessment coordination and service requests |
| Database | MongoDB, Mongoose | Farmer accounts, private calendars, results, activities and weather cache |
| ML API | Python, FastAPI, Pydantic, Uvicorn | Validated inference requests and model serving |
| Machine learning | scikit-learn Isolation Forest, NumPy, pandas, SciPy, joblib | Anomaly screening, numerical processing and saved model artifacts |
| Weather data | Open-Meteo historical, forecast and climate APIs | District weather context and clearly labelled climate projections |
| Agricultural references | Stored BAMIS, BRRI and BARI references | Crop-season windows, growth duration and threshold comparisons |
| Languages | Shared English/Bangla JSON dictionaries, JavaScript Intl | Translated interface, dates and numbers |
| Testing and formatting | Node.js test runner, Playwright, Python unittest, Prettier | API and browser checks, inference checks and code formatting |
| Deployment and workflow | Git, GitHub, GitHub Actions, Vercel | Version control, CI and separate website/API and ML deployments |
| Optional local environment | Docker Compose, MongoDB Community | Local services and persistent development storage |

The reliability score expresses calendar compatibility with the stored references and available weather. Isolation Forest provides anomaly screening; the displayed reliability score is not measured ML accuracy or a harvest-success probability.

## Local setup

Use Node 24, Python 3.14 and MongoDB Community. From the repository root:

```
npm ci
npm --prefix backend ci
npm --prefix frontend ci
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r ml-service/requirements.txt
```

On Linux use .venv/bin/python. Copy backend/.env.example to backend/.env and fill MONGODB_URI, MONGODB_DB_NAME, SESSION_SECRET (32+ random characters), APP_ORIGIN and matching ML_SERVICE_TOKEN. No automatic embedded database/JSON fallback. Start an ordinary local MongoDB daemon; keep its files outside source control.

Run Python from repository root in a separate PowerShell terminal:

```
$env:ML_SERVICE_TOKEN='your-own-local-token'
.venv\Scripts\python.exe -m uvicorn main:app --app-dir ml-service --host 127.0.0.1 --port 8001
```

Start Node in another terminal from backend (`npm start`); this loads backend/.env. Start frontend from frontend (`npm run dev`), then use http://127.0.0.1:3000 and exactly that APP_ORIGIN. Browser API requests use /api. Never run training to start or deploy the accepted model. Both original joblib artifacts are already included.

## Verification

Use a separate local MongoDB on port 27029, or set TEST_MONGODB_URI to an isolated test server. Tests generate new database names and never use the application DB.

```
npm test
.venv\Scripts\python.exe ml-service/test_inference.py
npm run test:translations
npm run build
npx playwright install chromium
npm run test:browser
```

Browser tests start their own Node/Python/Vite services on 5019/8019/4179, use genuine inference and isolated MongoDB, and substitute clearly labelled weather fixtures for deterministic transport testing. Separate live weather smoke evidence, when run, is not agricultural validation. Logs/screenshots/PDF output are under .local/evidence and excluded from Git. CI runs tests without retraining.

## Deployment and operations

Vercel topology: repository root for frontend + Node API; ml-service for FastAPI; external durable MongoDB. Public application and service links are listed above. Exact roots, env settings, deployment order, health/cold-start checks and rollback: [Vercel deployment](docs/VERCEL-DEPLOYMENT.md).

- [Implementation inventory](docs/IMPLEMENTATION-INVENTORY.md)
- [Farmer behavior/security](docs/FARMER-APPLICATION.md)
- [Seven-diagram mapping](docs/FEATURE-TRACEABILITY.md)
- [Environment table](docs/ENVIRONMENT-VARIABLES.md)
- [Migration/backup/restore](docs/DATA-MIGRATION.md)
- [Actual verification](docs/VERIFICATION.md)
- [Handover](docs/FINAL-HANDOVER.md)
- [Preserved model baseline](docs/ML-BASELINE.json)

Optional Docker Compose is local development only (root build contexts, persistent Mongo volume, matching tokens). Vercel does not depend on Docker. Do not commit .env, private backups, data stores, session/service tokens or local databases.
