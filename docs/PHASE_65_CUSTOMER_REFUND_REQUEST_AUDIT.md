# Phase 65 — Customer refund request and history audit

## Findings
- Active source contains an admin-only refund request list/approve/reject API at `src/app/api/admin/refund-requests/route.ts`.
- Active source contains an admin-only Cashfree process/refresh/reconcile API at `src/app/api/admin/refund-requests/process/route.ts`.
- Active admin UI is `src/app/admin/refund-requests/page.tsx`.
- A repository-wide source scan found no active customer-side writer for `refund_requests` (no active `add`, `addDoc`, or `setDoc` writer for this collection), and no customer-facing refund history page or request form.
- The only other request-refund phrase in the active API tree is the paid-order cancellation response instructing customers to submit a refund request; the corresponding customer submission endpoint is absent.
- Old backup UI files exist under `src.backup-20260824-172415`, but are not active `src/app` routes and must not be treated as production functionality.

## Release impact
The current repository does not provide a verified customer workflow to create refund requests or view their own refund history. Admin processing code cannot safely substitute for a customer creation endpoint.

## Why no customer endpoint was invented in this phase
A safe endpoint requires confirmed business rules and source schema for:
- which order states are refundable and the allowed time window;
- whether partial refunds are permitted and how requested amount is computed;
- ownership field and order line-item identity;
- whether shipping, discounts, tax, delivery, and return inspection affect refund amount;
- duplicate request policy and customer-visible rejection/retry semantics.
These are not sufficiently defined by the active source. Creating a generic endpoint without them could allow arbitrary amounts, duplicate claims, or refunds for ineligible orders.

## Required next implementation
1. Define refundable order statuses and time window.
2. Define full/partial refund policy and eligible amount formula using the persisted invoice snapshot.
3. Confirm order owner field and item/quantity representation.
4. Add authenticated customer POST endpoint with Firebase token revocation check, order ownership verification, amount validation in paise, duplicate/idempotency controls, and Firestore transaction.
5. Add customer GET history scoped to authenticated UID only.
6. Add customer UI with clear submitted/approved/rejected/provider-pending/success states.
7. Test with Firestore Emulator and Cashfree sandbox before enabling real refunds.

## Validation
Repository source scan and static audit only. No application build, browser test, database query, emulator, or provider call was performed. No production data was accessed or changed.
