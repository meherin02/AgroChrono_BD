# Farmer application

Only farmer registration, sign-in, profile and farmer-owned records are exposed. Only the farmer’s name and password are requested; phone is optional with consent, no NID/OTP/email service. Farmer names support Bengali, spaces and NFC normalization; the internal login key is generated from the name. Passwords use salted Node scrypt; opaque random session tokens are HMAC-hashed at rest. Seven-day sessions live in MongoDB with expiry checked at access, independent of TTL cleanup. HttpOnly cookies use SameSite=Lax and Secure in production. Exact APP_ORIGIN + custom header protect registration/login; authenticated mutations additionally require the session CSRF token. Persistent throttles limit attempts. Secrets never enter frontend storage.

The dashboard uses the current farmer's actual assessments, activities, revisions and alerts. Latest revisions replace their parents in planning; original assessments remain immutable. Different plots are never declared overlapping solely because dates overlap. Profile and plots are editable/addable in the farmer interface; plot IDs are checked against the session owner and calendar district. Ownerless legacy records are invisible.

## Analysis states and evidence

Input remains controlled in React and the local device draft scoped to the signed-in farmer after errors or language changes. States are loading, editing, submitting, saved/result, error/retry and revision preview. Busy guards prevent duplicate UI actions; persisted idempotency keys reject concurrent duplicate work and allow safe retries. References require exact crop/season/district matches. Inference numerical inputs/order and artifacts remain accepted/frozen. Invalid full stage sequences are rejected before weather/model/save. One analysis document atomically contains its submission snapshot, references, weather, ML result, parent/root, comparison and activities, so there are no successful partial submission/result writes.

There are 14 district options, 10 reference records, 4 distinct crops and 7 reference districts in the existing dataset. Not every location/crop combination has reference evidence. Unsupported exact combinations return a visible error instead of copying another district. This work preserves the agricultural evidence/model; it does not claim national coverage, new validation or measured agricultural accuracy.

The accepted conflict/scoring engine evaluates stage starts and growth duration. Both endpoints are displayed and sequence-validated. Explanations are localized from the same structured stage/status/deviation evidence. Reference titles/URLs, farmer-authored text and version identifiers retain their original spelling. Dates/units/numbers are localized, dropdown values stay canonical, language persists both locally and in the account, and Bengali numeric date input is normalized to ISO storage.

## Weather and notifications

Only actual Open-Meteo products are used. Historical reanalysis is requested for fully archived dates; near-future windows within the provider horizon use forecast. Other full-season future windows are unavailable rather than replaced with a prior year or constants. Missing daily values do not become zero. Cached products retain retrieval timestamps; stale products are visible but excluded from scoring/ML. Missing weather means missing ML weather features and an explicit unavailable inference result; agronomic-only weighted scoring keeps its existing 75% completeness calculation. A score is not a crop-success probability or measured model accuracy.

Manual weather refresh obtains the next seven days for current saved plans, compares daily temperature with each saved reference's min/max threshold and saves deduplicated notifications per assessment/date/stage. These are app threshold advisories, not official meteorological warnings. Read/dismiss states persist; dismissal remains respected on refresh. No paid SMS/background delivery is claimed. Notifications can remain in the history with their original timestamp, making older forecasts apparent.

## Reports

Authorized CSV uses UTF-8 BOM, quoted fields, escaped quotes/newlines and spreadsheet formula protection. Print/save-PDF uses the displayed language, hides controls, includes stage/reference/conflict/ML/weather/revision evidence, and optionally includes farmer/plot details. Browser print produces PDF without a hosted PDF service. No signature/approval workflows.

Account changes clear all private UI caches and select only that farmer's local draft. Explicit logout clears the displayed records; session expiry retains the previous farmer's scoped draft for their next sign-in. Shared-device privacy is covered by a browser journey.

Name-only account form: registration and sign-in show a single “Your name / আপনার নাম” field plus password. Existing username-based API credentials remain compatible, and existing unique display names also work for sign-in. New accounts keep their name-based login key aligned when the profile name changes.
