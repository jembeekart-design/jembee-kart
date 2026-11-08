# Paid Video Refund Reconciliation

## Endpoint
`POST /api/admin/shorts/paid-video-refunds/reconcile`

Requires a Firebase ID token for an `admin` or `super_admin` user and JSON `{ "orderId": "..." }`.

## Behavior
- Reads only `watchVideoPaymentOrders` records already marked `paid` and containing a verified Cashfree payment ID.
- Fetches the provider refund list for the exact Cashfree order.
- Counts only Cashfree `SUCCESS` refunds. Pending, on-hold, cancelled, and rejected refunds do not reverse revenue.
- Unknown provider states, malformed IDs/amounts, histories over 500 rows, and totals exceeding the original payment fail closed for manual review.
- Calculates only the incremental reversal since `shortsRefundedPaise` using integer paise.
- Writes deterministic negative reversal entries to `shortsSettlementLedger` in a Firestore transaction.
- On a full refund, revokes the matching `watchVideoPurchases` entitlement. Partial refunds are recorded but do not revoke access.

## Important limits
- This endpoint reconciles an already completed provider refund; it does not initiate a refund.
- It does not credit/debit wallets or initiate payouts.
- Run it after Cashfree reports the refund as `SUCCESS`; repeat calls are idempotent.
- A refund total that regresses compared with the last recorded provider total requires manual review.
- Production deployment, Firebase rules verification, and Cashfree sandbox/live tests are still required.
