# Migration, backup and restore

New application collections: farmers, sessions, plots, results, requests, notifications, weathercache and throttles. All private routes filter ownerId from the authenticated session. Existing ownerless analysisresults/submissions and backend/data/store.json are never exposed or assigned to a new farmer. New result documents contain their full submission snapshot atomically; no split submission/result write.

Before replacing the old app, stop old writers and copy its JSON data and MongoDB database to a restricted offline backup. Do not put private farmer data in Git. The old JSON file is not a production storage path. Retain it for explicit, consented future migration; no automatic owner guessing. `node scripts/archive-legacy.cjs` copies ownerless Mongo records into legacy_archive_* collections idempotently, leaving originals intact and inaccessible. This local tool has no browser endpoint.

## Backup

Set MONGODB_URI and MONGODB_DB_NAME in the local terminal or backend/.env. From repository root:

```
node scripts/maintenance.cjs backup .local/farmer-backup.json
node scripts/maintenance.cjs restore .local/farmer-backup.json agrochrono_restore_check
```

Backup uses BSON Extended JSON so dates and IDs survive. Output must not exist; it refuses accidental overwrites. Backups contain private farmer data and password hashes; use disk encryption/access controls. Sessions and login-throttle records are excluded. Restore requires a different, empty database and refuses the original active name. After restore, reconnect with that name to recreate indexes; users sign in again. Compare farmer/result/plot/notification counts and ownership, then perform a browser smoke test before using restored data.

The verification rehearsal uses isolated fixture data only. It never exports the real farmer database. A real operational backup schedule must be selected by the user without adding a paid service or claiming unattended jobs exist.
