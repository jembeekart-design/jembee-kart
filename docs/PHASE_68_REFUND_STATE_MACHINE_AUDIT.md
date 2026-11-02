# Phase 68 — Refund State Machine and Admin Audit Trail Review

Date: 2026-11-01

## Scope reviewed
- `src/app/api/admin/refund-requests/route.ts`
- `src/app/api/admin/refund-requests/process/route.ts`
- `src/app/admin/refund-requests/page.tsx`

## Verified state transitions

### Admin approval/rejection
The admin action endpoint performs a Firestore transaction and only accepts requests whose current status is `pending` or `requested` (case-normalized). Approval changes the request to `approved_pending_refund`; rejection changes it to `Rejected`. The same transaction creates a `refundRequestAuditLogs` entry with request ID, user ID when present, amount, action, admin ID, reason (for rejection), and server timestamp.

The response explicitly says approval does not transfer money. This is an approval state, not a provider refund.

### Provider processing
The processing endpoint only proceeds from `approved_pending_refund`, `refund_retry_required`, or `refund_processing`. It re-reads the refund and order inside the reservation transaction, checks ownership, amount, paid Cashfree order identifiers, and existing order reservation, then writes the processing state and order reservation together.

After the Cashfree response, it re-reads both records and verifies the ownership and reservation linkage before committing the provider result and an audit event. If the provider outcome is ambiguous, the code keeps/requires retry and the same deterministic idempotency reference is used.

### Provider refresh
Refresh only accepts submitted/refunded/failed local states with submitted/success/failed execution states. It fetches provider status, then transactionally re-reads and updates refund + order + audit. A local success is not downgraded by stale non-success provider data; a local failure is not reopened by non-success data. The per-order reservation is released only for explicit terminal success or failure.

## Findings and remaining risks

1. **No durable processing lease/expiry.** `refund_processing` is accepted as a processable state. This may be needed for recovery after a crashed worker, but without a lease token/expiry and recovery protocol, concurrent admin retries can enter the same processing path. The deterministic Cashfree idempotency key reduces duplicate provider effects, but it is not a substitute for a documented worker lease and operational recovery policy. No arbitrary timeout was introduced.
2. **Approval does not independently validate the linked order.** Approval records the admin decision based on the refund request record and amount. The provider processing endpoint performs the stronger linked-order, ownership, payment and amount checks before money movement. This is fail-closed for provider execution, but the UI could make the distinction between “approved” and “eligible for provider processing” clearer.
3. **Status vocabulary is mixed.** Request statuses include title-case `Rejected` alongside lowercase machine states. Consumers normalize some comparisons but UI labels/filters should be checked for consistent display and filtering. No mass migration was attempted.
4. **Audit trail is useful but not a complete immutable financial ledger.** Events are created for admin decisions, provider submission and provider refresh. The audit log does not by itself establish full historical completeness, provider settlement finality, or bank-credit confirmation.
5. **External provider call and Firestore transaction are not atomic.** A timeout after Cashfree accepts a request can leave an ambiguous local state. Same-reference idempotency and provider reconciliation remain necessary.

## Safety decision
No state-machine rewrite, lease timeout, legacy status migration, or customer refund endpoint was introduced because those require operational/business decisions and emulator/provider tests. No live payout or refund switch was enabled.

## Validation
Source inspection and report packaging only. No TypeScript build, Firestore Emulator, concurrent-request test, Cashfree sandbox test, or production deployment was run.
