# Phase 71 — Legacy Refund Status Compatibility and Fail-Closed Patch

Date: 2026-11-01

## Finding
The admin refund-list API presented a missing/non-string status as `Pending`. The approve/reject API also defaulted a missing status to `Pending`. This could make a legacy or malformed record appear eligible for approval/rejection despite lacking an explicit workflow state.

## Changes
File: `src/app/api/admin/refund-requests/route.ts`

1. Admin GET now exposes missing/blank/non-string status as `legacy_status_missing` rather than `Pending`.
2. Admin POST no longer defaults a missing status to `Pending`.
3. Approval/rejection remains limited to records with explicit status `pending` or `requested` (case-insensitive after trim).
4. Missing/blank/unknown/legacy statuses now return the existing conflict response and cannot be approved or rejected automatically.

## Compatibility notes
- `Pending`, `pending`, and ` pending ` normalize to `pending`.
- `Requested` and `requested` normalize to `requested`.
- Existing `Rejected` remains non-pending and cannot be re-approved.
- Missing status is visible as `legacy_status_missing`, requiring manual inspection.
- This phase does not migrate legacy records or rewrite stored status values.

## Static validation
- Confirmed GET fallback is `legacy_status_missing`.
- Confirmed POST reads only an explicit string status and defaults to empty.
- Confirmed only `pending` and `requested` are eligible.
- Full build, Firestore Emulator, API integration, Cashfree sandbox, and production tests were not run.

## Safety
No refund amount policy, customer submission endpoint, lease timeout, or live payout behavior was changed. Live payouts remain disabled pending settlement implementation and required tests.
