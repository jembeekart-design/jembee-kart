# Phase 86 — Refund Policy Configuration and Publication Audit

## Files reviewed
- `src/firestore/admin/pages/returns/returnRefundExchangeSystemSettings.json`
- `src/app/refund-policy/page.tsx`
- `src/app/api/orders/[orderId]/cancel/route.ts`
- `src/app/api/admin/refund-requests/route.ts`
- `src/app/api/admin/refund-requests/process/route.ts`
- Prior customer refund entry-point and refund readiness audit reports

## Configuration observed in repository
The checked-in returns settings JSON currently declares:
- return/refund/exchange system enabled;
- refund requests and partial refunds enabled;
- wallet and bank refund methods enabled;
- automatic refund processing disabled;
- default return window: 7 days;
- exchange window: 7 days;
- refund processing target: 5 days;
- reasons: damaged product, wrong product, size issue, quality issue, missing item.

## Important distinction
These are checked-in configuration defaults, not proof of the active production Firestore settings or a customer-facing legally approved policy. The active `/refund-policy` page reads `dynamic_pages/refund-policy` from Firestore at request time. If that document is absent or hidden, the page explicitly displays “Refund policy is currently unavailable.” The actual published policy text was not available in this source archive.

## Compatibility gap
The settings advertise partial refunds and wallet/bank refund methods, while the reviewed active refund processor is Cashfree-provider-backed and validates a single request amount against the Cashfree-paid order amount. The code does not establish item-level allocation, return pickup/inspection completion, shipping/discount allocation, wallet refund settlement, or bank refund settlement. The settings also do not establish which order statuses qualify or how the 7-day window is measured.

## Safety decision
No customer refund submission endpoint was added in this phase. Enabling one from these defaults alone could create requests that conflict with the actual published policy or promise refund methods that have no verified settlement implementation. The existing paid-Cashfree cancellation block remains unchanged. Automatic refund processing and live payouts remain disabled.

## Required policy confirmation before implementation
1. Confirm the actual published return/refund policy text and its active version.
2. Confirm whether the 7-day window is measured from order placement, delivery, or another event.
3. Confirm eligible order states and whether customer cancellation before shipment is treated separately from a post-delivery return.
4. Confirm whether the first customer flow is full-refund-only for Cashfree-paid orders, or whether item-level/partial refunds are required immediately.
5. Confirm which refund reasons require photo proof, pickup, receipt, or inspection.
6. Confirm that customer requests are only submitted for admin review; no customer request should initiate a provider transfer.

## Phase outcome
Audit/report only; no source behavior changed. Static checks confirmed the configuration values and the Firestore-backed policy-page behavior. TypeScript build, Firestore Emulator tests, browser tests, production Firestore reads, and Cashfree sandbox/live calls were not run.
