# Phase 32 — Settlement ledger repository & transaction safety

Date: 2026-11-13  
Scope: source-derived pure contracts and static transaction review. No Firebase emulator, credentials, or production export was available.

## What was implemented

`src/modules/learning/settlement-ledger-repository-contracts.ts` defines a pure validation/planning boundary for the currently observed `shortsSettlementLedger` paid-video shape:

- Retains `orderId`, `videoId`, `entryType`, `beneficiaryUid`, `amountPaise`, and `currency: INR`; does not replace these with Phase 30's proposed generic schema.
- Recognizes the ten entry types observed in the inspected routes: `creator_share`, `sharer_share`, `sharer_share_unallocated`, `platform_share`, their three reversal types, `teacher_referral_commission`, `teacher_referral_commission_adjustment`, and `admin_net_profit`.
- Enforces integer safe paise amounts and entry-specific sign/beneficiary constraints.
- Provides deterministic paid-video document ID helpers and create-only idempotency planning. Existing IDs are skipped; duplicate IDs in one proposed batch fail closed.
- Expresses an append-compensation correction policy rather than mutating/deleting historic share rows.

## Transaction review findings

Inspected:
- `src/app/api/payments/cashfree/webhook/route.ts`
- `src/app/api/shorts/paid-video/verify/route.ts`
- `src/app/api/admin/shorts/paid-video-refunds/reconcile/route.ts`
- `src/app/api/admin/shorts/teacher-referral/reconcile/route.ts`

The Cashfree webhook and paid-video verification use deterministic creator/sharer/platform IDs and create missing rows in a transaction. Refund reconciliation uses cumulative-refund suffix IDs and negative reversal rows. Teacher referral reconciliation uses separate admin-net-profit and commission rows, and appends adjustment rows when the commission changes; it also updates the current summary commission/net-profit documents. These differences mean a single generic writer cannot safely replace all existing route logic without a carefully staged integration.

## Explicit limitations / safety

- This phase does **not** implement a Firestore repository or call `runTransaction`; it provides a pure, testable contract and create-plan only.
- No payment, refund, entitlement, webhook, referral, settlement or earnings route was modified or rewired.
- No live Firestore records were read or changed; transaction concurrency behavior and provider replay behavior were not integration-tested.
- No collection/rules/index changes, migrations, backfills, payouts or transfers.
- Paid-video and live payout gates remain closed pending end-to-end verification and explicit approval.

## Required before production repository integration

1. Run Firebase Emulator integration tests for concurrent webhook retries, duplicate payment IDs, partial refund increments, refund replay, teacher commission adjustments, and transaction contention.
2. Verify all entry type strings and deterministic ID formats against production-safe redacted samples and all external writers.
3. Define whether mutable teacher commission/net-profit rows are summary projections while adjustment rows are immutable audit history; reconcile that model with accounting requirements.
4. Add a transactional repository only after route-by-route migration design, rollback plan, emulator coverage and explicit approval.
5. Keep Monetag USD earnings separate from INR paid-video settlement until provider reconciliation and a signed mapping exist.

**Phase 32 is a source-level contract milestone, not production settlement readiness.**
