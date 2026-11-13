# Phase 37 — Cashfree Replay & Rate-Limit Architecture Audit

Date: 2026-11-13

## Executive result

Source-level audit completed. No arbitrary timestamp-age cutoff and no in-memory
rate limiter were introduced. The Cashfree signature verifier was extracted into
a pure module and gained focused executable tests. Existing route behavior and
payment data contracts remain intact.

## Cashfree provider contract checked

Official references reviewed:
- Webhook signature verification:
  https://www.cashfree.com/docs/payments/online/webhooks/signature-verification
- Webhook idempotency:
  https://www.cashfree.com/docs/payments/online/webhooks/webhook-indempotency

The signature guide documents:
- `x-webhook-timestamp` and `x-webhook-signature` headers.
- HMAC-SHA256 over the timestamp concatenated with the exact raw request payload.
- Verification against the unmodified raw body before JSON parsing.

The idempotency guide documents:
- Multiple payment attempts may share one order ID.
- Each attempt has its own `cf_payment_id`.
- `SUCCESS` is the final payment confirmation; FAILED/PENDING/NOT_ATTEMPTED
  should not fulfil the order.
- Deduplicate using `cf_payment_id` and make order-level fulfilment idempotent.

The reviewed official pages do not specify a maximum webhook timestamp age or
an allowed delivery/retry time window. Therefore, this phase does not invent a
5-minute/15-minute freshness cutoff. A stale but authentic webhook must not be
rejected until Cashfree's delivery retry guarantees and a merchant-approved
late-delivery policy are confirmed.

## Existing implementation findings

### Signature and replay controls

- `verifyCashfreeWebhookSignature` computes HMAC-SHA256 over
  `timestamp + rawBody`, base64 encodes it, checks equal lengths, and uses
  `timingSafeEqual`.
- Extracted the verifier to `src/lib/payments/cashfreeWebhookSignature.ts`;
  `src/lib/payments/cashfree.ts` re-exports the same function so route imports
  remain compatible.
- Added bounded timestamp header length (64 characters), signature header
  length (512 characters), and non-empty secret checks. No timestamp age rule.
- Cashfree webhook event documents are keyed by `cf_payment_id`. Re-delivery
  of an already-recorded payment ID for the same order is idempotent.
- A different successful payment ID for an already-paid order is flagged for
  manual duplicate-payment review rather than granting a second purchase.
- Non-SUCCESS payment statuses are ignored.

### Rate-limit implementation inventory

- Shorts comments: verified Firebase user UID is the key for
  `commentRateLimits`; minute/hour/day counters and duplicate-text checks are
  updated inside a Firestore transaction; duplicate request IDs are
  user-scoped; the route returns 429 when the counters reach their limits.
- Creator Drive upload session: `creatorUploadRateLimits/{creatorId}` is
  transactionally checked for a 30-second cooldown; a separate cap limits
  active upload sessions.
- No reusable distributed rate-limit abstraction was found.
- No explicit per-actor rate limiter was found in the reviewed admin financial
  reconciliation endpoints.
- No per-IP limiter was added to the Cashfree webhook. Payment webhooks are
  retried server-to-server; a simplistic limiter can reject legitimate retry
  bursts and an in-memory counter is not consistent across serverless instances.

## Recommended production architecture (not implemented)

1. Keep `cf_payment_id` idempotency and transactionally enforced order-state
   checks as the financial correctness control.
2. Add an edge/WAF or shared distributed rate-limit service before public
   launch. It must work across instances/regions and have explicit behavior
   for provider retries, bursts, and service outages.
3. Apply separate policies to:
   - Cashfree webhook ingress (generous burst allowance, monitoring, body-size
     ceiling; do not rely on IP allowlists unless Cashfree publishes and
     maintains the authoritative ranges).
   - Admin financial endpoints (per verified admin UID plus a global abuse
     ceiling; preserve legitimate manual reconciliation operations).
   - Authenticated user write endpoints (per UID and optionally per-IP).
4. Define keys, windows, burst limits, fail-open/fail-closed behavior, retention,
   alert thresholds, and incident response before selecting/configuring a store.
5. Confirm with Cashfree support/documentation the webhook timestamp format,
   delivery retry horizon, and whether any freshness/replay-window policy is
   supported. Then document the late-arrival/manual reconciliation path before
   implementing a timestamp cutoff.

## Tests added

- `src/lib/payments/__tests__/cashfree-webhook-signature.test.mjs` validates
  exact timestamp+raw-body signing, payload/timestamp tampering, missing
  headers, and oversized header rejection.
- `src/app/api/shorts/comments/__tests__/rate-limit-contract.test.mjs` protects
  the existing UID-scoped transactional comment limiter and request
  idempotency contract.

## Not changed

No production secrets/configuration, Firestore documents/rules/indexes,
Cashfree merchant settings, payment status transitions, payouts, or paid-video
gates were changed. No live provider request, database migration, deploy,
commit, or push was performed.

This phase is a source-level architecture audit, not production readiness
approval. Emulator and Cashfree sandbox integration remain required.
