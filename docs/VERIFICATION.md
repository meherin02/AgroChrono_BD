# Executed verification

Implementation was tested in this Windows workspace; these are actual executed outcomes, not promised test results or agricultural accuracy estimates.

| Check | Actual result | Evidence |
|---|---|---|
| Backend unit/HTTP/privacy/real Mongo persistence + operations | 19 passed, 0 failed, 0 skipped | .local/evidence/completion-backend.log |
| Browser journeys on built frontend | 5 passed, 0 failed | .local/evidence/completion-browser.log; browser-results.json |
| Frozen ML artifact, exact vector parity and HTTP validation/auth | 3 unittest methods passed; 4 baseline vectors compared exactly | .local/evidence/completion-ml.log; docs/ML-BASELINE.json |
| Translation coverage | 218 EN/BN keys, 140 literal UI calls, server error labels checked | .local/evidence/completion-translations.log |
| Production frontend build | Passed | .local/evidence/build.log |
| Code format | Passed | .local/evidence/format.log |
| Live Open-Meteo archive | 134/134 days, available | .local/evidence/live-weather-smoke.json |
| Live Open-Meteo forecast | 7/7 days, available | same live source evidence |
| Genuine isolated backup/restore + reconnect | Passed, including refusal to overwrite/non-empty restore | backend operations.test.js and backend log |
| Linux CPython 3.14 wheel availability | 27 pinned wheels downloaded successfully | .local/evidence/linux-packaging.log/json |
| Package budget estimate | 250.68 MiB unpacked wheel contents + accepted model | Estimate only; actual Vercel build overhead must be measured in account |
| Fresh local import + first inference | 8.044 seconds, exact baseline output | .local/evidence/local-cold-start.json; not a Vercel cold start |
| Git whitespace check / model diff | git diff --check passed; model binary diff empty | model hashes separately recorded |

## Scope of meaningful coverage

HTTP tests use an actual isolated MongoDB, real registration/password hashing/cookies/CSRF/ownership, impossible/Bengali/leap/cross-year dates, unsupported exact references, concurrent duplicate retries, revision lineage, original immutability, revision-specific complete/reopen, report authorization/CSV formula escaping, consent, pagination beyond 100 records, weather missing/partial/stale behavior, ML unavailable values, alert refresh/dedup/read/dismiss ownership, concurrent login throttling, production Secure cookie flags, session expiry/logout, failed result insertion, missing database configuration, serverless handler import and static route exclusions.

The browser journeys exercise desktop EN/BN account → actual frozen inference → saved analysis → activity reload/reopen → editable linked revision/reload → localized CSV/print/PDF; mobile Bengali numeric dates, focused errors, retained form across language/reload, ten existing reference cards and overflow; farmer profile/plot → unavailable full-season weather → forecast alert read/dismiss/refresh/reload; and shared-device sign-out/new account/sign-in with private cache/draft isolation.

Deterministic backend/browser weather responses are explicitly test fixtures in isolated test databases, not real farm observations. Browser model calls use the actual unchanged FastAPI artifacts. A separate unmocked live-provider smoke check succeeded as shown above. None of these software checks establishes agricultural accuracy, field reliability or a new trained-model evaluation score.

## Screenshots and print evidence

- .local/evidence/calendar-bn-desktop.png
- .local/evidence/result-bn-desktop.png
- .local/evidence/result-en-desktop.png
- .local/evidence/mobile-en-retained-input.png
- .local/evidence/mobile-bn-crops.png
- .local/evidence/forecast-alerts-en.png
- .local/evidence/print-en.png and print-bn.png
- .local/evidence/report-en.pdf and report-bn.pdf

Bengali fonts are bundled from Google Fonts Hind Siliguri under the included OFL license, avoiding runtime font-service dependence. PDF pages were extracted and rendered for glyph/spacing checks; no empty trailing page was observed. The export contains reference/score/weather/ML/revision evidence and hides navigation/actions. These screenshot/PDF examples use fixture farmer accounts.

## Failures found and fixed

During testing: owner missing from a pagination fixture; Windows Python command quoting; hash-only result navigation; mobile overflow; selecting a populated plot control with an unsuitable label locator. Additional review corrected cross-year suggestion ordering, atomic login throttling, same-device cache/draft isolation and static font routing. Final logs above reflect reruns after corrections.

## Account-dependent checks

No cloud deployment, cloud cold-start measurement, live HTTPS cookie test on a real Vercel domain, or real farmer-database migration was performed without the user's accounts/credentials. The Docker variant and GitHub-hosted CI have been updated but were not run on Docker/GitHub here. The local production build, API handler and tests were executed. Follow VERCEL-DEPLOYMENT.md for exact account setup and real cloud acceptance checks. Free-provider quotas and source coverage remain those of the actual services and accepted project data.

Name-only form follow-up: removed the separate username field from registration and login. Full Bengali names with spaces, name-based registration/sign-in, profile rename and legacy credentials were tested. Latest run: 17 backend tests and 4 browser journeys passed; the running signup page was visually checked. Screenshot: .local/evidence/name-only-register-bn.png. Latest follow-up summary: .local/evidence/name-only-fix.json.

## Resubmitted-prompt completion follow-up

The later single-farmer-name requirement is retained. New fixes close non-working action retries, unlimited browser/body/download waits, missing printable suggested dates, missing recent revision links, duplicate/shifted weather day coverage and serial weather refresh timeout accumulation. The fifth browser journey waits for a real analysis save, deliberately loses its response, retries using the same idempotency key, and confirms only one history record exists. Both English/Bengali print reports now contain editable suggested dates.

Current execution: 19 backend tests and 5 browser journeys passed; 3 frozen-model unittest methods passed again; clean root/backend/frontend npm ci installs passed with zero audit vulnerabilities. Format, translation checks and the production build passed. Frontend installation initially hit a Windows-locked native Rollup file held by the recorded preview process; stopping that owned process allowed a clean reinstall and preview restart. This was an environment lock, not a silently skipped check.

Detailed current logs: completion-backend.log, completion-browser.log, completion-translations.log, completion-install.log (initial attempt), completion-frontend-install.log (successful retry), completion-ml.log, completion-format.log and completion-build.log, all under .local/evidence. No new agricultural-model training/evaluation or paid provisioning occurred. See REQUIREMENTS-COMPLETION-AUDIT.md for the current scope matrix.

Calendar picker follow-up: all six stage date fields in new/revised calendars and the history date filter now support native calendar selection alongside editable Bengali/English digits. Final browser suite: 6 passed. Production build and translation coverage passed (219 keys, 143 literal calls). Evidence: .local/evidence/calendar-picker-browser.log, calendar-picker-build.log and calendar-picker-bn.png.

