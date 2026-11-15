# AgroChrono-BD

Farmer crop-calendar assessment, private planning and forecast advisories in Bengali and English. React/Vite frontend, Express Node API, durable MongoDB and the existing accepted Isolation Forest FastAPI inference. No paid API key, LLM, OTP service or billing resource is required. No fabricated agricultural accuracy is claimed.

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

Vercel topology: repository root for frontend + Node API; ml-service for FastAPI; external durable free MongoDB. Exact roots, env settings, deployment order, health/cold-start checks and rollback: [Vercel deployment](docs/VERCEL-DEPLOYMENT.md). No cloud project has been published by the agent.

- [Implementation inventory](docs/IMPLEMENTATION-INVENTORY.md)
- [Farmer behavior/security](docs/FARMER-APPLICATION.md)
- [Seven-diagram mapping](docs/FEATURE-TRACEABILITY.md)
- [Environment table](docs/ENVIRONMENT-VARIABLES.md)
- [Migration/backup/restore](docs/DATA-MIGRATION.md)
- [Actual verification](docs/VERIFICATION.md)
- [Handover](docs/FINAL-HANDOVER.md)
- [Preserved model baseline](docs/ML-BASELINE.json)

Optional Docker Compose is local development only (root build contexts, persistent Mongo volume, matching tokens). Vercel does not depend on Docker. Do not commit .env, private backups, data stores, session/service tokens or local databases.
