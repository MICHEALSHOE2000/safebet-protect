# SafeBet Protect Nigeria — account-based application

This release removes open demo accounts and adds signed-in account permissions, encrypted records and phone-number/NIN customer enrolment and shop lookup. A customer without a phone can enrol through an authorised attendant using NIN and explicit consent.

## Current status

The app is deployed privately. The owner is the configured administrator. Live identity verification is **not connected**, so customer enrolment remains closed. No real NIN or phone OTP has been verified during development. This is an account-based application in operational setup, not a claim of public launch readiness or regulatory approval.

The role-based workspaces, outlets, reports, case access restrictions, support resources and storage are real server-backed functions. No government agency or gambling operator integration is connected. Reports remain platform records unless separately submitted through an official channel.

## Changes

- Sites-managed sign-in establishes account identity. Users cannot select their own role.
- Staff and state reviewer permissions are assigned server-side by the configured administrator. Administrator access is not awarded to the first visitor.
- Former demo login, reset, fixed OTP and verification-reference endpoints are disabled. Legacy cookies give no access.
- New application tables are separate from retained fictional data; production never seeds or queries demo records.
- Phone and NIN are alternative identity methods. NIN enrolment does not require a personal phone.
- Full NINs and raw phone numbers are not retained. Secret-key HMAC fingerprints allow exact matching, and encrypted profiles retain only masked endings. Date of birth is transient verification input.
- Enrolment requires a provider response confirming both verification and identity match. No manual verified-status override exists.
- AES-GCM encrypts profiles, assessments, complaints, support messages and evidence. Structural metadata and exclusion timestamps remain database fields.
- Shop lookup returns a minimal result, with fresh checks required for refusal or assisted exclusion. A number alone is not identity proof; attendants must follow an approved procedure and obtain consent.
- Unmatched identities, failed checks and expired results never imply clearance.
- Atomic version checks protect exclusions against shortening through competing updates.
- Phone-free customers can activate or extend protection through an authorised attendant and receive a printed confirmation.

## Account access versus customer identity

Staff and self-service customers sign in through ChatGPT. Assisted customers do not need a device or online account: the attendant performs enrolment and records voluntary protection. NIN verification is separate from staff sign-in.

The Site remains owner-private. Assigning an application role does not grant Site access or send an email invitation. Broader visitor access needs a separate explicit configuration after operational readiness.

## Architecture

Next.js App Router-compatible TypeScript/React, Vinext/Cloudflare Workers, D1 and private R2. Existing hosted authentication is preserved.

- `components/protect.tsx`: shared interface and existing player/report/resource pages.
- `components/production.tsx`: account access, phone/NIN enrolment, staff checks and administrator pages.
- `lib/live.ts`: encrypted persistence, hosted account identity, provider interface, HMAC lookup and atomic exclusions.
- `lib/identity-rules.mjs`: input normalization and strict provider-result validation.
- `app/api/protect/route.ts`: permissions and application operations.
- `app/api/evidence/route.ts`: authorised, encrypted evidence storage/downloads.
- `db/schema.ts`, `drizzle/`: additive migrations; the original migration is unchanged.

## Tests

Node 24 is used for the integration suite's built-in SQLite and TypeScript stripping.

```sh
npm ci
npx tsc --noEmit
node --test tests/rules.test.mjs tests/identity.test.mjs
node --experimental-strip-types --experimental-loader ./tests/loader.mjs --test tests/api.test.mjs
npm run build
```

Eleven tests cover normalization, exact expiry, extension rules, roles, state scoping, disabled demo access, missing/rejected identity providers, no raw NIN retention, unknown records, assisted protection, concurrency, CSRF-origin checks and encryption of evidence-sized payloads. Provider and authenticated-header mocks exist only under `tests/`, never as runtime providers. No real identity provider has been exercised.

## Required before customer rollout

1. Choose an authorised identity provider and implement/review its adapter. See `docs/IDENTITY-INTEGRATION.md`.
2. Complete live verification acceptance tests, including OTP expiry/replay, NIN name/date match, stable person references, duplicates and recycled-number handling.
3. Establish participating-outlet identity and consent procedures, staff training, lawful operating arrangements, privacy/retention processes and support ownership.
4. Complete security/privacy review, backup/recovery, rights-request/deletion tooling, operational monitoring and audit anchoring. Per-event keyed digests are not an externally anchored immutable audit ledger.
5. Explicitly approve the audience before opening general customer access.

Remaining work includes full Pidgin coverage, reviewed retention/deletion tooling, actual authority submission, SMS notifications and a direct Vercel port. The app does not automatically prove an attendant's physical identity check. Linking a second identifier or recovering an assisted record into a self-service account requires a separately reviewed workflow.

## Key handling

Encryption and lookup secrets are server-only. Do not rotate them casually: changing the encryption key makes existing content unreadable; changing the lookup pepper breaks matching unless a planned migration/re-verification process is used. Full NINs cannot be recovered because they are intentionally not stored.
