# Canonical settlement ledger — Phase 30 design (NOT DEPLOYED)

Date: 2026-11-13
Status: schema proposal and pure validation contract only.

## Proposed canonical collection
`shortsSettlementLedger` is already referenced by live route code (Cashfree webhook, paid-video verification, refund reconciliation and teacher-referral reconciliation). The Phase 30 schema below is a proposed normalized target, NOT the current production/source field schema. Phase 31's static audit documents the actual observed field shapes. Existing Firestore rules deny all client reads/writes to this collection. Phase 30 did not change those rules.

## Version 1 record contract
| Field | Type | Meaning |
|---|---|---|
| schemaVersion | integer | `1` |
| entryId | safe string | Immutable idempotency identity; also document ID |
| ownerUid | safe string | Recipient UID, derived server-side |
| ownerRole | enum | creator / sharer / teacher |
| earningType | enum | ad_creator_share / ad_sharer_share / teacher_referral |
| sourceId | safe string | Verified source/reconciliation record reference |
| currency | ISO-like 3 uppercase letters | Currency grouping; no cross-currency addition |
| amountMinor | integer | Signed amount in minor units |
| status | enum | pending / eligible / settled / reversed |
| verified, reconciled | boolean | Trusted server-side evidence gates |
| createdAt, recordedAt | ISO timestamp | Source event time and ledger record time |
| reversalOf, reversedBy | optional safe string | Compensating-entry links |
| updatedAt | optional ISO timestamp | Mutable lifecycle metadata only |

## Accounting invariants
- Ad allocation is 30% creator, 20% sharer, 50% platform from verified eligible distributable ad revenue after refunds, chargebacks and provider fees.
- Teacher referral is 2% of actual verified platform net profit on eligible paid-course revenue.
- Integer minor units only. Never aggregate currencies together.
- `entryId` must be idempotent. Historical amount, owner, source, currency and earning type are immutable.
- Reversals use a new compensating record linked to the original; never rewrite a settled historical amount.
- `eligible` is not a payout authorization. Payout still requires independent compliance, recipient, reconciliation, provider, and explicit admin gates.

## Legacy collections — inventory only, no migration performed
Source inspection confirms references to `creatorAdEarnings`, `shortsSettlementLedger`, `teacherReferralAttributions`, `shortsVerifiedExpenses`, `monetagEarnings`, `monetagPayments`, `watchVideoPaymentOrders`, `watchVideoPurchases`, and `watchVideoPaymentEvents`. Their semantics, document fields, ownership guarantees, and reconciliation status are not proven by this code inspection. Do not merge, rename, delete, or backfill them based on names alone.

## Required before implementation/deployment
1. Export and inventory every legacy collection, field shape, writer, reader, trigger, scheduled job and external source.
2. Map each legacy row to a source-of-truth event; identify duplicates, reversals, currencies, fees, refunds and missing attribution.
3. Verify backups and restore procedure; run read-only dry-run with per-record reconciliation and exception report.
4. Obtain explicit owner approval and publish rollback plan.
5. Implement server-only transactional/idempotent repository, immutable append and compensating reversal, audit trail and indexes.
6. Emulator tests for concurrent duplicate writes, role isolation, pagination, reversals, replayed webhooks and access denial.
7. Keep client Firestore access denied. No live payouts until all gates are independently verified and explicitly approved.

No Firestore rules/indexes/schema were deployed or modified in this phase.
