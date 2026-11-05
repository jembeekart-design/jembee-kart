# Phase 59 — Refund Concurrency & Provider Ledger Hardening

Date: 2026-11-01

## Changes
Updated `src/app/api/admin/refund-requests/process/route.ts`.

1. Added strict INR-to-paise parsing for provider refund amounts. Non-finite, non-positive, unsafe, or fractional-paise amounts are rejected.
2. Cashfree's existing refund list is now treated as a financial ledger: every non-cancelled/non-rejected refund must have a valid paise amount. An unknown status is conservatively counted as committed; a malformed amount or unknown amount state fails closed and requires manual reconciliation.
3. Existing provider refund reference is checked for exact amount equality before it can be reused.
4. Provider submission response and provider status refresh both require exact refund ID and exact paise amount.
5. The Firestore order reservation now explicitly stores `refundAmountReservedPaise` and `refundReservationStatus: active`.
6. Preserved the existing one-active-refund-request-per-order lock. Concurrent requests cannot both reserve the same order: the first transaction sets `refundRequestId`; a competing request sees another request already reserved.

## Important limitation
The current data model deliberately serializes refunds to one request per order. It does not yet support a sequence of multiple partial refunds for the same order. Supporting that safely requires a dedicated immutable per-order refund ledger, aggregate reserved/successful refund totals, lock release rules, and reversal/settlement policy. Do not remove the single-request lock until that ledger is implemented and tested.

## Static verification
- Confirmed strict paise parser is used for provider ledger entries and provider responses.
- Confirmed malformed provider ledger entries fail closed.
- Confirmed explicit single-refund reservation lock fields.
- Confirmed provider refund ID and amount are checked on submit and refresh.
- ZIP archive integrity checked after packaging.

## Not performed
No full TypeScript build, Firestore Emulator, Cashfree sandbox request, concurrent integration test, production Firestore mutation, or real refund was performed.

## Release gate
No live payouts or automatic refund execution is authorized by this source audit. Keep MLM commission and cashback settlement disabled until the independent settlement implementation and tests pass.
