# Phase 40 — Duplicate Payment Recovery Guard & Transaction Safety

Date: 2026-11-13

## Change summary
The buyer-initiated Cashfree recovery route now uses a shared pure predicate to detect a different provider payment identity on an order already marked `paid`.

New helper:
- `src/lib/server/paidVideoDuplicatePaymentGuard.mjs`
- `isPaidOrderDuplicatePayment(status, recordedPaymentId, incomingPaymentId)`

Recovery transaction behavior:
1. Re-reads the order, video, purchase, payment event, and deterministic ledger rows inside the Firestore transaction.
2. Rejects cross-order reuse of an existing `cf_payment_id`.
3. If the order is already `paid` and the provider-verified payment ID differs from the stored `cfPaymentId` (including a missing stored ID), writes only:
   - `duplicatePaymentReviewRequired: true`
   - `duplicatePaymentId: <incoming provider payment ID>`
   - `updatedAt`
4. Returns a typed transaction outcome. The route throws/translates to HTTP 409 only after the transaction commits, so the review marker is not rolled back.
5. The duplicate path does not write a purchase entitlement, payment event, or settlement ledger row and does not overwrite the original order `cfPaymentId`.
6. Same-ID paid-order replay remains eligible for the existing idempotent path.

## Tests added/updated
- `src/lib/server/__tests__/paidVideoDuplicatePaymentGuard.test.mjs`: five pure decision tests (same ID, different ID, missing recorded ID, pending state, empty incoming ID).
- Updated `src/app/api/shorts/paid-video/verify/__tests__/payment-state-duplicate-review-audit.test.mjs` to require the new transaction guard and assert marker ordering before purchase/event/ledger writes.
- Existing webhook duplicate guard remains unchanged.

## Important limitations
- This is not a full transaction integration test. The Firestore Emulator was not run in this phase.
- No Cashfree sandbox calls or live provider payment/refund operations were performed.
- A protected admin review queue and explicit operator resolution workflow remain unimplemented. The marker is persisted for later review; no automatic refund is attempted.
- Concurrent webhook/recovery behavior still requires emulator tests against the actual route transaction logic.
- No generic payment-state transition service was introduced; lifecycle audit findings from Phase 39 remain.

## Safety
No Firestore schema/rules/index changes, provider configuration changes, live payouts, paid-video feature gate changes, commits, pushes, or deployments were performed.
