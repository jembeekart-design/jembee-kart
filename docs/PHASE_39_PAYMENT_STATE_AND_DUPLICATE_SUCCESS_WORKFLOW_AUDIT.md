# Phase 39 — Payment State & Duplicate Successful Payment Workflow Audit

Date: 2026-11-13

## Scope
Read-only audit of Cashfree paid-video checkout, signed webhook, buyer verification/recovery, and admin refund reconciliation. No provider calls, Firestore writes, schema/rules changes, payout changes, or paid-video gate changes were performed.

## Observed order lifecycle
- Checkout creates `watchVideoPaymentOrders/{orderId}` with `status: "pending"`.
- A still-valid pending session can be reused during the checkout idempotency window.
- The webhook rejects `cancelled` and `expired` orders before purchase/ledger writes.
- Buyer verification also rejects `cancelled` and `expired` orders.
- Successful webhook or buyer verification can move a pending order to `paid`.
- No shared state-transition validator/table was found. The observed checks are local to the route handlers; creation of `cancelled`/`expired` states and any expiry worker were not established by this source audit.

## Findings

### P39-01 — Critical consistency gap in buyer recovery for a second successful payment
The signed webhook checks `current.status === "paid" && current.cfPaymentId !== paymentId` and writes `duplicatePaymentReviewRequired` plus `duplicatePaymentId` before it returns without granting another purchase or writing a second event/ledger split.

The buyer recovery route queries Cashfree's payment history and requires exactly one matching successful payment. However, inside its Firestore transaction it does not compare an already-paid order's stored `cfPaymentId` with the provider payment ID returned by that query. It only updates the order when the order is not already `paid`. Therefore, if provider history later presents one successful payment whose ID differs from the already-paid order's stored ID (for example, after a second charge is the only matching SUCCESS visible), recovery may create a payment event for the new ID while leaving the order and existing purchase associated with the old ID. The webhook's duplicate-review marker is not set by this path.

**Risk:** payment identity and recovery evidence can diverge. The route's "exactly one success" check does not by itself prove that the success is the same payment already recorded on the order.

**Required remediation design:** in the recovery transaction, if the order is already `paid` and its stored `cfPaymentId` differs from the verified provider `paymentId`, atomically mark the order for duplicate-payment review and do not create a payment event, purchase entitlement, or settlement rows for the new payment. Do not throw after writing the review marker inside the transaction (that would abort the marker); return a typed review outcome and translate it to a non-success HTTP response after commit. Add transaction/emulator tests for same-ID replay, different-ID second success, and concurrent webhook/recovery races. This phase intentionally records the issue rather than changing financial route behavior without a reviewed transaction design.

### P39-02 — Duplicate review marker has no operator resolution workflow in source
Repository search found `duplicatePaymentReviewRequired` and `duplicatePaymentId` only in the webhook and a security contract test. No admin route, admin page, review queue, or resolution action referencing these fields was found under `src/app/admin` or `src/app/api/admin`.

**Risk:** webhook can flag a duplicate payment but the codebase does not expose a supported admin workflow to investigate and resolve it. No automatic refund should be inferred or triggered.

**Required remediation design:** create a protected, auditable admin queue that reads flagged orders, fetches exact Cashfree order/payment/refund history, records operator decision and evidence, and supports only provider-confirmed refund reconciliation. Any refund initiation must be a separate explicit, idempotent action with role checks and audit evidence. Never auto-refund based only on a webhook duplicate marker.

### P39-03 — Refund reconciliation is separate from duplicate-payment resolution
The existing admin refund reconciliation requires a locally paid order with a recorded `cfPaymentId`, reads Cashfree refund history, accepts only known statuses, sums `SUCCESS` refunds, enforces the original-payment ceiling, and rechecks the order/payment identity and cumulative watermark inside the transaction. It does not resolve a second successful payment ID or initiate a refund for that second payment.

### P39-04 — State transitions are route-local
The checkout, webhook, and recovery routes contain local state checks. No canonical state transition function or explicit transition table was found. Current observed protection prevents webhook/recovery grants for cancelled or expired orders, but broader lifecycle behavior (provider expiry synchronization, cancellation transitions, stale pending cleanup, and operator override) is not established by this audit.

## Test coverage added
`src/app/api/shorts/paid-video/verify/__tests__/payment-state-duplicate-review-audit.test.mjs` adds source-contract checks for:
- pending checkout creation/reuse;
- cancelled/expired rejection;
- webhook duplicate-payment marker;
- recovery-path missing different-payment guard;
- absence of an admin duplicate-review handler/UI;
- refund reconciliation's provider-confirmed refund and payment identity checks.

These are audit/contract tests, not Firestore transaction integration tests. Emulator tests and Cashfree sandbox scenarios were not run in this phase.

## Release posture
Paid-video checkout and live payouts remain gated pending remediation and verification. Do not treat this audit ZIP as approval for production payment activation.
