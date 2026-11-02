# Phase 70 — Refund Status Normalization Safety Patch

Date: 2026-11-01

## Finding
`normalizeRefundStatus()` in `src/app/api/admin/refund-requests/process/route.ts` treated every unrecognized Cashfree status as `refund_submitted` / `submitted`. This could incorrectly represent an unknown provider state as a known in-flight refund state.

## Changes
1. Unknown/blank provider statuses now normalize to:
   - request status: `refund_manual_review_required`
   - execution status: `unknown`
2. Unknown status does not count as terminal success or failure. The order reservation is therefore retained.
3. Provider refresh accepts the manual-review state so an administrator can refresh/reconcile it later.
4. Provider reconciliation includes local `unknown` execution states in its submitted/expected comparison set.
5. Admin UI shows `Manual Review Required` and exposes refresh/reconcile controls for this state.
6. Submission response explicitly explains that an unknown provider status requires manual review; it no longer tells the admin that the refund was submitted.
7. Audit action distinguishes unknown provider state as `cashfree_refund_manual_review_required`.

## Preserved behavior
- `SUCCESS` -> `refunded` / `success`.
- `PENDING`, `PENDING_APPROVAL`, `ONHOLD` -> `refund_submitted` / `submitted`.
- `CANCELLED`, `REJECTED` -> `refund_failed` / `failed`.
- Explicit terminal provider status alone can release the order reservation.
- A previously confirmed local success remains protected from stale non-success responses. A local failure is not reopened by unknown/pending responses.

## Validation
Static source assertions and ZIP integrity checks only. No TypeScript build, Firestore Emulator, Cashfree sandbox, concurrent processing test, or production deployment was run.

## Safety
No new customer refund endpoint, arbitrary retry, lease timeout, or payout switch was introduced. Live payouts remain disabled pending end-to-end settlement and refund tests.
