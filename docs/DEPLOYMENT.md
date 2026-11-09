# Deploy SafeBet Protect on Vercel

## Why the original deployment failed

Vercel selected its Next.js adapter, but `npm run build` ran Vinext. Vinext produced a Cloudflare build rather than the `.next/routes-manifest.json` required by Vercel. This version uses native Next.js and replaces Cloudflare database, object storage and host-header authentication.

## 1. Create a Supabase project

1. Create a project at https://supabase.com/dashboard. Keep the database password safe.
2. Open **SQL Editor**, paste and run `supabase/migrations/001_safebet.sql`. This creates the private `safebet` schema and private `safebet-evidence` storage bucket. Do not expose the schema in the Data API or add public storage policies.
3. Open **Connect → Transaction pooler** and copy the PostgreSQL connection URI (port **6543**) for `DATABASE_URL`. Replace the password placeholder with the URL-encoded database password. Use the server `postgres.PROJECT_REF` connection, not an anonymous API key. The application uses parameterised, unnamed queries compatible with transaction pooling.
4. Copy the project URL and publishable API key from project settings. Copy the service-role key separately for server-side storage only.
5. Under Authentication, enable email sign-in and allow new registrations if customers will self-register. New accounts always start as players.
6. Under **Authentication → Email Templates → Magic Link**, make the message display the code, for example: `<p>Your SafeBet Protect sign-in code is: <strong>{{ .Token }}</strong></p>`. The application asks the user to enter this code; it does not need a magic-link callback.
7. Set Authentication's Site URL to your final Vercel/custom-domain URL. Configure custom SMTP before opening registration to external users; Supabase's default email service is restricted and is not a production mail service. Test delivery using a real non-owner address.

Customers without email/phone use an authorised attendant's account and NIN enrolment. NIN is not used as an account password.

## 2. Add Vercel environment variables

Project → Settings → Environment Variables. Set these for Production, and use separate staging Supabase credentials for Preview if needed.

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public publishable key (legacy anon key also supported) |
| `DATABASE_URL` | Supabase transaction-pooler PostgreSQL URI |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only service-role key |
| `ADMIN_EMAIL` | Your email; sign in with a verified email code to become administrator |
| `DATA_ENCRYPTION_KEY` | Random 32-byte key encoded as 64 hexadecimal characters |
| `IDENTITY_LOOKUP_PEPPER` | A separate random secret |
| `DATABASE_CA_CERT` | Optional Supabase database root certificate if needed for TLS validation; pasted PEM or literal `\n` separators |
| `IDENTITY_PROVIDER_URL` | Optional until your HTTPS identity adapter is ready |
| `IDENTITY_PROVIDER_TOKEN` | Adapter's server-side bearer token |

Generate each of the two independent secrets by running this command twice:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Keep both values backed up securely. Changing them without a migration makes encrypted data or identity indexes inaccessible. Never put database passwords or service-role keys in a `NEXT_PUBLIC_` variable or commit `.env.local`.

TLS verification remains enabled. If a database certificate error occurs, obtain the database CA certificate from Supabase and set `DATABASE_CA_CERT`; do not disable certificate validation.

## 3. Deploy

Import `MICHEALSHOE2000/safebet-protect` into Vercel, or use the existing project after merging the Vercel migration.

| Setting | Value |
| --- | --- |
| Framework preset | **Next.js** |
| Root directory | Repository root (`./`) |
| Build command | `npm run build` |
| Install command | `npm ci` |
| Output directory | Leave override **off** (Next.js default `.next`) |
| Node.js version | **22.x** |

Remove an old custom `dist` output directory or `vinext` command. Deploy the updated commit. If needed, redeploy without the old build cache. Environment-variable changes require a new deployment; the public Supabase variables are included during the build.

For terminal deployment after configuring the project:

```sh
npx vercel login
npx vercel link
npx vercel --prod
```

GitHub integration is simpler for ongoing updates: a push/merge to the production branch triggers a deployment.

## 4. Verify before using real customer data

- Sign in with the configured administrator email; add an outlet and assign an attendant by their email.
- Check a normal account cannot access administrator or regulator operations.
- Connect the real identity adapter described in `IDENTITY-INTEGRATION.md`. Verify phone OTP and NIN paths with provider-approved test identities. Both methods must map a person to the same stable provider subject ID.
- Test assisted NIN enrolment without a customer account, refusal during active exclusion, expiry and extension.
- Verify evidence is private and can only be downloaded by the complainant or the assigned state regulator role.
- Confirm Supabase backups, SMTP delivery and retention procedures. Periodically delete expired entries from `safebet.rate_limits` using a scheduled database job; this does not delete player records.

This is an independent participating-outlet system. A role label does not prove government accreditation. Enrolment stays blocked without a working identity adapter; deployment alone does not verify NINs or notify authorities.

## Existing data

This migration does not copy records from Cloudflare D1/R2, and Supabase user IDs differ from the previous hosted account IDs. Do not discard old data or assume existing account ownership transfers automatically. A separate reviewed data/account mapping migration is required if the old deployment contains real records.
