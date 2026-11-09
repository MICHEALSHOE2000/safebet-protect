# Identity-provider connection

No provider is connected yet. The UI disables enrolment, and the backend rejects attempts without saving identifiers. A working connection requires a reviewed provider adapter, not just a vendor name or a number typed into a form.

Configure server-only `IDENTITY_PROVIDER_URL` (HTTPS) and `IDENTITY_PROVIDER_TOKEN`. The application POSTs JSON with bearer authorization, a 15-second timeout and no redirects. Do not log raw NINs, DOBs, OTPs or request bodies. This contract is an integration boundary, not a claim that a named vendor uses this exact API.

## Actions

- `phone.start`: identifier (normalized +234 number), consent. Returns opaque `challengeId`.
- `phone.verify`: identifier, challengeId, code, fullName, dateOfBirth, consent.
- `nin.verify`: identifier (11-digit NIN), fullName, dateOfBirth, consent. No phone field is required.

The adapter must enforce authorization, challenge binding, expiry, replay prevention, consent and the provider's identity matching. OTP possession alone must not be mislabelled as legal identity confirmation. Implement any additional vendor-required identity checks in the adapter and corresponding UI before activation.

## Successful verified result

```json
{"verified":true,"identityMatched":true,"method":"nin","subjectId":"<stable provider person reference>"}
```

Use `method:"phone"` for phone enrolment. The subject reference must be stable at person level across methods, not a verification transaction reference. The application HMACs it for duplicate detection and discards the raw value. Missing fields, false identity matches, wrong methods, failed HTTP requests and unknown references all fail closed.

## Lookup and privacy

Provider inputs are transmitted only with customer consent. Full NINs/raw phone identifiers are not persisted locally; masked endings, encrypted profile data, timestamps and keyed fingerprints are stored. No raw identifier is added to audit events.

An attendant's lookup confirms exclusion status for a registered identity. It does not prove that the person presenting the number is that identity. Customer presence, consent and an approved identity procedure are required before the lookup.

Before rollout, review the vendor agreement, data path, stable references, OTP/NIN success and failure handling, phone reassignment, duplicate prevention, operational monitoring and privacy/retention arrangements. No live vendor has been configured or tested by this release.
