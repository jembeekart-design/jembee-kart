# Phase 52 — Explicit cost configuration and shipping audit

## Changes made

### Admin product form
`src/app/admin/products/page.tsx`
- New products now require an explicitly entered cost price.
- A literal `0` is allowed only when the admin intentionally enters it; blank is rejected.
- Cost price is validated as a finite non-negative amount with safe paise precision.
- New products save `costPriceConfigured: true`.
- Editing an existing product's cost marks `costPriceConfigured: true` only when the entered value differs from the stored value. Blurring an unchanged legacy default does not silently mark it configured.

### Order creation
`src/app/api/orders/create/route.ts`
- `costPriceNeedsReview` now depends on the trusted product marker `costPriceConfigured !== true`, rather than treating every zero amount as missing.
- The per-order cost snapshot from Phase 51 remains immutable.

## Shipping findings
- `src/lib/admin-config/types.ts` and `src/lib/admin-config/defaults.ts` define `freeShipping` and `shippingCharge`.
- `src/lib/admin-config/provider.tsx` loads the shipping settings document.
- `src/app/checkout/page.tsx` currently renders delivery charges as `FREE`.
- `src/app/api/orders/create/route.ts` does not read the admin shipping configuration and calculates `finalAmount` from discounted product price × quantity only.
- Therefore checkout display, admin shipping settings, and server order total are not currently a unified invoice calculation.
- No shipping change was made in this phase because silently adding shipping to the API without updating checkout quote, payment amount, COD totals, refunds, and order display could cause customer charge mismatches.

## Remaining gaps
- No authenticated server-side invoice quote endpoint exists in the inspected active flow.
- Tax/GST calculation and discount funding source are not represented in the active order snapshot.
- Gateway fee must be based on actual provider settlement records, not guessed at checkout.
- Existing product records need a controlled admin review to set `costPriceConfigured`; no bulk update/backfill was performed.

## Verification limits
Static source assertions and ZIP integrity only. No TypeScript build, browser checkout, Firestore Emulator, production settings read, or Cashfree sandbox test was run.
