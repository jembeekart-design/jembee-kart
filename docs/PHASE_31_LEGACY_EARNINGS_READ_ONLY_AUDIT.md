# Phase 31 — Legacy earnings data audit and read-only mapping
Date: 2026-11-13
Scope: static source inspection only. No Firebase credentials/emulator or production data export was available.

## Critical correction to Phase 30
Phase 30 called `shortsSettlementLedger` a proposed collection and said no source integration existed. Static inspection disproves that statement: the repository already writes and reads `shortsSettlementLedger` in Cashfree webhook, paid-video verification, refund reconciliation and teacher-referral reconciliation routes. It is an active code-level settlement ledger, not a blank proposed collection. The Phase 30 document's schema-v1 shape is therefore a future normalization proposal only; it is NOT the live field schema and must not be deployed over the existing records.

## Observed collection map

| Collection | Observed purpose in source | Important observed fields / behavior | Classification |
|---|---|---|---|
| `shortsSettlementLedger` | Paid-video settlement entries and reversals | `orderId`, `videoId`, `buyerUid`, `cfPaymentId`, `entryType`, `beneficiaryUid`, `amountPaise`, `currency`, `source`, `status`; teacher net profit/commission rows use additional fields | Retain and reconcile; active |
| `watchVideoPaymentOrders` | Cashfree order record | `userId`, `videoId`, `creatorId`, `teacherUid`, `amountPaise`, `amount`, `currency`, `status`, `cashfreeOrderId`, `cfPaymentId`, share attribution | Retain as payment source |
| `watchVideoPurchases` | Paid-video entitlement | `videoId`, `userId`, `orderId`, `amount`, `currency`, `status`, `cfPaymentId`, `accessRevoked` | Retain as entitlement source |
| `watchVideoPaymentEvents` | Payment event idempotency | `orderId`, `videoId`, `userId`, `cfPaymentId`, `amount`, `currency` | Retain as provider event source |
| `shortsVerifiedExpenses` | Verified costs for net profit | `orderId`, `invoiceNumber`, `evidencePath`, `evidenceRef`, `amountPaise`, `currency`, `status`, verifier metadata | Retain as cost evidence |
| `teacherReferralAttributions` | Verified teacher/referrer relation | `teacherUid`, `referrerUid`, `status` | Retain as attribution source |
| `monetagRevenueImports` | Admin-imported external ad revenue | `externalRecordId`, `period`, `grossRevenueUsd`, uploader/sharer allocations, platform retained, status | Separate legacy domain |
| `monetagEarnings` | External ad earnings rows | `userId`, `role` uploader/sharer, `externalRecordId`, `amountUsd`, `currency: USD`, `status: confirmed` | Separate legacy domain |
| `monetagPayments` | Admin-entered payment history | `userId`, `transactionReference`, `amountUsd`, `currency: USD`, `status`, `recordedBy`; route states it does not transfer money | Separate legacy domain |
| `monetagShareAttributions` | Admin dashboard attribution data | queried by createdAt; complete writer/shape not established in this audit | Separate legacy domain |
| `creatorAdEarnings` | Older creator earnings read | profile endpoint queries `creatorId`, `status: AVAILABLE`, sums `creatorAmount` | Unverified legacy; no writer located in scanned source |

## Key findings / mismatches
1. The active `shortsSettlementLedger` does not match Phase 30's proposed generic schema (`schemaVersion`, `ownerUid`, `earningType`, `amountMinor`, `verified`, `reconciled`). Current code uses paid-video-specific fields and paise amounts, with several `entryType` variants, including creator/sharer/platform shares, reversals, admin net profit and teacher referral commission/adjustments.
2. Existing ad revenue path is separate: `monetagRevenueImports` and `monetagEarnings` use USD decimal fields and uploader/sharer naming, not the 30/20/50 paise ledger schema. The current admin import computes uploader/sharer shares from gross imported USD; this is not automatically proof of provider reconciliation or final settlement eligibility.
3. `monetagPayments` is an admin-entered history record. The route explicitly says it does not transfer money. It must not be treated as proof of a bank payout without external evidence.
4. `creatorAdEarnings` has a profile read path and a Firestore composite index, but no writer was located in the scanned source. Treat as unknown legacy until full repo/production audit.
5. Paid-video order, payment-event, entitlement, expense evidence and teacher referral attribution collections are different accounting domains. Do not merge them into earnings rows.
6. Existing Firestore rules deny client reads/writes to settlement, orders, purchases, payment events, expenses, referral attribution and creator ad earnings. This audit did not modify rules or indexes.

## Audit limitations
- This is a static source-code reference audit, not a live Firestore inventory. It cannot prove actual production documents, data quality, completeness, active scheduled functions, external integrations, backups or provider reconciliation.
- Search scope was the supplied source tree. No Firebase service credentials or emulator were available.
- Source references can miss dynamic collection names, Cloud Functions in other repositories, console-created jobs, external writers and historic code.

## Safe next steps
1. Export metadata and document counts for each collection from the correct Firebase project (read-only, admin-approved).
2. Capture representative redacted field-shape samples and counts by status/currency/date; never include PII or payment secrets in audit artifacts.
3. Trace every writer, trigger, importer, reader and index, including external Cloud Functions and scheduled jobs.
4. Reconcile Cashfree provider events/refunds against paid orders and ledger entries; reconcile Monetag provider statements against imports and manual payment records.
5. Only after a signed mapping and verified backup, propose versioned migration with dry-run, discrepancy report and rollback. No renames/deletes/backfills in this phase.

**No production database was queried or changed. No collection was created, renamed, deleted, migrated or backfilled.**
