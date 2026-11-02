# Phase 61 — Refund submission commit hardening

## Scope
Harden the local persistence boundary after Cashfree accepts or returns a refund response, and after an ambiguous provider failure.

## Changes
- Replaced parallel refund/order/audit writes after provider submission with a single Firestore transaction.
- Transaction re-reads refund and order and verifies refund ID, request/order linkage, amount, active reservation, reserved amount, and Cashfree order/payment identifiers.
- Refuses to commit a provider response if the reservation changed while the external request was in flight.
- Prevents a late submission response from overwriting an already submitted/successful local state.
- Failure recovery now re-reads both records in a transaction and only marks retry-required if this request still owns the active reservation and is not already submitted/successful.
- Audit event is written atomically with the successful local status update.

## Safety boundaries
- Cashfree network call and Firestore transaction cannot be atomic together. If Cashfree accepts a refund but the response is lost, the request remains ambiguous; retry must use the same deterministic idempotency key and refund ID, and provider reconciliation remains mandatory.
- The one-active-request-per-order lock is intentionally retained. No automatic lock release or sequential partial refund support is introduced.
- This is not an immutable multi-refund ledger and does not authorize live payouts.

## Validation
- Static source assertions and ZIP integrity checks only.
- Full TypeScript build, Firestore Emulator tests, concurrent integration tests, Cashfree sandbox tests, and production verification were not run.
