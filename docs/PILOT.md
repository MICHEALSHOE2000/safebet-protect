# Connected fictional pilot — implementation and acceptance

## Audit of main at ea8376a

The repository already used Next.js 16 App Router on Vercel, Supabase email OTP authentication, a private PostgreSQL schema, AES-GCM encrypted records and private evidence storage. The original Vercel/Vinext mismatch was already fixed. Existing public guidance, role-specific navigation, exclusion extension, complaint review and PostgreSQL adapter tests were preserved.

Gaps found in source: enrolment needed an unconfigured real identity adapter; all complaints and assessment submission required sign-in; lookup checked exclusion but not age; there was no fictional seed or indefinite period; jurisdiction checks only used state; case assignment was missing. This branch implements a first connected pilot phase. It is not a production certification or a claim that every requirement in the original brief is finished.

## Configure a separate environment

1. Create a **separate Supabase demo project** and follow `DEPLOYMENT.md`, including migration `supabase/migrations/001_safebet.sql`, private storage, secrets and email-code template/SMTP.
2. Set `SAFEBET_DEMO_MODE=true` on the demo Vercel deployment. Leave the real identity-provider variables unset. Do not enable this switch on a database containing real customer identities. The switch disables personal-identity enrolment endpoints and enables fictional IDs.
3. Locally populate `.env.local` with the same demo project credentials and `PILOT_ACCOUNT_EMAILS`: a JSON array of 15 distinct email addresses you control. Positions 1–10 are Players A–J, 11–12 Attendants A–B, 13 the shop manager, and 14–15 compliance officers. Email aliases are suitable if you can receive each address's one-time codes. No passwords or privileged credentials appear in the interface or repository. Do not use the `ADMIN_EMAIL` address for these accounts.
4. Run `node --env-file=.env.local scripts/seed-pilot.mjs` with Node 22. The script creates Supabase auth accounts without sending mail, then transactionally adds the fictional organisation, LGA, shops, assignments and profiles. Authenticate using email OTP. It does not bypass Supabase session checks. Auth provisioning and database seeding cannot share a transaction; after a failure, rerun with the **same** email list. Existing records are preserved. Do not change the list to reassign seeded identities.
5. Deploy the branch as a Vercel Preview using `npm ci` / `npm run build`, Node 22.x, default Next.js output. Public Supabase environment changes require rebuilding. The `/demo` page provides the scenario guide without publishing staff emails or credentials.

## Acceptance scenarios

- Sign in as Player A (DEMO-A), activate 180 days, sign out. Sign in separately as each attendant and check DEMO-A with identity/consent confirmation. Both must return EXCLUDED and save refusal records. An officer must see both shops' activity.
- Check DEMO-B. Its seeded fictional birthday is 16 years before initial seed execution. Result must be UNDERAGE, with a recordable refusal. IDs alone never prove identity. Unknown IDs, missing confirmation and service failures must not produce eligibility.
- Submit a fictional anonymous report at `/report-shop`. Save reference and private key. An officer in the same LGA can assign and update it; another LGA cannot read or update it. Tracking returns status and timestamp only, never narrative or investigation notes.
- Refresh and use a second device. The same Supabase account must see the persisted PostgreSQL state. Confirm logout, OTP expiry, email delivery and mobile layout in the actual staging environment.
- Test indefinite protection: stored as the maximum supported date sentinel, displayed as Indefinite, and cannot be shortened or extended through the API.

## Architecture and privacy

The preserved `safebet.live_records` encrypted document table stores members, role assignments, jurisdictions, fictional regulatory organisation, player profiles, shops, checks, complaints and their investigation timeline, incidents and resources. `identity_index`, `live_exclusions`, `live_audit` and `rate_limits` remain separate tables. This deliberately preserves the existing backend rather than replacing it with fourteen new tables. The private schema denies direct anonymous/authenticated database access; the server connection authorises each operation. Pilot officers are restricted by both state and stored jurisdiction ID, including evidence. Shop responses omit customer IDs and all assessments/complaints. Public tracking uses a separately hashed, high-entropy secret sent in POST bodies, never URLs.

One-minute shop results expire in the interface; new checks read the database. An eligible result is a point-in-time fictional age/exclusion decision, not authorisation for real gambling. A real outlet integration would need a final check at the moment of service. Audit/check storage failure cannot result in an eligible response. A database outage cannot itself be durably logged to that unavailable database; an independent operational log sink remains future work.

## Verification and remaining work

Automated tests cover existing auth/crypto/adapter workflows and new two-shop exclusions, underage refusal, unknown/unconfirmed IDs, disabled shops, indefinite exclusions, anonymous tracking and cross-LGA read/write isolation. Fixtures authenticate server-side test identities; they do not prove live email delivery. The PostgreSQL adapter suite uses embedded PostgreSQL, while route tests use isolated SQLite fixtures.

Before claiming pilot readiness, complete live Supabase seed, email OTP/session and two-device scenarios on Vercel. No project credentials were supplied during this implementation, so live deployment and those tests were not performed.

Remaining requirements: full translated copy and locale catalogues (English only today); dedicated account/privacy settings; a broader visual redesign and device QA; separate normalised investigation/evidence tables if reporting scale requires them; recovery-resource administration refinement; shop activation/deactivation UI; regulator organisation onboarding; jurisdiction-aware migration of legacy state-only records; robust concurrent complaint updates; periodic retention cleanup; independent security review and accessibility audit. Anonymous evidence upload and lost tracking-key recovery are deliberately unavailable. Indefinite exclusions have no cancellation endpoint. No official reporting integration, government authorisation or real identity verification is asserted.

Build verification: `npm run build` and TypeScript completed successfully in the implementation environment (Node 24; Vercel is pinned to Node 22). Browser QA was blocked because the managed launcher supplied Vite-only `--host`/`--strictPort` flags to Next.js. No mobile or visual screenshot verification is claimed.
