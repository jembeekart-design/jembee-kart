# Phase 64 — Admin refund reconciliation UI

## Changes
- Added a per-request `Reconcile Provider Ledger` action for submitted/successful/failed Cashfree refunds.
- Calls the existing admin-only read-only reconcile API using the Firebase bearer token.
- Displays paid amount, provider total, committed refunds, remaining capacity, provider count, malformed rows, unknown statuses, and over-refund flag.
- Displays local/provider matches, amount/status mismatch labels, unmatched provider IDs, and local requests missing from provider.
- Manual review status is visually explicit.
- Keeps process/refresh/approve/reject actions distinct; reconciliation itself does not mutate financial state.

## Validation
Static source checks and ZIP integrity only. No full TypeScript build, browser run, Firestore Emulator, Cashfree sandbox, or production verification was performed.
