# Phase 56 — Server invoice quote and checkout parity patch

## What changed

### Shared server calculation
Added `src/lib/commerce/invoice.ts`.
- Uses integer paise for all invoice arithmetic.
- Validates price, discount, shipping charge, threshold, quantity, and safe integer totals (unit monetary values capped at ₹1 crore in the shared calculator).
- Supports explicit free shipping for all orders and a free-shipping threshold.
- Produces an invoice breakdown and INR currency marker.

### Authenticated quote API
Added `src/app/api/orders/quote/route.ts`.
- Requires a verified Firebase ID token with revocation check.
- Reads product and `settings/shipping` from Admin Firestore.
- Requires `shippingConfigured: true`.
- Returns item subtotal, discount, item total, shipping, total payable, delivery estimate, and quote timestamp.
- Uses no-store responses.

### Order creation now recalculates
Updated `src/app/api/orders/create/route.ts`.
- Reads shipping settings inside the same Firestore transaction as product and address.
- Recalculates the invoice from trusted Firestore data using the shared helper.
- Compares server total with `expectedTotalPaise` displayed to the customer; if the quote changed, order creation is rejected and the customer must review the updated invoice.
- Persisting invoice version, currency, integer-paise breakdown, shipping charge, delivery days, and finalAmount.
- Cashfree continues to read the saved `finalAmount`; COD order stores the same amount.
- Idempotent retries must match the same expected total.

### Checkout UI
Updated `src/app/checkout/page.tsx`.
- Fetches server quote after product load.
- Displays the server-derived shipping charge and total.
- Blocks order submission while quote is loading, missing, or invalid.
- Sends only the expected total in paise for server-side comparison; it does not send a trusted charge.
- Removes the hardcoded FREE shipping display.

### Validation refinement
Money validation uses a small floating-point tolerance around integer paise to avoid incorrectly rejecting valid values such as ₹1.15 due to binary floating-point representation. Inputs with more than two decimal places remain rejected.

## Important behavior
Checkout and order creation now require the admin to save shipping settings first (`shippingConfigured: true`). This is deliberate fail-closed behavior: no order can be created using an assumed shipping policy. Configure and verify shipping in a non-production environment before enabling checkout.

## Static checks
Source assertions passed for authentication, trusted reads, shared invoice calculation, transaction revalidation, expected-total comparison, immutable paise snapshot, checkout quote display, and submission blocking. Arithmetic cases passed for paid shipping, threshold free shipping, all-order free shipping, and discounted item plus shipping.

## Verification limits
No TypeScript build (dependencies are not installed in this worktree), Firebase Emulator, browser test, Cashfree sandbox transaction, or deployed settings test was run. Do not treat this as production certification.
