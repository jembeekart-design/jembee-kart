# Teacher Referral and Paid Video Payment Ledger

## What is connected

`POST /api/admin/shorts/teacher-referral/reconcile` is an Admin/Super Admin-only, no-store endpoint. It reconciles a verified paid-video order against `shortsSettlementLedger`, includes platform-share refund reversals, subtracts only INR expense documents marked `verified` with a non-empty evidence reference in `shortsVerifiedExpenses`, and computes the Teacher Referral commission using the existing integer-paise 2% calculator.

It writes deterministic, idempotent ledger entries:

- `paidvideo_<orderId>_admin_net_profit`
- `paidvideo_<orderId>_teacher_referral`

It does not credit a wallet or initiate a payout. Firestore client access to the ledger, expense, and referral-attribution collections is explicitly denied; trusted server APIs use Firebase Admin SDK.

## Required records before reconciliation

1. `watchVideoPaymentOrders/<orderId>` must be a verified `paid` Shorts order and include `videoId`, `userId`, `creatorId`, `cfPaymentId`; `teacherUid` is optional and is the referred teacher.
2. `shortsSettlementLedger` must already contain the Cashfree-verified `platform_share` entry and any successful refund `platform_share_reversal` entries for the order.
3. Any platform costs must be recorded in `shortsVerifiedExpenses` with `orderId`, `currency: "INR"`, integer `amountPaise`, `status: "verified"`, and a durable `evidenceRef`. Expense evidence must be reviewed and verified by an authorized finance operator before this endpoint is run. Unverified/malformed costs fail closed.
4. If a Teacher referral applies, `teacherReferralAttributions/<teacherUid>` must contain `teacherUid`, `referrerUid`, and `status: "verified"`. The 2% commission is assigned to `referrerUid`, and is calculated on the reconciled Admin net profit, not gross price or the Platform share alone.

## Important deployment gates

- Current paid-video order creation/attribution must populate `teacherUid` when relevant. If it does not, the order gets no Teacher referral commission.
- No expense evidence ingestion/verification UI is implied by this endpoint. Finance evidence must be created and reviewed through a trusted process before reconciliation.
- Reconciliation is intentionally one-time/idempotent. Do not run it until provider refunds and all relevant costs have been reconciled. A later cost adjustment needs a separately audited adjustment entry; do not edit a posted ledger row.
- Creator, Sharer, Platform, and Teacher entries remain `pending_settlement`/`reconciled` ledger records only. Wallet credit, bank payout, Cashfree live activation, and production deployment remain disabled pending full sandbox, rules-emulator, TypeScript, and build verification.
