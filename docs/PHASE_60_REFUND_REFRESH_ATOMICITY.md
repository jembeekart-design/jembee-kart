# Phase 60 — Refund refresh atomicity and stale-state protection

## Scope
Hardened the Cashfree refund status refresh path in `src/app/api/admin/refund-requests/process/route.ts`.

## Changes
- Re-reads the refund request and linked order inside a Firestore transaction after the provider status lookup.
- Verifies the immutable refund ID, refund amount (paise), paid amount (paise), linked order, Cashfree order/payment IDs, and the order's active `refundRequestId` reservation before committing.
- Updates the refund request and order status in the same transaction; writes the corresponding audit log in that transaction as well.
- Prevents a stale `PENDING`/`UNKNOWN` refresh from downgrading a locally recorded provider `SUCCESS`.
- Prevents a non-success provider response from reopening a locally terminal failed state. A provider `SUCCESS` can reconcile an older local failure state.
- Fails closed with HTTP 409 if the active reservation or payment snapshot changed during provider I/O.

## Important behavior retained
- Provider I/O is outside the Firestore transaction; no database transaction can atomically include Cashfree network operations.
- The processing path retains the same deterministic idempotency key and refund ID on retry. The active order reservation is deliberately not released on ambiguous provider failure, so another refund cannot race ahead.
- This is still a single-active-refund-per-order design. Multiple sequential partial refunds require a dedicated immutable refund ledger and explicit reservation release/aggregate rules.

## Validation
- Static source assertions: verify transactional reread, reservation checks, paired order/refund writes, transactional audit write, and terminal-state protection.
- Full TypeScript build, Firestore Emulator concurrency tests, Cashfree sandbox tests, timeout/retry integration tests, and production tests were not run in this environment.
- No live refund or payout was initiated. Live payouts remain disabled.

## Operational note
Legacy submitted refunds without `orders/{orderId}.refundRequestId` matching the request will now fail closed during refresh. Reconcile these records manually before adding a controlled migration; do not clear a reservation blindly.
