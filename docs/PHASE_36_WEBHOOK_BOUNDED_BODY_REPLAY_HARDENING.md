# Phase 36 — Cashfree Webhook Bounded-Body Hardening

Date: 2026-11-13

## Scope

Hardened only the Cashfree paid-video webhook request-body intake. Added
`src/lib/server/readBoundedRawBody.ts` to consume the request stream incrementally,
enforce a 128 KiB ceiling while reading, reject malformed Content-Length values,
reject oversized declared lengths before stream consumption, cancel an over-limit
stream, and decode valid UTF-8 without replacement-character normalization.

The webhook now uses this bounded reader before signature verification. The exact
decoded raw body string is passed to the existing Cashfree HMAC verifier; JSON
parsing and all order/database work remain after successful signature verification.
No raw request body is logged.

## Tests

Added `src/lib/server/__tests__/read-bounded-raw-body.test.mjs` covering normal
and exact-limit payloads, streamed overflow/cancellation, missing and invalid
Content-Length, oversized declarations, UTF-8 split across chunks, empty input,
malformed UTF-8, and invalid limit configuration. Updated the financial route
security contract test to require the bounded reader.

## Deliberately not changed

- No webhook timestamp freshness/replay cutoff was added. Confirm Cashfree's
  documented timestamp/retry policy before imposing a time window that could
  reject legitimate delayed retries. Existing payment-event idempotency remains.
- No in-memory rate limiter was added: it would not provide reliable shared
  enforcement across serverless/multi-instance deployments. A durable shared
  rate-limit store and operational policy remain production prerequisites.
- No Firestore schema/rules/data, Cashfree configuration, refund logic, payout
  behavior, or paid-video enablement was changed.
- No deployment, commit, or push was performed.

## Remaining verification

Run the Firebase Emulator transaction and Firestore Rules suites in an environment
with the emulator host/CLI configured, plus Cashfree provider sandbox integration.
This phase is a source-level hardening change, not a production readiness approval.
