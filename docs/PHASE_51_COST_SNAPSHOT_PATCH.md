# Phase 51 — Immutable product-cost snapshot (limited implementation)

## Change made
`src/app/api/orders/create/route.ts` now snapshots the Admin-maintained `products/{productId}.costPrice` into each new order:
- `productCostPrice`
- `productCostTotal` (cost price × quantity, rounded to paise)
- `costPriceNeedsReview`
- `profitInputsStatus: "incomplete"`
- `profitInputsVersion: 1`

The snapshot is written in the same Admin SDK transaction as order creation and stock decrement. Later edits to the catalog cost do not alter the order's saved cost snapshot.

## Validation
- If `costPrice` is present, it must be a finite non-negative number and round safely to paise.
- Missing cost is stored as zero and flagged for review.
- A zero cost is also flagged because the current admin product form defaults an empty cost input to `0`; it cannot distinguish an intentionally free-cost item from an unknown cost.
- Invalid cost data is rejected with `INVALID_PRODUCT_COST`.

## Important limitations
This is not a completed profit engine:
- The current product admin form writes `costPrice` from a client page, but Firestore rules restrict product writes to admin users. The API reads it from Firestore via Admin SDK, so customer-supplied cost is not accepted.
- Shipping cost, tax, discount funding source, gateway fee, seller payable, and actual paid/collected amount are still not snapshotted.
- `profitInputsStatus` deliberately remains `"incomplete"` for every new order.
- No settlement/payout code was added or enabled.
- Existing orders are not backfilled. Their historic cost must be reconstructed from trusted historical records, not current product cost.

## Next required work
1. Add an explicit admin-controlled `costPriceConfigured` field or mandatory cost-entry workflow so zero is not ambiguous.
2. Add server-side shipping/tax quote and persist invoice line items in integer paise.
3. Record payment capture/COD collection and successful refund events.
4. Calculate actual profit only from immutable order snapshots and verified payment/refund events.
5. Add emulator and provider sandbox tests before any payout.

## Verification
Static source assertions and ZIP integrity only. No TypeScript build, Firestore Emulator, Cashfree sandbox, or live data test was run.
