# Phase 58 — Cashfree Webhook Hardening & COD Evidence Design

Date: 2026-11-01

## Implemented source changes

### `src/lib/payments/cashfree.ts`
- Cashfree SUCCESS payment events now require an explicit `payment_currency` of `INR`; missing currency is no longer silently assumed to be INR.
- Payment amount must be a positive, safe integer number of paise. Fractional-paise values are rejected.
- Stored order `finalAmount` must also be valid paise precision and exactly match provider amount in paise.
- The payment confirmation transaction now queries existing orders for the same `cashfreePaymentId`. If that provider payment ID is already attached to another internal order, the event is recorded as a retryable mismatch and is not accepted as payment for this order.
- Provider payment ID length is bounded.
- Existing idempotency, duplicate-successful-payment, late-payment-after-cancellation and pending financial processing behavior is preserved.

### `src/app/api/payments/cashfree/webhook/route.ts`
- `payment_id_reused` is treated as a reconciliation conflict (HTTP 409), not acknowledged as a successful payment.

## COD evidence design (not activated)
A safe COD flow should be separate from the generic order-status endpoint:
1. Courier/authorized operator submits an authenticated delivery confirmation.
2. Server verifies order is COD, status is shipped, actor has the appropriate role, and order is not already confirmed.
3. Required evidence: courier/provider reference, delivered timestamp, collected amount in INR paise, collection mode, recipient/OTP proof reference, and actor UID.
4. The transaction compares collected amount against the order's outstanding collectible amount, writes an immutable COD collection event with a unique idempotency key, and marks the order's COD collection status.
5. Duplicate event IDs return the original result; a different second collection attempt is sent to manual review.
6. A COD order is eligible for cashback only after verified collection amount minus confirmed refunds/returns is known. Delivery alone is insufficient.
7. MLM commission still uses actual order profit, not COD collection amount. Profit inputs, deductions, refund reversals and payout ledger idempotency remain mandatory.

No COD endpoint was activated in this phase because the repository does not yet establish a trusted courier/OTP provider integration or the operator authorization model. Accepting a free-form admin checkbox as proof would create false collection evidence.

## Static checks
- Source assertions confirm explicit INR requirement, paise precision checks, transactional provider payment-ID uniqueness lookup, and webhook 409 handling.
- No full TypeScript build, Firestore Emulator, Cashfree sandbox, deployed webhook, or live COD test was run.

## Release gate
Keep live wallet settlement disabled. This patch hardens payment confirmation only; it does not authorize cashback, MLM commission, COD collection or refunds to be settled automatically.
