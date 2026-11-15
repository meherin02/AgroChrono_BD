# Completion audit of resubmitted application prompt

The supplied prompt repeats the original farmer-application scope. Existing implementation was preserved, including the subsequent user-requested single farmer-name field; an optional username example in the repeated prompt does not reintroduce a second name input.

Existing completed areas: accepted artifact hashes/inference baselines; private farmer accounts/profile/plots; session/CSRF/throttling; owner-scoped paginated history; exact reference matching; honest missing-weather/ML states; immutable revisions; revision-specific activities; sourced guidance; persistent in-app forecast alerts; bilingual CSV/print; Vercel entrypoints/config/env/migration/backup docs; no obsolete deployment paths or model training in CI.

Follow-up corrections: bounded browser connection/body/download timeouts; Retry actually replays the failed action with its existing idempotency key; suggested dates included in visible/printed reports; a real recent-revisions list; provider dates checked for duplicates/shifted coverage; forecast calls limited to three concurrent requests to avoid serial timeout accumulation.

Evidence is linked from VERIFICATION.md and the follow-up verification summary. A lost-response browser test waits for a real successful save, aborts the response, retries and verifies exactly one saved record. Weather transport tests distinguish malformed date coverage from missing rainfall. No inference feature ordering, trained artifact or prediction threshold was changed.

Account-dependent Vercel publishing/HTTPS and cloud bundle/cold-start tests remain user setup, as explicitly allowed by the prompt. No paid resource or deployment has been provisioned. Existing source-data coverage is preserved without a new agricultural accuracy or nationwide-data claim.

## Prompt section status

| Section | Current implementation/evidence |
|---|---|
| 1 Inspect/preserve | Initial inventory plus current status; code/data retained in this repository only |
| 2 Accepted ML freeze | Two unchanged hashes, four exact baseline vectors, three fresh ML unittest methods |
| 3 Farmer scope | Farmer auth/private workflows only; no officer/admin product |
| 4 Seven diagrams | FEATURE-TRACEABILITY.md plus this scope matrix |
| 5 Accounts/privacy | Name-only farmer account per later request; sessions, consent, profile/plots, CSRF/throttles; HTTP/browser tests |
| 6 Persistence/history | Session-derived owners on all private routes; pagination/search beyond 100; isolation tests |
| 7 Dashboard | Real counts, recent assessments/revisions, incomplete activities, alert access and crop browser |
| 8 Activities/advisory | Revision-owned completion/reopen and sourced stage guidance; persisted reload tests |
| 9 Weather alerts | Actual products/cache, coverage/time/source/read/dismiss/dedup/refresh; provider-failure and malformed-coverage tests |
| 10 Analysis states | Strict data/date/stage checks, bounded waits, inline errors, working retry/idempotency; lost-response browser test |
| 11 References | Exact combination matching, immutable reference/weather/model snapshots, real-record browser |
| 12 Revisions | Owner-checked parent/root, immutable originals, actual signed changes, editable dates, reloaded comparison |
| 13 Reports | Authorized escaped CSV and bilingual print/PDF with submitted/reference/suggested dates and evidence |
| 14 Languages | 218 matching keys, 140 literal UI calls, canonical options, preserved input/state, desktop/mobile journeys |
| 15 Vercel | Root frontend+Node, separate accepted FastAPI, durable DB, no legacy host configs or production ephemeral fallback |
| 16 Setup/docs | README, environment table, Vercel roots/order/rollback and exact account-dependent steps |
| 17 CI/tests | Locked installs; no retraining; real HTTP/Mongo/browser/parity tests; clean installs verified locally |
| 18 Acceptance | Current logs: 19 backend tests, 5 browser journeys, 3 ML unittest methods; real isolated reconnect/backup/restore |
| 19 Handover | Updated documents, source hashes, actual evidence and screenshots; no fabricated cloud/accuracy claims |

Cloud publication, GitHub-hosted CI execution and live domain acceptance require the user's account setup. The prompt expressly requests preparation without publishing; that boundary is preserved.
