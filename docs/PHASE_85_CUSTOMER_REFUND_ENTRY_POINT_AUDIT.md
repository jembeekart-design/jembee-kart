# Phase 85 — Customer Refund Request Entry-Point Audit

## Files reviewed
- `src/app/api/orders/route.ts`
- `src/app/api/orders/[orderId]/route.ts`
- `src/app/api/orders/[orderId]/cancel/route.ts`
- `src/app/api/admin/refund-requests/route.ts`
- Active API source scan for `refund_requests` writers

## Verified safeguards
- Customer order list and detail APIs verify Firebase ID tokens with revocation checking and scope reads to the authenticated user's own orders.
- The customer cancellation endpoint checks order ownership inside a Firestore transaction.
- A paid Cashfree order is not cancelled by the customer cancellation endpoint; it returns HTTP 409 and directs the customer to submit a refund request.
- Admin refund approval accepts only `pending` or `requested` requests, validates positive INR amount precision, and records an audit event.

## Finding — customer submission path missing
No non-admin active API route writes to `refund_requests`. The active customer order-list/detail projections also do not expose a refund-request status or submission action. Consequently, the cancellation endpoint's instruction to submit a refund request points to a customer flow that is not present in the scanned active API source.

## Risk
A customer with a paid Cashfree order may be blocked from cancellation without a supported in-app way to lodge a refund request. Do not work around this by allowing cancellation of paid orders or by writing directly from the client.

## Recommended next implementation
Add an authenticated server-side customer refund-request endpoint that:
1. verifies the Firebase token with revocation checking;
2. loads the order and checks `order.userId === uid` inside a transaction;
3. accepts only explicitly eligible paid Cashfree orders and validates the stored paid amount in integer paise;
4. prevents duplicate/nonterminal refund requests for the same order;
5. creates the request with server-derived user/order/product/amount fields (never trusting client-supplied amount or owner);
6. writes a customer-request audit event atomically;
7. exposes only the customer's own request status in order detail.

Eligibility states, return/exchange policy, and any time window must be confirmed from the project's actual policy before enabling submission. No policy was invented in this audit.

## Phase outcome
Audit/report only; no source behavior changed. Static assertions passed. TypeScript build, Firestore Emulator tests, browser tests, Cashfree sandbox/live calls, and deployed-index checks were not run. No refunds were processed. Live payouts remain disabled.
