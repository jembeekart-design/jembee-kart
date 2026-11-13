# JEMBEE PLAY — Phase 27 status

## Teacher Earnings, Course Revenue & Settlement Ledger

Added pure contracts for verified/reconciled eligible ad-revenue allocation (Creator 30%, Sharer 20%, Platform 50% after deductions), 2% teacher referral on actual verified platform net profit from eligible paid courses, idempotent append rules, compensating reversal eligibility, and fail-closed payout readiness.

Added eight focused tests in `src/modules/learning/__tests__/revenue-ledger-contracts.test.mjs`.

Full `.mjs` test suite: **225 passed, 0 failed** using Node `--experimental-strip-types`.

Scope limits: no Firestore ledger, attribution pipeline, payment-provider reconciliation, tax computation, wallet, settlement job, payout provider, or live transfer. Keep live payouts disabled until end-to-end settlement persistence, reconciliation, idempotency, compliance, and tests are verified and explicit approval is obtained. Paid course activation remains subject to Phase 26 payment and playback verification. No production readiness is implied. TypeScript project build, lint, Firebase emulator, and production integration were not run as part of this phase.
