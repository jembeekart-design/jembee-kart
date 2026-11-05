# Financial settlement remediation — implementation gate

## Current verified behavior

- `src/lib/mlm/orders/completeOrderAndDistributeCommission.ts` is an intentionally disabled legacy entry point.
- `src/lib/mlm/distributeLevelCommission.ts` is intentionally disabled.
- `src/lib/mlm/creditWallet.ts` always returns `SERVER_SETTLEMENT_REQUIRED`.
- `src/lib/mlm/financial/processCashback.ts` delegates to the disabled `creditWallet`, so it does not credit a wallet.
- `src/app/api/admin/orders/status/route.ts` marks an order delivered but sets
  `financialProcessingStatus=pending`, `commissionProcessed=false`, and
  `commissionDistributed=false`.
- `src/lib/mlm/adminCreditWallet.ts` is a transactional, idempotent wallet-credit primitive. It is not, by itself, an authorization or settlement policy.

## Confirmed business policy and remaining payout gates

- MLM commission is based on verified actual order profit.
- Cashback is based on the customer's actual paid amount.
- These basis decisions do not authorize enabling live payouts. Rates, eligibility, rounding, reversals, referral-chain integrity, idempotency, concurrency, and operations still require implementation and tests.

## Do not enable payouts until these remaining policy decisions are explicit

1. **Commission basis — DECIDED:** verified actual order profit. The settlement engine must derive profit from trusted server-side order/product cost and eligible deductions; never accept a client-supplied profit amount.
2. **Cashback basis — DECIDED:** customer's actual paid amount. Define eligible payment components and paise rounding explicitly; exclude unpaid balance and refunded/charged-back amounts.
3. Referral chain: authoritative `sponsorId` source, maximum levels, missing sponsor behavior, cycle detection, self-referral handling.
4. Eligibility: paid status, delivered status, returns window, cancellations, chargebacks, blocked users, KYC and package requirements.
5. Commission rates: whether level rates are percentages of profit or fixed pool allocations; how total allocations are capped.
6. Revenue split: creator, affiliate, sharer, uploader, platform and protection-fund allocations; source of verified revenue.
7. Reversals: how refunds, returns and chargebacks reverse prior credits without deleting ledger history.
8. Idempotency: deterministic event IDs per order + earning category + beneficiary + level.
9. Concurrency: all balance changes, ledger creation, settlement status and outbox/event state must commit atomically.
10. Operations: retry policy, dead-letter/manual-review queue, admin approval policy and immutable audit trail.

## Required server-side settlement design

- Accept only a verified order ID; never accept beneficiary, amount, commission rate or wallet field from the client.
- Read the order, payment state, product/order snapshots and business rules using Admin SDK.
- Resolve sponsor ancestry server-side with cycle detection and a bounded maximum depth.
- Compute amounts in integer paise; reject non-finite, negative, over-cap or inconsistent allocations.
- Create deterministic settlement events and wallet ledger entries in one Firestore transaction (or a durable outbox + idempotent worker if transaction limits require batching).
- Use `adminCreditWallet` only after policy validation; its event ID must uniquely identify the earning event and beneficiary.
- Mark the order settled only after every required beneficiary ledger entry has been committed.
- On partial failure, preserve pending/review state and retry idempotently. Never mark success merely because a delivery status changed.
- Refunds and chargebacks must create compensating debit/reversal entries; never mutate or delete historical credit records.

## Minimum acceptance tests

- Same order delivered twice creates no duplicate credit.
- Two concurrent settlement attempts create one credit per beneficiary/event.
- Payment pending, failed or unverified orders cannot settle.
- Cancelled, returned, refunded and chargeback orders cannot create new credits.
- Sponsor cycle, self-referral, missing sponsor and excessive chain depth fail safely.
- Amount rounding and allocation caps are correct at 1 paise boundaries.
- Failure after one beneficiary is processed can safely resume without duplicate credits.
- Feature disabled means no settlement; feature enabled without valid policy/configuration still fails closed.
- Every wallet balance delta has a matching immutable ledger entry.
- Reconciliation can identify missing, duplicated, reversed and unclassified entries.

## Release status

Settlement remains intentionally disabled. This document is a safety gate, not an implementation or proof of production readiness. Do not turn on `commissionDistributedEnabled` or route deliveries into automatic payout until the above decisions and tests are completed.
