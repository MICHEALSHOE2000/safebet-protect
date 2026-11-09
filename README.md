# SafeBet Protect Nigeria

A player-protection web app for participating physical outlets, with player, attendant, owner, regulator and administrator workspaces. Independent project; reports are saved internally and are not automatically delivered to a government agency.

## Deploy on Vercel

This branch uses **standard Next.js**, Supabase Auth, PostgreSQL and private Supabase Storage. See [the complete deployment steps](docs/DEPLOYMENT.md).

```sh
npm ci
npm run build
npm start
```

Copy `.env.example` to `.env.local` for local development. An unconfigured build can open the public interface, but accounts and data operations require the environment variables and database migration. The build creates `.next/routes-manifest.json` as Vercel expects.

## Identity and access

- Staff and self-service players sign in with an email one-time code. The server validates the Supabase session; account headers and role selections are never accepted as proof of identity.
- Customers can enrol using phone verification or NIN verification. Customers without a phone/email can use assisted enrolment by an assigned attendant.
- A real identity-provider adapter is still required: [integration contract](docs/IDENTITY-INTEGRATION.md). An entered phone number or NIN alone never establishes verified identity. Enrolment remains blocked until the adapter is configured.
- The confirmed account matching `ADMIN_EMAIL` administers staff permissions. New accounts have player access only.
- Full NINs and raw phone numbers are not stored. Identity aliases are keyed hashes; personal records and evidence are encrypted. Shops see limited protection status, not player assessments or complaints.
- Time-limited exclusions cannot be shortened by an update. Staff-assisted changes need explicit consent and a fresh check.

## Verification

```sh
npm test
npm run typecheck
npm run build
```

API tests use isolated local fixtures; PostgreSQL tests run the actual SQL adapter against embedded PostgreSQL. Real provider verification, email delivery and live Supabase connectivity require staging credentials and separate end-to-end acceptance checks. Do not treat a successful deployment as approval for nationwide enforcement.

The former Cloudflare database and accounts are not automatically migrated. This deployment starts with a new Supabase database; retain the old system until any required data migration is planned and verified. Legacy SQLite migrations in `drizzle/` are retained for fixture tests only.
