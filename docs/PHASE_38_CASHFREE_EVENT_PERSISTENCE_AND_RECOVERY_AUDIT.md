# Phase 38 — Cashfree Event Persistence & Recovery Audit

Date: 2026-11-13

## Scope and result

Source-level audit of Cashfree webhook ingestion, paid-video verification recovery,
payment event idempotency, refund reconciliation, and the existing emulator
transaction test harness. Added five focused route-contract tests. No payment
route or Firestore schema was changed in this phase.

## Positive controls verified

1. **Webhook signature before business processing**
   - Bounded raw body is read before parsing.
   - Cashfree HMAC signature is checked before JSON parsing and before any order lookup.
   - Only `SUCCESS` payment events continue to purchase processing.
   - Provider order ID, payment order ID, INR currency, exact paise amount, order owner,
     video eligibility, and creator identity are checked.

2. **Payment event identity**
   - `watchVideoPaymentEvents/{cf_payment_id}` is the idempotency record.
   - A payment ID already associated with another internal order is rejected.
   - A repeated payment ID for the same order returns without writing a second set
     of purchase/ledger rows.
   - Different successful payment IDs against an already-paid order are flagged
     for manual duplicate-payment review.

3. **Missed-webhook recovery**
   - The authenticated buyer can call `/api/shorts/paid-video/verify`.
   - The endpoint reads the buyer-owned internal order, then asks Cashfree for
     `/orders/{cashfreeOrderId}/payments`.
   - It filters for exactly matching order ID, `SUCCESS`, INR, and exact amount.
   - Zero successful matches return unpaid; more than one successful match fails
     closed for manual review.
   - A single valid payment is committed transactionally: purchase entitlement,
     order paid state, payment event, and three settlement ledger entries.
   - The endpoint requires Cashfree payments to be enabled (`getCashfreeConfig()`
     default policy). This is a recovery constraint if operators disable payments.

4. **Refund recovery**
   - Admin reconciliation fetches provider refund history, sums only successful
     refunds, and rejects unknown statuses, malformed successful refunds,
     totals above the original payment, and provider totals below the local
     cumulative watermark.
   - Inside the Firestore transaction it rechecks the current order/payment ID
     and cumulative refund watermark before appending reversal rows.
   - Repeating the same cumulative provider total is a no-op.

5. **Emulator test coverage**
   - Phase 33 harness covers concurrent duplicate transaction writes, refund
     replay, teacher commission adjustment, read-before-write transaction rules,
     and concurrent counters.
   - Phase 34 rules suite covers client denial for financial collections.
   - Both remain opt-in and were skipped in this environment without an
     emulator host.

## Gaps and recovery risks

- There is no separate durable raw-webhook inbox/attempt journal. Successful
  payment events are persisted atomically with purchase/order/ledger updates,
  which avoids partial application, but malformed, non-SUCCESS, unknown-order,
  and signature-invalid deliveries are not recorded as a durable event history.
  Do not persist unverified payloads as trusted financial events. If an operational
  inbox is added later, keep signature-verification state, raw-payload retention,
  redaction, and trusted processing state distinct.
- Webhook success-event processing depends on a matching internal order document.
  An unknown order currently returns an error; the provider delivery/retry policy
  and operational dead-letter/replay procedure should be documented and tested
  against Cashfree before production.
- Buyer verification is an effective recovery path but is not an operator-driven
  recovery queue. It requires the buyer's authenticated session and the payment
  feature to remain enabled.
- More than one successful provider payment is deliberately not auto-selected.
  A manual refund/duplicate-payment workflow is still required.
- Refund history is fetched outside the Firestore transaction. The order and
  cumulative watermark are rechecked inside the transaction; provider-side
  refund history can still change between fetch and commit. Reconciliation must
  be safely repeatable and the next run will converge to the provider's current
  confirmed cumulative total.
- Emulator tests in this phase were not executed against a running Firestore
  emulator, and no Cashfree sandbox request was sent.

## Added tests

`src/app/api/shorts/paid-video/verify/__tests__/webhook-recovery-audit.test.mjs`
checks:
- buyer-scoped provider-backed recovery,
- exact successful payment filtering and multiple-success fail-closed behavior,
- transactionally grouped purchase/order/event/ledger writes,
- `cf_payment_id` event identity and cross-order reuse rejection,
- refund transaction watermark checks.

## Safety boundary

No Firestore collection, document, index, or security rule was changed.
No Cashfree credentials/settings, payout settings, paid-video flags, or settlement
logic were changed. No live provider requests, deployments, commits, or pushes
were performed. Live payouts and paid-video enablement remain gated.

This is a source-level audit, not production readiness approval.
