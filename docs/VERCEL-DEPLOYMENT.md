# Vercel deployment

Two projects, one repository: (1) static React frontend plus Node API at repository root, (2) accepted FastAPI inference at ml-service. The browser always calls /api on its own origin, avoiding cross-site authentication cookies. MongoDB is a durable external database. No publishing or resource purchase has been performed by the agent.

## 1. Prepare free durable MongoDB

Use MongoDB Community locally; for the Vercel app use an available free MongoDB Atlas deployment that does not require paid plans, credits or billing activation. Create a restricted database user and configure network access for your selected Vercel deployment. Do not grant broader rights than the application databases need. Keep development/preview/production databases separate. If a provider asks for payment, stop provisioning and select a genuinely free arrangement; this app never falls back to ephemeral storage.

## 2. Deploy inference first (user action)

Import the same repository as a Vercel project, Root Directory `ml-service`, FastAPI framework detection, Python 3.14 from .python-version, pinned requirements.txt. Keep the accepted files model/anomaly_model.joblib and model/feature_stats.joblib bundled. Training files/data/tests are excluded. Set ML_SERVICE_TOKEN to your own random secret. Do not enable a training build command. main.py exports app and Vercel invokes it; no permanent uvicorn subprocess.

The health endpoint requires X-Service-Token. Verify model_loaded=true and all baseline vectors from docs/ML-BASELINE.json through the deployed service before opening the application. Standard Python bundle budget is currently 500 MB uncompressed; measure the actual Linux deployment bundle in the Vercel build output. No paid large-function feature is required or configured. The actual pinned Linux CPython 3.14 wheels were downloaded locally: unpacked wheel contents plus accepted model total 250.68 MiB. This is a dependency/model estimate; Vercel-specific bytecode/bundle overhead remains an account build measurement. Actual cloud bundle size/cold start must be confirmed in the user's account; no cloud deployment is claimed here.

## 3. Deploy frontend/API (user action)

Import again with Root Directory the repository root (not frontend or backend). Select Other framework if automatic detection conflicts. Node 24.x comes from package.json. Root vercel.json supplies install `npm ci && npm --prefix frontend ci`, build `npm run build`, output `frontend/dist`. api/[...path].js imports Express without listening and serves /api/*, including errors. Non-API SPA deep links load index.html. Assets/favicon retain their own paths.

Set MONGODB_URI, MONGODB_DB_NAME, SESSION_SECRET, APP_ORIGIN, ML_SERVICE_URL and ML_SERVICE_TOKEN on this project. APP_ORIGIN must exactly match the public browser address. Set the final origin and redeploy before registration testing. For previews use a stable branch preview domain and its exact APP_ORIGIN; do not share production DB/session secret. Do not configure VITE_API_URL, cross-site CORS, or an additional Node project/proxy.

Deploy Python before Node; Python URL is server-only ML_SERVICE_URL. If Vercel deployment protection blocks service calls, configure a permitted free exception for this service endpoint, which already checks the internal token. Do not expose a paid bypass dependency or put service tokens in client code.

## 4. Verify in the real account

- /api/health reports database.connected=true and mlMicroservice.model_loaded=true. It returns degraded status rather than manufactured readiness if ML is missing.
- Register two farmers and verify owner isolation, HTTPS Secure HttpOnly cookies, CSRF, reload and sign-out.
- Test actual crop/reference matches, unsupported combinations, outage behavior and reports in both languages.
- Check /assets and favicon content types; refresh a direct SPA path/hash and ensure /api/nonexistent is JSON, never index.html.
- Save a record, allow a cold invocation/redeploy, then confirm it remains. Check connection reuse/reconnect and database errors without JSON files or downloads.
- Review actual Python bundle size, cold-start duration and free service quotas in the deployment logs.

No Vercel login, MongoDB credentials, deployment URL, account resources or billing were supplied, so these account-specific actions cannot be truthfully marked executed locally. All independent implementation, configuration and local tests are completed separately.

## Rollback

Use Vercel's deployment history to promote the previous known-good frontend/API and matching inference deployment. Keep artifacts and env values matched; do not rotate tokens on only one service. Restore into a new empty database via the maintenance command and change MONGODB_DB_NAME after verifying it. Never overwrite the only backup/database. Re-run health, sign-in and a saved result after promotion.

## Official references checked 2026-11-15

- https://vercel.com/docs/frameworks/backend/express
- https://vercel.com/docs/frameworks/backend/fastapi
- https://vercel.com/docs/functions/runtimes/python
- https://vercel.com/docs/functions/runtimes/node-js
- https://vercel.com/docs/project-configuration/vercel-json
- https://open-meteo.com/en/docs

Free plans have quotas and usage terms; no unlimited production capacity or cloud verification is claimed.
