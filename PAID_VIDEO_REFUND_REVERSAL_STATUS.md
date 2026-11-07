# Paid Video refund reversal status

`src/lib/server/paidVideoRefundReversal.mjs` calculates the incremental reversal
for confirmed partial or full INR refunds using integer paise. It allocates the
refund against the original 30% creator / 20% sharer / 50% platform split and
uses cumulative rounding so multiple partial refunds reconcile exactly.

## Important integration boundary

This is a tested calculation helper, **not a live refund-to-ledger integration**.
The current Cashfree refund administration flow operates on the general
`orders` / `refund_requests` collections. Paid Video purchases and their
revenue entries live in `watchVideoPaymentOrders`, `watchVideoPurchases`, and
`shortsSettlementLedger`. Those records are not yet linked by a verified
cross-collection refund reference. Do not call this helper to create reversal
entries until a Cashfree `SUCCESS` refund has been reconciled to the exact Paid
Video payment and a Firestore transaction has atomically written deterministic
reversal entries and updated cumulative refunded paise.

Wallet credits and payouts remain disabled. Unverified share attribution stays
unallocated; a refund reversal must still debit the corresponding unallocated
share bucket rather than assigning it to another user.
