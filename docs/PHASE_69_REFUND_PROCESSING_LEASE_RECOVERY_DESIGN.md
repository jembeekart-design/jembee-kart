# Phase 69 — Refund Processing Lease and Recovery Design

Date: 2026-11-01

## Objective
Define a safe recovery protocol for `refund_processing` without introducing an arbitrary timeout or weakening Cashfree idempotency and order reservation protections.

## Existing verified behavior
- The processing endpoint accepts `approved_pending_refund`, `refund_retry_required`, and `refund_processing`.
- It reserves one active refund per order and checks the linked order, ownership, paid payment identifiers, and amount.
- Provider submission uses a deterministic idempotency reference.
- The provider response is committed only after re-reading the refund and order and verifying the reservation linkage.
- Ambiguous provider outcomes are not treated as a confirmed failure.
- Provider reconciliation is read-only and can surface mismatches for manual review.

## Proposed lease fields (design only; not deployed)
Store a lease on the refund request:
- `processingLease.ownerToken`: cryptographically random per-attempt token generated server-side.
- `processingLease.acquiredAt`: server timestamp.
- `processingLease.expiresAt`: server timestamp based on a centrally configured operational lease duration.
- `processingLease.attempt`: monotonically incremented integer.
- `processingLease.idempotencyKey`: the same deterministic provider idempotency reference used for the refund.

Do not expose the owner token to clients or logs. Do not accept a lease token, expiry, attempt counter, provider refund ID, or amount from the browser.

## Safe acquisition protocol
1. In one Firestore transaction, read refund and order.
2. Verify the refund is in an allowed state, linked order ID matches, customer ownership matches, stored paid amount and currency are valid, and no conflicting active reservation exists.
3. If a non-expired lease exists, reject the competing attempt without calling Cashfree.
4. If an expired lease exists, do not assume the provider did nothing. Mark the attempt as `reconciliation_required` and require a provider lookup using the same idempotency reference before any resubmission.
5. Otherwise acquire a new lease and create/confirm the order reservation atomically.
6. Only the holder of the current lease token may commit the provider response or release the reservation.

## Recovery protocol
- A process crash or timeout after provider submission is an ambiguous outcome.
- First query Cashfree by the same provider refund reference / idempotency key.
- If the provider confirms a refund, commit its status and identifiers transactionally.
- If provider confirms a terminal failure, record failure and release the reservation transactionally.
- If provider reports pending, unknown, malformed, or unavailable, retain reservation and lease/reconciliation hold; do not retry a new provider operation.
- Resubmit only when provider evidence proves no refund was created and the same deterministic idempotency key is reused.
- If provider lookup cannot reliably establish absence, route to manual review.

## Audit requirements
Each acquisition, contention rejection, expiry detection, reconciliation result, commit, and release should write an append-only audit event containing request ID, order ID, attempt number, action, actor/system identity, timestamp, and a safe reason code. Never store secrets or full payment credentials.

## Required tests before implementation
- Two concurrent admins: only one lease acquisition succeeds.
- Lease expires after provider accepted request: reconciliation finds same refund; no duplicate submission.
- Lease expires before provider accepted request: provider lookup proves absence; same idempotency key permits safe retry.
- Stale worker response after a newer lease: stale token cannot commit or release.
- Provider timeout, 5xx, malformed list, unknown status: reservation remains held.
- Confirmed terminal success/failure: refund/order/audit update atomically and reservation is released only under the verified terminal policy.
- Ownership mismatch, amount mismatch, currency mismatch, payment ID mismatch: no provider call.
- Firestore transaction retry: no duplicate audit event or lease attempt increment beyond committed transaction semantics.

## Open operational decisions
The lease duration, reconciliation polling cadence, maximum automatic retry count, and manual-review SLA must be set from measured Cashfree latency and operational staffing. They are deliberately not guessed here.

## Safety decision
This phase adds documentation only. No lease fields, expiry, retries, or state transitions are deployed. No arbitrary timeout is introduced. Live refunds/payouts remain disabled pending implementation and tests.

## Validation
Documentation-only phase. No TypeScript build, Firestore Emulator, concurrency test, Cashfree sandbox test, or production deployment was run.
