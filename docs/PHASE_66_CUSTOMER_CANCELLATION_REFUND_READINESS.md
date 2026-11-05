# Phase 66 — Customer Cancellation & Refund Policy Readiness Audit

Date: 2026-11-01

## Scope
Reviewed the active order creation, customer cancellation, admin status transition, and invoice calculation code. This phase is an evidence-based readiness audit; it does not create a customer refund endpoint or change payout/refund behavior.

## Confirmed order schema
`src/app/api/orders/create/route.ts` creates one-product orders with:
- `userId` as the customer ownership field
- `productId`, `quantity`, `selectedSize`, `selectedColor`
- `paymentMethod`, `paymentStatus`, and `status`
- `finalAmount` in rupees
- immutable-at-creation invoice snapshots: `invoiceVersion`, `currency`, `invoiceSubtotalPaise`, `invoiceDiscountPaise`, `invoiceItemTotalPaise`, `invoiceShippingPaise`, `invoiceTotalPaise`
- stock lifecycle markers `stockDeducted: true` and `stockRestocked: false`

The invoice helper `src/lib/commerce/invoice.ts` currently models one product and a single quantity, with shipping calculated at order level. This is not an itemized multi-line invoice model.

## Customer cancellation behavior
`src/app/api/orders/[orderId]/cancel/route.ts`:
- Verifies Firebase ID token with revocation checking.
- Uses `userId` ownership check; non-owned orders return not found.
- Allows cancellation only when status is `placed` or `processing`.
- Blocks paid Cashfree orders and directs the customer to submit a refund request.
- Blocks pending Cashfree payments pending reconciliation.
- Restocks only when explicit stock markers and product/quantity data validate; otherwise legacy orders are marked for manual inventory review.
- Writes order status, inventory mutation, and status event in one Firestore transaction.

## Admin status behavior
`src/app/api/admin/orders/status/route.ts`:
- Uses an explicit transition map.
- Prevents generic cancellation of paid Cashfree orders until a full provider-confirmed refund is recorded.
- Requires payment reconciliation for pending Cashfree payments.
- Keeps delivered-order financial settlement pending; delivery is not treated as proof of commission/cashback settlement.

## Refund-readiness gaps
1. A customer cancellation response tells paid customers to submit a refund request, but Phase 65 found no active customer-facing refund-request creation endpoint or history page.
2. The persisted invoice snapshot is order-level and one-product; there is no evidence here of item-level return/refund allocation.
3. The code does not establish the store's refund window, whether cancellation after processing/shipping is allowed, whether shipping is refundable, or how discounts/free-shipping are allocated on partial refunds.
4. No verified return receipt/inspection workflow or restocking policy is established by these files.
5. Refund request eligibility must be based on server-read order ownership, payment state, current refund reservations/committed refunds, and the persisted invoice snapshot. A client-supplied refund amount must never be authoritative.
6. Existing cancellation stock restoration is not a substitute for a return inspection flow. Returned goods must not be restocked solely because a refund was requested.

## Safe implementation boundary
Do not add a customer refund endpoint until business policy is explicitly selected for:
- eligible order statuses and request window
- full refund versus partial/item-level refund
- shipping charge treatment
- discount and free-shipping allocation
- return pickup/receipt/inspection and stock disposition
- duplicate/repeated request behavior

When implemented, the server should derive the maximum refundable amount from trusted persisted order/payment/refund data, use integer paise, enforce ownership, reserve capacity transactionally, and require provider-confirmed settlement before marking a paid order cancelled/refunded.

## Result
No production behavior changed in Phase 66. Report-only audit. Live payouts remain disabled pending complete settlement implementation and required tests.
