# Phase 62 — Terminal refund reservation release

## Problem
A provider refund that reached a confirmed terminal SUCCESS or FAILED state could leave the order's single-active-refund reservation fields populated. This could block a later, separately requested partial refund even though the prior provider refund was terminal.

## Change
- The provider status refresh transaction now releases the order reservation only when the committed execution state is explicitly `success` or `failed`.
- Release is conditional on the order still being reserved by the same refund request and the reservation being active.
- The lock owner and reserved amount fields are deleted atomically with the refund/order status update; `refundReservationStatus` becomes `released` and a release timestamp is recorded.
- Audit event records whether the reservation was released.
- Pending, on-hold, and unknown provider states retain the reservation.
- Existing provider refund ledger aggregation remains the cap guard before a subsequent refund submission; malformed/incomplete provider refund lists fail closed.

## Important boundaries
- This does not create a new local immutable financial ledger. Cashfree's provider refund list remains the aggregate source for already submitted refunds, and a missing/incomplete provider list blocks further processing.
- Sequential partial refunds become possible only after an explicit terminal provider status and successful refresh. A failed refund must be reviewed before a new request is approved.
- No lock is released on timeout, network error, unknown status, or merely local admin rejection.
- COD/manual refunds remain outside this automatic Cashfree path.

## Validation
Static source assertions and ZIP integrity only. No full TypeScript build, Firestore Emulator, concurrency integration, Cashfree sandbox, or production verification was run.
