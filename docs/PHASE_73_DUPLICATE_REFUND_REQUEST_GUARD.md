# Phase 73 — Duplicate Refund Request Detection and Processing Guard

Date: 2026-11-02

## Finding
The order reservation prevents two refund requests from simultaneously owning the same order once one processing transaction acquires the lock. However, multiple local `refund_requests` documents can still exist for the same order before processing. Reconciliation previously showed the local request count but did not explicitly flag duplicate local requests or duplicate local refund references.

## Changes
File: `src/app/api/admin/refund-requests/process/route.ts`
- Reconciliation now detects more than one local refund request for the same order.
- Reconciliation detects duplicate deterministic/stored local refund IDs.
- Either condition forces `manualReviewRequired`.
- During provider processing, a Firestore transaction queries refund requests for the same order and blocks processing if another non-terminal request exists.
- The current request is excluded from its own duplicate check.
- Terminal `refunded`, `refund_failed`, and `Rejected` records are not treated as active competitors. Historical duplicates are still surfaced by reconciliation and require review before the order is treated as clean.

File: `src/app/admin/refund-requests/page.tsx`
- Displays duplicate local request count and duplicate local refund ID count.
- Shows duplicate local refund IDs in reconciliation detail.

## Safety notes
- Existing per-order `refundRequestId` reservation remains in place.
- No automatic deletion/merging of duplicate records was attempted.
- No sequential partial-refund policy was inferred. Multiple local requests for one order are flagged for manual review, even if they may be historical.
- This phase does not add a customer-side refund request endpoint.

## Validation
Static assertions and ZIP integrity only. Firestore transaction query behavior, concurrent admin processing, emulator, TypeScript build, and Cashfree sandbox were not run.

## Operational limitation
The transaction query adds a per-order collection query during processing. Before production rollout, verify Firestore query support/index behavior and load/performance in the Emulator and staging environment.
