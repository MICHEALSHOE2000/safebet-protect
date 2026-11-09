# Repair audit

Baseline: 5c588dc. Branch: feat/protection-redesign.

Confirmed defects: public pages mounted the internal sidebar and depended on workspace bootstrap; email verification redirected every role to the public root; GET /api/protect discarded every exception; demo mode relied on one environment flag; a successful demo lookup claimed eligibility; anonymous reporting omitted incident time; regulator audit records were not exposed by jurisdiction. Private assessments and encrypted records, server role assignments, exclusion optimistic concurrency, private evidence and shared PostgreSQL are retained.

The deployed workspace error's root cause is not established by source inspection. No Vercel runtime logs, database credentials, Supabase configuration or verified staff sessions were supplied. Failure points include lookup pepper, encryption key or existing ciphertext/key mismatch, missing schema, pooler credentials/TLS, authentication upstream, and individual record decryption. Do not describe any of these as the observed production cause. New request IDs and operation labels distinguish failures without logging raw exceptions.

Implementation: separate public pages, accessible design system, explicit role navigation and routing, structured errors and retry, PostgreSQL identity environment boundary, protected configuration checklist, accurate verification decisions, scoped audit and player history. Deployment must apply 002 after 001 and configure separate Supabase projects before testing email delivery and real sessions.
