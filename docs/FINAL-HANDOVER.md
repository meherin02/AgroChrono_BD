# Final handover

Implemented farmer-only registration/sign-in/sign-out, secure persistent sessions and owner-scoped records; profile/optional consented phone and farm plots; real-data dashboard/history/search/pagination; strict full stage/date validation; same-origin CSRF and persistent atomic login throttling; idempotent durable analysis; immutable linked revisions and signed comparisons; revision-specific activities; persistent deduplicated in-app forecast alerts; exact reference applicability and provenance snapshots; sourced stage guidance; bilingual CSV/print/PDF; complete English/Bengali labels/errors/dates/numbers and per-farmer local draft privacy.

The existing accepted ML artifacts/feature ordering/prediction direction/numerical output behavior are preserved. Original model hashes and four inference responses are in ML-BASELINE.json and ML-ARTIFACT-HASHES.json. Successful scoring arithmetic is unchanged. Integration changes make weather/ML failures explicit rather than producing invented features or normal predictions. Editable suggestions are now chronologically valid even across years; they do not promise a higher score.

Removed obsolete Netlify configs, personal Railway fallback, runtime Mongo binary/memory-server production path, JSON persistence fallback, unconditional application import/listen and CI/build model training. Vercel configuration uses root frontend+Node API and separate ml-service FastAPI, with durable external MongoDB and server-only secrets. Local Docker files were updated as an optional alternative development environment, independent of Vercel.

Executed results: 19 backend/operations tests, 5 browser journeys and 3 model-parity/transport unittest methods passed. Translation coverage/build/format checks passed. The live weather smoke succeeded. Read VERIFICATION.md for actual evidence, fixture distinctions, packaging size and the precise limits of local verification. No new model accuracy or nationwide agricultural coverage is claimed. No paid key, LLM, billing activation, deployment or purchase was used.

## User setup to publish

1. Create/use a genuinely free durable MongoDB database; supply its restricted connection URI and separate preview/production database names.
2. Import the repository's ml-service as the FastAPI Vercel project; set your generated ML_SERVICE_TOKEN, deploy and verify authenticated model health.
3. Import repository root as frontend+Node Vercel project; set MONGODB_URI, MONGODB_DB_NAME, SESSION_SECRET, APP_ORIGIN, ML_SERVICE_URL and matching ML_SERVICE_TOKEN. Never use VITE_* for secrets.
4. Redeploy after setting the exact public origin. Run the documented cloud HTTPS/cold-start/persistence/owner-isolation checks and inspect actual Linux bundle size/free quotas in your account.

Read VERCEL-DEPLOYMENT.md and ENVIRONMENT-VARIABLES.md for exact settings; DATA-MIGRATION.md for ownerless data archival, restricted backups and safe restore; FEATURE-TRACEABILITY.md for the seven-diagram mapping. No database URI or account secret is required in a chat message; configure it in your own environment/Vercel dashboard.

## Local review instance

The built application is started at http://127.0.0.1:3000, backed by a separate agrochrono_local database on the isolated local MongoDB port 27029 and the accepted inference service on 8001. Register your own farmer account. Generated local secrets are in ignored backend/.env and have not been printed or committed. Owned process IDs are in .local/local-processes.json; the local MongoDB process was also started for this task. These local addresses are not production defaults or deployment URLs.

The resubmitted prompt was checked against existing work. Remaining application gaps were implemented and regression-tested; see REQUIREMENTS-COMPLETION-AUDIT.md and the latest completion-* evidence logs. The account form still uses one farmer name, as specifically requested.
