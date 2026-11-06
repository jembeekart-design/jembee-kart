# Phase 49 — Rank reward and settlement release-gate audit

## Confirmed business policy
- MLM commission basis: verified actual order profit.
- Cashback basis: customer's actual paid amount.
- Live payouts remain disabled until trusted implementation and tests pass.

## Source findings

### F49-01 — Fallback feature flag was permissive
**Severity: High (safe-default issue).**
- `src/firestore/businessRules/defaults.ts` previously set `featureFlags.commissionDistributedEnabled` to `true`.
- This file explicitly says defaults are used only when Firestore data is unavailable.
- A true fallback is unsafe while the order settlement pipeline is not implemented.
**Change made:** changed the fallback default to `false` and added a fail-closed comment.
**Limit:** this changes only the source fallback. It does not update or prove the value stored in production Firestore.

### F49-02 — Delivery transition deliberately does not settle money
**Severity: Release gate.**
- `src/app/api/admin/orders/status/route.ts` marks delivered orders with `financialProcessingStatus: "pending"`, `commissionProcessed: false`, and `commissionDistributed: false`.
- Delivery is not treated as proof that commission/cashback has been calculated or credited.
**Disposition:** keep this guard.

### F49-03 — Wallet credit primitive is not a settlement engine
**Severity: High if misused.**
- `src/lib/mlm/adminCreditWallet.ts` performs an idempotent wallet credit inside a caller-supplied Admin transaction.
- It validates UID, amount, event ID, wallet category, and conflicting event reuse.
- It does not calculate order profit, cashback eligibility, upline commissions, reversals, or refund/clawback logic.
**Disposition:** retain as a low-level primitive only; do not call it directly from delivery status without a policy-aware settlement service.

### F49-04 — Legacy rank helper writes wallet balances from client SDK
**Severity: High if reactivated; dormant in inspected source.**
- `src/lib/mlm/updateRank.ts` uses a client Firestore transaction and increments `commissionWallet`, `walletBalance`, `totalIncome`, and `todayIncome`.
- No static caller of `updateRank(...)` was found in `src`.
- Current Firestore rules deny client updates to `/users/{uid}`.
**Disposition:** do not activate. Rank bonuses, if retained as a product feature, need a separate trusted server settlement path and ledger event type with an explicit funding source. Rank bonuses are not MLM order commission and must not be funded from order profit implicitly.

### F49-05 — Rank evaluator has no active caller found
- `src/lib/mlm/orders/checkRankUpgrade.ts` evaluates `teamSize`, `directReferrals`, business, and sales thresholds.
- No static caller was found in `src`.
- Its existence does not establish that rank upgrades or rank rewards are currently active.

## Required settlement design before implementation
1. Load order and payment state from trusted Firestore documents; ignore client-supplied amount/profit.
2. Require delivered status, successful payment (or verified COD collection), no cancellation, and no pending/partial refund.
3. Calculate actual paid amount from settled payment records, net of refunds/chargebacks.
4. Calculate actual order profit from trusted captured revenue minus recorded product cost and explicitly approved deductions. Define treatment of shipping, tax, discounts, payment fees, and platform-funded coupons before coding.
5. Calculate MLM commission from eligible actual profit only; validate each upline against a cycle-free, depth-bounded ancestry chain.
6. Calculate cashback from actual paid amount only; define whether shipping/tax are included and define paise rounding.
7. Use deterministic ledger IDs per order, recipient, and income category; credit wallet and create ledger atomically.
8. Store a settlement snapshot on the order, including basis, input amounts, rate, formula version, and result.
9. Make retries idempotent; conflicting reuse of event IDs must fail.
10. On refund/chargeback after settlement, create compensating debit/reversal ledger events; never edit/delete old ledger entries.
11. Reconcile order settlement snapshots against wallet ledger totals before enabling payouts.
12. Keep manual approval and payout delay rules separate from earning calculation.

## Remaining business decisions before code
- Profit formula and included deductions (COGS source, shipping, tax, payment fee, discount/coupon funding).
- MLM rate table and whether rates apply to each eligible upline's profit share or a single shared profit pool.
- Cashback percentage and cap.
- Cashback paid-amount inclusions (shipping/tax) and rounding.
- COD verification event and when COD is considered collected.
- Refund/partial refund/chargeback reversal formula and negative wallet handling.
- Whether rank bonuses exist, their funding source, and their own approval/idempotency policy.

## Verification limits
Source-only review and static text verification. No TypeScript build, emulator, payment provider sandbox, production Firestore settings, or payout integration test was run.
