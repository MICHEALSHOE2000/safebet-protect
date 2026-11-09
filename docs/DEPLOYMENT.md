# Deployment

Supported deployment is the existing private Sites-hosted Cloudflare Worker with D1 and R2. The host supplies trusted account identity headers; do not expose an alternative Worker origin that permits spoofing those headers.

Runtime secrets:
- DATA_ENCRYPTION_KEY: 32 random bytes represented as 64 hexadecimal characters.
- IDENTITY_LOOKUP_PEPPER: independent random secret.
- ADMIN_EMAIL: the configured owner email.
- IDENTITY_PROVIDER_URL and IDENTITY_PROVIDER_TOKEN: pending; enrolment stays unavailable until a reviewed adapter is connected.

The first three values were provisioned securely in hosting settings. They are not committed or displayed. Reuse them; do not rotate them without a data migration plan.

The additive 0001 migration creates new application tables. The immutable 0000 migration and original fictional dataset are retained. No real workflow reads or seeds fictional records.

Local integration tests provide test-only identity headers, SQLite and secrets. Do not disable production authentication to make a preview easier. Local browser QA without hosted identity cannot validate signed-in account workflows.

## Vercel

This version is not directly deployable to Vercel: it imports Cloudflare runtime bindings. Port the server database/storage adapter and managed account authentication first, preserving encryption, authorization and atomic updates. Never replace trusted server identity with browser-supplied claims. No Vercel deployment is claimed.
