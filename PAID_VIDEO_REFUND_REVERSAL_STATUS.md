# JEMBEE PLAY Paid Video Refund Reconciliation

Paid-video refunds are reconciled against Cashfree provider refund history for the exact `watchVideoPaymentOrders` record. Confirmed successful INR refunds are converted to integer paise, compared with the cumulative previously reconciled amount, and applied as deterministic incremental reversal entries in `shortsSettlementLedger`.

A full refund revokes the matching `watchVideoPurchases` entitlement. Partial refunds reverse only the incremental allocation. Unknown provider statuses, malformed IDs/amounts, over-refunds, and ambiguous records fail closed for manual review.

This workflow is specific to paid video purchases and does not use general commerce refund collections. Wallet credits and bank payouts are not issued by the reconciliation route; live payouts remain disabled pending separate verification.
