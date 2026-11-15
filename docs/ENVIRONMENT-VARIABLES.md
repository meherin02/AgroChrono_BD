# Environment variables

| Variable | Service | Secret | Local / preview / production |
|---|---|---|---|
| MONGODB_URI | root Node API | yes | Local Community Mongo or an actual free durable Atlas arrangement. No embedded Mongo/JSON fallback. Use isolated preview and production databases. |
| MONGODB_DB_NAME | Node API | no | Defaults agrochrono; set a separate name per environment. Tests use generated isolated names. |
| SESSION_SECRET | Node API | yes | At least 32 randomly generated characters. Rotate invalidates sessions. Never a VITE variable. |
| APP_ORIGIN | Node API | no | Exact browser origin including scheme/port, no trailing slash; local http://127.0.0.1:3000, real preview/production Vercel URL per environment. |
| ML_SERVICE_URL | Node API | no | Local http://127.0.0.1:8001; HTTPS address of the separately deployed inference project in cloud. No production localhost fallback. |
| ML_SERVICE_TOKEN | both Node API and Python | yes | Same random internal token in both services. Required for production inference; never in browser. |
| ENVIRONMENT | Python | no | Optional development locally; production outside Vercel. VERCEL is provided by Vercel itself. |
| PORT / HOST | local Node startup | no | Defaults 5000 / 127.0.0.1. Container sets HOST=0.0.0.0. Unused by Vercel handler. |
| VITE_BACKEND_URL | Vite dev/preview command | no | Local proxy target only; never a production browser API setting. Browser uses /api on same origin. |
| TEST_MONGODB_URI | tests only | potentially | Isolated local/CI Community Mongo, default port 27029. Never the farmer DB. |
| CHROME_EXECUTABLE | browser tests only | no | Optional installed Chromium path; omit with Playwright-managed browser. |

No VITE secret variables, paid keys or OpenAI/hosted LLM integration. Python uvicorn does not load .env automatically; set its token in the terminal. Node reads backend/.env when started from backend; root Vercel uses platform environment variables.
