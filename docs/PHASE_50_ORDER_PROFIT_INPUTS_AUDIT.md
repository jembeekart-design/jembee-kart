# Phase 50 — Order profit inputs and checkout snapshot audit

## Confirmed settlement policy
- MLM commission basis: actual order profit.
- Cashback basis: actual customer paid amount.
- Live payouts remain disabled.

## Active order creation path
`src/app/api/orders/create/route.ts` reads product data from Firestore and server-calculates:
- `productPrice` from `product.price`
- `productDiscountPrice` from `product.discountPrice` (or list price)
- `subtotal`
- `discount`
- `finalAmount`

It stores these values in the order document and reserves stock transactionally.

## Findings

### F50-01 — Order does not snapshot trusted product cost
**Severity: Critical for profit-based settlement.**
- The active order creation route does not read or persist a validated product cost field.
- No `productCost`/COGS snapshot is written to the order.
- A later cost edit on the product would make historical profit calculations ambiguous if settlement reads the live product document.
**Required fix:** store a trusted, immutable cost snapshot per order line at order creation, sourced from a server-protected product cost field. Ensure client product reads/writes cannot set or alter this field.

### F50-02 — Shipping, tax and payment fee inputs are missing from order snapshot
**Severity: High for accurate profit and paid-basis cashback.**
- The order creation route does not calculate or persist shipping charge, tax amount, or Cashfree/payment gateway fee.
- `src/lib/admin-config/types.ts` defines shipping configuration, but the active order route does not apply it to `finalAmount`.
- Checkout UI in `src/app/checkout/page.tsx` displays product price/discount and total payable; it does not display a shipping/tax breakdown.
- `finalAmount` currently represents discounted product price × quantity in the active route, not a demonstrated full invoice total including shipping/tax.
**Required fix:** design a single server-side invoice calculator. Persist item subtotal, discounts and funding source, shipping, tax, gateway fee (when known), amount due, amount captured/collected, refund totals, and currency as integer paise. Client UI should display the server quote.

### F50-03 — Legacy profit helper reads fields not produced by active checkout
**Severity: High if reactivated.**
- `src/lib/mlm/orders/processOrderProfit.ts` computes `sellingPrice - productCost - shippingCost - platformFee`.
- The active order creation route does not write these inputs.
- It uses client Firestore `runTransaction`, not Admin SDK.
- It checks `order.status !== "DELIVERED"` (uppercase), while the active admin status route writes lowercase `"delivered"`.
- It allocates cashback as a percentage of `netProfit`, conflicting with the confirmed policy that cashback basis is actual paid amount.
**Disposition:** keep this legacy helper dormant. Do not patch the formula in isolation; replace with a server-only policy-aware settlement service after invoice data is complete.

### F50-04 — Legacy pending/release commission helpers use order total and client writes
**Severity: High if reactivated.**
- `src/lib/mlm/orders/createPendingCommission.ts` and `releasePendingCommission.ts` use `orderData.totalAmount * 0.02` for each upline level.
- Active order creation writes `finalAmount`, not `totalAmount`.
- Both helpers use client Firestore SDK reads/writes and are not compatible with the current deny-client-write rules.
- The commission formula is based on order total, not actual order profit.
**Disposition:** do not activate; replace with a trusted server settlement engine that derives profit and applies the approved referral rate table.

### F50-05 — Cashback basis cannot yet be proven from current order schema
**Severity: Critical for cashback settlement.**
- The active order stores `finalAmount`, but Cashfree's captured amount is separately verified through provider integration.
- Refund APIs maintain refund reservations/status, so settlement must use verified captured/collected amount minus successful refunds, not simply the initial order amount.
- COD orders need an authoritative collection confirmation before they count as paid.
**Required fix:** persist verified payment/collection events and successful refund totals; derive `netPaidAmountPaise` from those records.

## Safe implementation sequence
1. Define server-protected product cost and seller cost ownership.
2. Implement server-side invoice quote and integer-paise arithmetic.
3. Snapshot cost, discount, shipping, tax, payment fee, currency and invoice version on order.
4. Capture Cashfree provider-confirmed paid amount; add explicit COD collection confirmation.
5. Link full/partial refunds and chargebacks to the order payment ledger.
6. Calculate profit only from the immutable order snapshot and verified financial events.
7. Calculate cashback from net verified paid amount.
8. Calculate MLM commissions from actual profit and the approved rate table.
9. Write settlement snapshot and all recipient ledger entries atomically with deterministic idempotency keys.
10. Add refund reversal and reconciliation tests before enabling payouts.

## Verification limits
Source inspection only. No product database export, Cashfree sandbox, COD collection workflow, deployed environment, TypeScript build, or Firebase Emulator tests were run. The report does not claim the production product schema has no cost field; it establishes that the active order-creation path does not currently snapshot one.
