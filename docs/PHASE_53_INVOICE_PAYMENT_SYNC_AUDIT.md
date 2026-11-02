# Phase 53 — Invoice, shipping and payment synchronization audit

## Scope
Read-only review of the active checkout page, order creation API, Cashfree create-order API, and admin shipping configuration.

## Verified flow
1. `src/app/checkout/page.tsx` displays product price, discount, hardcoded `FREE` delivery, and total payable based on the client-loaded product document.
2. The checkout sends `productId`, quantity, payment method, variant, address context (stored server-side), and idempotency key to `/api/orders/create`.
3. `src/app/api/orders/create/route.ts` reloads product and address from Firestore via Admin SDK and computes `finalAmount` from server-side product discount price × quantity. It does not read `settings/shipping`.
4. `src/app/api/payments/cashfree/create-order/route.ts` uses the saved order's `finalAmount` as Cashfree `order_amount`, then verifies the provider response amount/currency.
5. `src/lib/admin-config/provider.tsx` loads `settings/shipping`; `src/lib/admin-config/types.ts` defines `freeShipping`, `shippingCharge`, and `deliveryDays`; defaults currently set `freeShipping: false`, `shippingCharge: 0`.

## Findings

### F53-01 — Checkout shows hardcoded free delivery
**Severity: High (customer invoice transparency).**
`src/app/checkout/page.tsx` renders `Delivery Charges: FREE` regardless of admin shipping configuration. This is a client display, not a trusted quote.

### F53-02 — Order API ignores configured shipping
**Severity: High (invoice correctness).**
`src/app/api/orders/create/route.ts` computes subtotal, discount, and finalAmount from product prices only. It does not load `settings/shipping`, and does not persist `shippingCharge` or an invoice breakdown.

### F53-03 — Cashfree faithfully charges saved finalAmount, not the checkout preview
**Severity: High (checkout/payment mismatch risk).**
Cashfree create-order reads `order.finalAmount` and validates the provider-returned amount. This is good provider-side integrity, but it means any future shipping/tax change must update the order creation amount and checkout display together.

### F53-04 — Shipping defaults are ambiguous as a business policy
**Severity: Medium.**
The defaults are `freeShipping: false` and `shippingCharge: 0`. The code can technically treat this as zero charge, but that does not clarify whether zero means an intentional free-shipping policy or an unconfigured shipping fee. A fail-closed invoice should flag incomplete shipping configuration rather than silently infer a business decision.

## Recommended Phase 54 implementation
1. Add an explicit `shippingConfigured` flag and validate `shippingCharge` as a finite non-negative INR amount with safe paise precision.
2. Create a server-only invoice quote function that accepts product ID and quantity, authenticates the user, and reads product + shipping settings from Admin Firestore.
3. Return a versioned quote: item subtotal, item discount, shipping, tax (only when a verified tax policy exists), payable total, currency, and quote expiry/version.
4. Use the same calculator inside `/api/orders/create`; never trust a client-supplied quote total.
5. Persist immutable invoice breakdown and integer-paise values on the order.
6. Make checkout display the server quote and submit only the quote ID/version plus the product selection; server revalidates all inputs.
7. Keep Cashfree charging the persisted server-calculated payable amount.
8. Ensure COD collection confirmation and refunds reference the same invoice/payment ledger.
9. Add tests for free shipping, paid shipping, missing settings, malformed values, discount edge cases, retry/idempotency, Cashfree amount equality, and COD amount equality.

## No code change in this phase
Shipping was not enabled or added to order totals because doing only one side would create a customer-visible mismatch. The current system still has no verified tax policy or shipping-configured flag. A coordinated quote/order/checkout patch is required.

## Verification limits
Source-only static review. No browser runtime, Firebase Emulator, deployed settings read, Cashfree sandbox, or payment reconciliation test was performed.
