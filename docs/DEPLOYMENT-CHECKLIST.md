# Deploying the redesigned pilot

Do not merge and call this live-tested without completing the external checks below.

## Database and environments

1. Keep demo and production in separate Supabase projects, with different encryption keys and lookup peppers. Keep Vercel Preview environment variables pointed at the demo project. Never copy a production database into a demo project.
2. Back up existing data, then run `001_safebet.sql` if missing, followed by `002_environment_boundary.sql`. Migration 002 preserves records, refuses mixed identity indexes, and pins the database to its existing identity kind. An empty database defaults to production.
3. For a NEW EMPTY demo project only, run `UPDATE safebet.deployment_guard SET mode='demo' WHERE singleton=true;`. The database refuses this switch once identities exist. Do not disable its triggers to work around a failure.
4. Set `SAFEBET_DEMO_MODE=true` and `SAFEBET_DEMO_PROJECT_REF` to that demo project's reference. The application verifies the Supabase auth URL and database marker. Seed using the existing `scripts/seed-pilot.mjs` with 15 distinct controlled email addresses; never publish their credentials.
5. Production uses `SAFEBET_DEMO_MODE=false`, a production database marker and its own Supabase project. `IDENTITY_PROVIDER_APPROVED` must remain false until the provider has been configured and tested. Provider responses must include a trustworthy `adultVerified: true` in addition to verified identity/method/subject. Old records without adult verification receive no clearance; re-verification needs the provider workflow.

## Workspace failure diagnosis

Use the request reference displayed by the UI to locate `workspace_failure` in Vercel server logs. Logs contain operation, safe category and allow-listed error code only. They intentionally omit SQL, stack traces, tokens, identifiers and record values.

- `authenticate_and_initialize_profile`: validate confirmed Supabase session, exact administrator email, lookup pepper, encryption key format, and ability to read/create the ordinary player member. Do not change encryption/pepper values on an existing database; previous ciphertext and identities depend on them.
- `validate_environment_boundary`: run migration 002; check the database marker and demo auth project reference.
- `load_workspace_records`: inspect schema installation and any encryption-key mismatch in existing records. A corrupt encrypted record is an error, never silently discarded as successful empty data.
- `DATABASE_UNAVAILABLE`: verify DATABASE_URL uses the project's transaction-pooler connection string and correct username/password, URL-encode password characters, and check connectivity. The pg pool uses max 3 connections and no named prepared statements. TLS certificate validation remains enabled; provide the correct DATABASE_CA_CERT if required. Never use rejectUnauthorized=false as a workaround.
- `DATABASE_SCHEMA_MISSING`: install the reviewed migrations in the correct project.
- `PERMISSION_DENIED`: check database grants and server-side role assignment. Do not grant browser anon/authenticated access to safebet tables.
- `CONFIGURATION_INCOMPLETE`: check auth settings, 64-hex encryption key, stable lookup pepper, mode boundary and provider approval.

The protected `/admin/health` page returns readiness booleans only. If the database cannot bootstrap the admin, use this runbook and server logs; the diagnostics endpoint deliberately does not bypass authentication.

## Six-digit email codes

Configure the Supabase email OTP length to 6 in the project's authentication settings. Paste `supabase/templates/email-code.html` into both Confirm signup and Magic Link email templates. The `.Token` expression is required; a link-only template will not satisfy this interface. Validate SMTP sender/domain, delivery, expiry, resend limits and production Site URL. No hosted email settings were changed by this PR.

Test a new player and every assigned staff role. After verification `/workspace` gets the role and home route from the server. Refresh and reopen the browser to verify session persistence. Use distinct browser profiles for staff and players.

## Required hosted acceptance walkthrough

- Public homepage, how-it-works, assessment and resources load without registry/auth configuration.
- Player A activates 180 days. Shop A and Shop B each verify DEMO-A and persist refusals. Assigned regulator sees both checks and audit records; another LGA cannot.
- Unknown ID, missing identity confirmation, underage DEMO-B, failed connection and expired results never show clearance.
- Anonymous complaint gives reference/key, tracks status only, and appears only in the assigned jurisdiction. Account-linked reports allow the existing private evidence flow. Test actual private bucket upload/download separately; no external authority is notified.
- Check responsive desktop/mobile layouts and keyboard focus. Confirm no real identities or actual operational metrics appear in the fictional pilot.

Local automated tests use PGlite (PostgreSQL) for the shared two-shop workflow and environment triggers, and mocked auth/provider responses. They do not establish hosted SMTP, Supabase, Vercel or identity-provider integration success.
