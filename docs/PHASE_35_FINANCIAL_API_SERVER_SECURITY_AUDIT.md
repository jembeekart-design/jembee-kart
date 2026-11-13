# Phase 35 — Financial API server security audit

Date: 2026-11-13  
Scope: static source audit plus executable source-contract tests. No provider calls, credentials, Firebase emulator or production endpoint used.

## Routes reviewed

- `src/app/api/payments/cashfree/webhook/route.ts`
- `src/app/api/shorts/paid-video/verify/route.ts`
- `src/app/api/admin/shorts/paid-video-refunds/reconcile/route.ts`
- `src/app/api/admin/shorts/teacher-referral/reconcile/route.ts`
- `src/app/api/shorts/paid-video/create-order/route.ts`
- `src/app/api/shorts/paid-video/playback-session/route.ts`

## Positive controls observed

1. Cashfree webhook checks body size, verifies the HMAC signature using the raw request body and timestamp before JSON parsing or order lookup, then validates successful payment status, provider order ID, INR currency and exact paise amount.
2. Webhook processing checks payment-event reuse, order state, video eligibility, purchase conflict and deterministic ledger IDs inside a Firestore transaction. A second successful payment for an already-paid order with a different payment ID is flagged for manual review.
3. User-facing verify, create-order and playback routes verify Firebase ID tokens with revocation checking (`verifyIdToken(..., true)`).
4. Verify/create/playback parse bounded JSON or validate narrow identifiers; user ownership is checked before granting access.
5. Refund and teacher-referral reconciliation verify revocation-checked ID tokens and require `admin` or `super_admin` role server-side.
6. Refund reconciliation checks provider refund status, cumulative amount, original payment ceiling, monotonic refund total and appends negative reversal rows.
7. Teacher referral reconciliation requires a paid order and verified attribution; commission is computed from the platform's reconciled net-profit basis.
8. Playback requires a matching paid, non-revoked purchase and issues a short-lived HttpOnly, Secure, SameSite=Lax cookie.
9. Reviewed routes set `Cache-Control: no-store` on success/error responses or their shared reply helper.

## Test coverage added

`src/app/api/admin/shorts/__tests__/financial-route-security-audit.test.mjs` adds eight source-contract checks covering the controls above. Focused result: 8 passed, 0 failed.

## Follow-up risks / work still required

- This is a static source audit, not a live penetration test or Firebase/Cashfree integration test. It cannot prove provider signature configuration, webhook delivery behavior, Firebase IAM, secrets rotation, production indexes or runtime deployment configuration.
- The webhook reads the request with `req.text()` before checking the actual UTF-8 byte count. It checks declared Content-Length first and then checks the actual size, but a chunked request without a trustworthy Content-Length may be fully buffered before the 128 KiB rejection. Consider a streaming bounded-body reader at the platform boundary.
- `verifyCashfreeWebhookSignature` uses constant-time signature comparison, but this audit did not establish a timestamp-age/replay window policy. Payment-event idempotency and order/payment matching are present; confirm the provider's recommended timestamp policy and operational retry requirements before adding a freshness cutoff.
- Admin reconciliation routes are bearer-token protected but have no explicit per-actor rate limit in the inspected route files. Add centralized rate limiting/monitoring before production financial operations.
- Refund reconciliation obtains provider refund history before its transaction, then rechecks the local order/refund watermark in the transaction. Emulator/provider integration should exercise concurrent refund reconciliations and stale provider snapshots.
- Teacher referral reconciliation updates the current `teacher_referral_commission` and `admin_net_profit` summary documents while also appending commission adjustment rows. Preserve the distinction between mutable projections and immutable audit entries in future repository integration.
- Error logging is intentionally terse in several paths; production monitoring should correlate a safe request/event ID without logging credentials, raw payloads or personal/payment details.

## Safety outcome

No code changes were made to payment, webhook, refund, teacher-referral, order creation or playback route implementations. Only tests and documentation were added. No Firebase data, Cashfree configuration, rules, indexes, payouts or payment gates were changed.

**Status:** source-level controls reviewed; emulator/provider end-to-end verification remains outstanding. This does not authorize live payouts or paid-video launch.
