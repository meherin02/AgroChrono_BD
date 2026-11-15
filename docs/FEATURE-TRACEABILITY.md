# Seven-diagram traceability (farmer scope)

| Diagram / requirement | Implementation | Verification evidence |
|---|---|---|
| Use-case: farmer input, validation, analysis, fields, score, explanations and save | CalendarForm, ResultView, analysis.js, exact references, Mongo results | backend validation/analysis/CSV tests; desktop browser journey |
| Sequence: input → references/weather → accepted ML → score → durable save | validation.js, weatherService.js, mlService.js, analysis.js; atomic result insert | HTTP pipeline with controlled weather fixtures; browser uses actual frozen inference; Python exact parity |
| Activity: actionable validation correction and retained input | structured error codes/fields, controlled draft, focused error banner | invalid input tests; mobile Bengali date error/language/reload |
| State: progress/success/failure/retry, stale response protection | busy guards, selection/history epochs, owner checks on async refresh, persisted idempotency requests | concurrent HTTP retry; browser retained draft/revision reload |
| Component: independent validation/reference/weather/ML/persistence/scoring | backend services/config/routes + frontend components; scoring artifact behavior preserved | module/HTTP tests; model hashes and baseline outputs |
| Collaboration: account/location/calendar/activity/advisory/alerts | farmer profile and plots, calendar dates, revision-scoped activities, sourced advisory, persisted notifications | owner/activity/notification tests; desktop/mobile journeys |
| Deployment: farmer browser → Vercel frontend/API → FastAPI + durable DB | root vercel.json, api/[...path].js, ml-service/main.py and vercel.json; production no fallback | production build/local real DB; account-specific cloud checks in VERCEL-DEPLOYMENT |
| Private farmer data | auth.js and session-derived owner filters across all private routes | two farmers, guessed IDs, CSV/revision/activity/plot/notification isolation |
| Bilingual experience | shared/locales.json, typed structured errors, localized reports/labels | translation coverage check, both-language browser/CSV/print |
| Reports and corrections | immutable original, parent/root/comparison, editable preview, report CSV and print | linked revision/reload and escaped bilingual CSV tests; screenshots |

The report overview at E:/Downloads/AgroChrono.pdf and supplied diagrams informed this mapping. Updated product scope deliberately has farmer accounts only. Older officer/SMS/mainframe boxes are superseded by private farmer records, in-app alerts and the documented two-project deployment. No new agricultural-model research, humidity feature, additional model comparison, national reference expansion or new accuracy claim is part of this accepted-model implementation task.
