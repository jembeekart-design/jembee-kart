# Phase 57 — Payment, COD Delivery & Refund Reconciliation Audit

Date: 2026-11-01

## Scope
Reviewed:
- `src/app/api/payments/cashfree/create-order/route.ts`
- `src/app/api/payments/cashfree/webhook/route.ts`
- `src/lib/payments/cashfree.ts`
- `src/app/api/admin/orders/status/route.ts`
- `src/app/api/admin/refund-requests/route.ts`
- `src/app/api/admin/refund-requests/process/route.ts`
- `src/app/api/orders/create/route.ts`

This is a source-code audit only. No live Cashfree request, production Firestore query, emulator, COD courier confirmation, or refund transfer was executed.

## Findings

### 1. Cashfree order creation — guarded, but provider-side verification remains external
- The endpoint authenticates the customer with a revocation-checked Firebase ID token and verifies order ownership.
- It reads the stored order amount rather than accepting a client-supplied amount.
- It validates INR, amount, phone number, provider order ID, and returned payment session.
- The provider response amount and currency are compared with the stored order amount.
- The payment session and provider order ID are persisted only after a transaction rechecks ownership, payment state, and amount.
- The provider idempotency key is deterministic per internal order.

**Remaining gate:** Verify API version compatibility and real sandbox responses. A created payment session is not proof of payment.

### 2. Cashfree webhook — signature and amount checks exist; currency fallback should be tightened
- Raw request bytes are used for HMAC signature verification with timing-safe comparison.
- The endpoint limits request size and rejects invalid signatures.
- Provider order ID is resolved against the stored mapping; ambiguous mappings are rejected.
- Only `SUCCESS` payment events proceed to confirmation.
- The transaction compares provider amount with the stored order amount and records a payment event.
- Duplicate successful payments and late payments after cancellation are flagged for manual review.
- A late payment after stock restoration does not silently restore the order to a normal fulfilment state.

**Risk to address next:** `confirmCashfreePayment()` currently treats a missing `payment_currency` as INR. For a strict financial reconciliation gate, require an explicit provider currency value of `INR`; do not infer currency when the provider omits it. Also add provider payment-ID uniqueness checks across orders before any future settlement is enabled.

### 3. Payment confirmation does not itself trigger wallet settlement
- Successful payment updates payment status and records the provider payment ID.
- Financial processing remains `pending` (or `manual_review` for late payment after cancellation).
- The reviewed webhook does not credit cashback, MLM commission, or creator earnings.

**Release rule:** Keep this separation. A payment-success webhook must never be treated as order delivery or payout authorization.

### 4. COD delivery confirmation is not independently evidenced
- The admin status API permits the normal order transition to `delivered`.
- For Cashfree orders, payment is independently confirmed by the webhook.
- For COD orders, this status route does not require a courier proof-of-delivery reference, OTP, recipient confirmation, or collected-cash evidence.
- Delivered status currently leaves financial processing pending and commission flags false, so this is not an immediate wallet-credit vulnerability.

**High-priority release gate:** Before COD cashback/commission is activated, add a trusted COD collection/delivery confirmation flow. It should capture courier/recipient evidence, amount collected, collection timestamp, actor, and idempotency reference. A manually selected `delivered` status alone must not establish the cashback paid-amount basis.

### 5. Refund processing — provider-backed, but refund reconciliation needs additional controls
- Refund processing is restricted to verified Cashfree-paid orders.
- Refund amount is validated to paise precision and cannot exceed the recorded order total.
- Before creating a refund, the service queries Cashfree's existing refunds and checks the aggregate against the paid amount.
- A transaction reserves the request and amount on the order and uses a deterministic provider refund ID.
- Provider status is refreshed from Cashfree; a refund is considered successful only for provider status `SUCCESS`.
- The order cancellation route requires a provider-confirmed full refund before cancelling a paid Cashfree order.
- COD/manual refunds are deliberately not automatically processed through this Cashfree path.

**Remaining risks / tests:**
- Existing-refund aggregate reconciliation occurs before the Firestore reservation transaction; concurrent refund requests must be tested against provider state and the single `refundRequestId` reservation.
- Partial refund semantics need an explicit policy: whether a partially refunded order remains fulfilable, is cancelled only after a full refund, and how future cashback/commission reversals are computed.
- Refund webhook events are not used in the reviewed flow; status refresh is an admin-initiated provider query. Confirm operational retry/reconciliation procedures.
- Test provider timeouts after Cashfree accepted a refund but before Firestore was updated. Retry must reuse the same refund ID and never create a second transfer.

### 6. Order amount reconciliation — invoice snapshot is available
- The order creation flow stores integer-paise invoice breakdown fields and `finalAmount`.
- Cashfree order creation and webhook confirmation compare provider amounts to the stored final amount.
- Refund processing also compares requested amount with the stored order amount.

**Remaining gate:** Reconcile actual captured amount, provider payment ID, provider order ID, currency, successful refunds, and COD cash collection into a durable per-order financial record before settlement.

## Phase 57 decision
**No live settlement or payout is authorized by this audit.** The existing fail-closed settlement flags and pending financial status must remain in place.

## Required tests before payout activation
1. Cashfree success webhook with exact amount and explicit INR.
2. Wrong amount, wrong currency, missing currency, invalid signature, malformed body.
3. Duplicate webhook delivery and same provider payment ID presented against another order.
4. Two different successful payment IDs for one order.
5. Payment arriving after cancellation/stock restoration.
6. Provider timeout after order creation and after refund submission; safe idempotent retry.
7. Two concurrent partial refund requests whose combined amount exceeds the captured amount.
8. Partial refund followed by full refund; full refund followed by cancellation.
9. COD delivered without proof, wrong collected amount, duplicate collection confirmation, and verified proof.
10. Refund reversal and cashback/commission reversal policy tests.

## Next phase
Implement narrowly scoped webhook currency/payment-ID hardening and design a server-authoritative COD collection confirmation record. Do not implement wallet credits until order profit, verified captured/collected amount, refunds/reversals, and settlement idempotency all pass tests.
