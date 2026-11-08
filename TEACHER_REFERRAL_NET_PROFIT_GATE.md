# Teacher referral commission — net-profit gate

The referral policy is 2% of the referring Sharer's teacher's **verified, refund-adjusted Admin net profit** for eligible paid-video sales.

`src/lib/server/teacherReferralCommission.mjs` is a pure, integer-paise calculator. It rejects invalid money values, fails closed when referral attribution is not verified, rejects conflicted/self attribution, and rounds down to paise.

## Important integration boundary

This calculator is deliberately **not wired to the paid-video payment verification route or wallet**. The current paid-video settlement records allocate Creator 30%, Sharer 20%, and Platform 50%, but the Platform share is not itself proof of Admin net profit. The current source does not yet provide a reconciled, per-order cost/fee/tax/refund-adjusted Admin net-profit record together with a verified teacher-referral mapping. Until both exist, no teacher referral ledger entry or wallet credit may be created.

Required before integration:

1. A server-controlled, auditable teacher referral mapping with effective date and verified referrer UID.
2. A per-order Admin net-profit record in paise, reconciled against provider fees, taxes, actual costs, and confirmed refunds/chargebacks.
3. An idempotent ledger entry keyed to source order and teacher UID, plus reversal entries for later refunds/chargebacks.
4. Reconciliation tests proving Creator/Sharer/Platform allocation and referral commission never exceed verified funds.

Run the calculator tests with `npm run test:teacher-referral-commission`.
