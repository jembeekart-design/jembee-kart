# Phase 63 — Refund provider/local reconciliation

## Change
Added a read-only `reconcile` action to the existing admin refund processing endpoint. It compares all local refund requests for the selected order with Cashfree's refund list.

## Output
- Local/provider refund ID, amount, and terminal-status matches.
- Local submitted/processing/retry-required refunds missing from provider.
- Provider refund IDs with no matching locally expected request.
- Provider amount totals and committed total (excluding explicit CANCELLED/REJECTED).
- Remaining refundable capacity against the stored paid order amount.
- Malformed provider rows, duplicate provider IDs, unknown statuses, amount/status mismatches, and over-refund conditions.
- `manualReviewRequired=true` for incomplete, ambiguous, or mismatched records.

## Safety
- Reconciliation is read-only; it does not change refund/order statuses, release locks, create ledger entries, or trigger a refund.
- Malformed provider list returns a manual-review result, not an empty ledger.
- Local requests in `processing`, `retry_required`, `submitted`, or `success` are expected to appear in provider results.
- Unknown provider statuses are surfaced for review and never assumed to be harmless.

## API
POST action: `{ "requestId": "<refund request document id>", "action": "reconcile" }`
Requires the existing Firebase admin bearer token. Response is no-store.

## Validation
Static assertions and ZIP integrity only. Full TypeScript build, Firestore Emulator, concurrent integration, Cashfree sandbox, and production verification were not run.
