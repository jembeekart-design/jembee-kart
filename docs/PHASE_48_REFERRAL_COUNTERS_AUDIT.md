# Phase 48 — Referral counters and ancestry consumer audit

## Scope
Read-only source audit of referral counters, rank consumers, registration helper call sites, and Firestore rules.

## Verified active paths and consumer status

### Active signup route
- `src/app/signup/page.tsx` calls `/api/auth/create-profile`.
- `src/app/api/auth/create-profile/route.ts` is the active profile creation path found from the signup UI.
- This API writes the new profile and updates the direct sponsor (`totalReferrals`, `directReferrals`, `level1Count`) and each ancestor (`teamSize`) in one Admin SDK transaction.
- Firestore rules deny client create/update/delete on `/users/{uid}`.

### Legacy `registerUser` path is not wired
- `src/lib/mlm/registerUser.ts` uses client Firestore transactions and calls `updateUplineTree` and `updateSponsorCounters`.
- No caller of `registerUser(...)` was found under `src`.
- Since `/users/{uid}` updates are denied by `firestore.rules`, a client-side invocation would fail when it attempts to update sponsor/upline documents. Do not loosen rules to accommodate this dormant path.

### Rank and level-counter consumers
- `src/lib/mlm/orders/checkRankUpgrade.ts` evaluates `teamSize`, `directReferrals`, `teamBusiness`, and `personalBusiness`. It does not use `level1Count`–`level4Count`.
- No call site for `checkRankUpgrade(...)` was found under `src`.
- `src/lib/mlm/updateRank.ts` evaluates `teamSize` and writes rank bonus amounts directly to wallet fields and transaction documents using the client Firestore SDK. No call site for `updateRank(...)` was found under `src`. Firestore rules deny user profile writes, so this legacy client-side rank payout path is not compatible with current rules and must not be activated.
- `src/lib/mlm/orders/updateDirectReferrals.ts` increments `directReferrals` from client Firestore SDK; no caller was found under `src`.
- `level1Count`–`level4Count` have no active consumers found in `src`; only profile initialization and the direct-sponsor increment of `level1Count` were found in the active registration route.
- `teamSize` is displayed in `src/app/mlm/dashboard/page.tsx` and used by the dormant rank evaluators.
- `totalReferrals` is displayed in `src/app/affiliate/page.tsx` and aggregated in `src/app/admin/users/page.tsx`.

## Findings

### F48-01 — Multiple dormant registration / counter engines
**Severity: Medium (maintenance and accidental reactivation risk).**
`registerUser`, `updateReferralTree`, `updateUplineTree`, `updateSponsorCounters`, `updateDirectReferrals`, `checkRankUpgrade`, and `updateRank` form legacy client-side paths with no active caller found. Some attempt writes that current Firestore rules deny. Keep these paths unreferenced; consolidate or remove only after repository-wide import and deployment checks.

### F48-02 — `level2Count`–`level4Count` are not maintained by active signup
**Severity: Low (currently no consumer found) / Medium if later used for eligibility.**
Active signup increments only `level1Count` on the direct sponsor. It does not increment level2–level4 counters. No active consumer of these fields was found in `src`, so no current rank calculation impact is demonstrated. Do not use these fields for rank or payout eligibility until they are rebuilt from validated ancestry or maintained transactionally.

### F48-03 — Rank bonus helper contains client-side wallet mutation
**Severity: High if reactivated; dormant in inspected source.**
`src/lib/mlm/updateRank.ts` increments `commissionWallet`, `walletBalance`, `totalIncome`, and `todayIncome`, and writes transaction records from the client Firestore SDK. This conflicts with `firestore.rules` denying `/users/{uid}` updates. Do not wire this helper into a live rank workflow. Rank rewards must be moved to a trusted server endpoint and canonical idempotent ledger transaction before use.

### F48-04 — Rank evaluator uses counters that depend on registration consistency
**Severity: Medium if reactivated.**
`checkRankUpgrade` uses `teamSize` and `directReferrals`. `teamSize` is incremented for every stored ancestor in the active signup transaction, while `directReferrals` is incremented only for the direct sponsor. This is conceptually consistent, but historical ancestry corruption, duplicate registrations, or a malformed `parentChain` can still skew counts. The evaluator itself has no active caller found.

## Recommended safe next steps
1. Treat `/api/auth/create-profile` as the only active signup path unless deployment routing proves otherwise.
2. Run a read-only ancestry consistency audit against a Firestore export: cycles, duplicate IDs, self references, missing ancestor docs, sponsorId mismatch, chain-depth violations, and counter drift.
3. Rebuild level counters only if an approved feature needs them; do not infer level counts from potentially corrupt historical counters.
4. Retire or quarantine dormant client-side MLM registration/rank helpers after confirming no dynamic imports or external package entrypoints.
5. For rank rewards, use the trusted server-side ledger primitive, a deterministic event ID, transactionally checked eligibility, and profit-based commission policy; do not use client-side wallet writes.

## Verification limits
Source-only static inspection. No production Firestore export, emulator, deployed route tracing, browser runtime, or concurrent signup tests were performed. "No caller found" means no static caller in the inspected `src` tree; it does not prove that an external deployment, scheduled job, or out-of-repository script cannot invoke an exported function.
