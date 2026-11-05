# Phase 47 — Referral tree integrity audit

## Scope
Reviewed the registration route, signup client, referral helper, dormant MLM auto-join helper, Firestore rules, and GitHub AutoFix workflow.

## Verified active registration path
- `src/app/signup/page.tsx` captures a referral code from `?ref=` into `localStorage` and sends it as `sponsorCode` to `/api/auth/create-profile`.
- `src/app/api/auth/create-profile/route.ts` verifies the Firebase ID token with revocation checking, resolves the sponsor by `shareCode` on the server (not by accepting a client UID), rejects ambiguous/missing/self referrals and blocked sponsors, and creates the user profile with Admin SDK.
- The API reads sponsor ancestry documents before writes and fails with `REFERRAL_TREE_INCONSISTENT` if an ancestor document is missing.
- User profile creation and sponsor/upline counter updates are performed in one Firestore transaction.
- `firestore.rules` denies client create/update/delete on `/users/{uid}`, so the privileged profile mutation path is server-side.

## Findings

### F47-01 — Dormant client-side referral tree helper
**Severity: Medium (legacy-risk; not confirmed active).**
- `src/lib/mlm/updateReferralTree.ts` uses client Firestore SDK transactions to increment sponsor counters.
- It validates non-empty IDs and direct self-referral, but does not validate UID format, verify that `newUserId` is an actual newly-created user, check sponsor ownership/authority, detect an existing cycle, or use a deterministic idempotency event.
- It traverses sponsor ancestry from mutable user documents and can increment counters repeatedly if called more than once.
- The only source caller found is `src/lib/mlm/orders/autoJoinMLMOnPurchase.ts`.
- No external caller of `autoJoinMLMOnPurchase` was found under `src`.
- Current Firestore rules deny client updates to user documents, so this helper's direct counter writes should be rejected for ordinary clients. Do not loosen rules to make it work.
**Disposition:** leave disabled/dormant; do not wire it into signup or purchase activation. Replace with a trusted server-side, idempotent operation only if a verified business requirement exists.

### F47-02 — Active registration ancestry trusts stored `parentChain`
**Severity: Medium (integrity hardening).**
- `src/app/api/auth/create-profile/route.ts` builds the new user's ancestry from the selected sponsor's stored `parentChain`.
- It filters malformed non-string/empty entries and excludes the new UID, deduplicates entries, bounds the chain to 10, and verifies that each resulting ancestor document exists.
- This is materially safer than accepting a client-supplied sponsor UID, but it does not explicitly verify that the stored chain is acyclic, that each ancestor's own chain is consistent, or that the chain agrees with each ancestor's `sponsorId`.
- A malformed/cyclic legacy `parentChain` can therefore be propagated into a new profile and affect upline counters.
**Disposition:** do not change live registration behavior without a migration/repair strategy. Add a server-side ancestry validator and a dry-run audit of existing parentChain records before enforcing stricter rejection.

### F47-03 — Referral level counters are not fully maintained by registration
**Severity: Medium (reporting/business-rule consistency).**
- Registration initializes `level1Count` through `level4Count` to zero.
- The sponsor receives increments for `totalReferrals`, `directReferrals`, and `level1Count`.
- Each upline receives `teamSize` increment, but the shown registration transaction does not increment `level2Count`, `level3Count`, or `level4Count` on the respective ancestors.
- Reports or rank rules relying on those level counters may undercount unless another verified server workflow maintains them.
**Disposition:** audit all consumers of level counters and compare with historical user records before designing a backfill. Do not patch counters speculatively.

## AutoFix workflow verification
`.github/workflows/business-rule-autofix.yml` has a job-level `if: ${{ false }}` and read-only permissions (`contents: read`, `pull-requests: read`, `actions: read`). It is disabled in the checked source. Keep it disabled until the AST transformation engine is redesigned, reviewed, and tested in a disposable branch.

## Recommended next actions
1. Build a read-only report for missing, duplicate, cyclic, over-depth, and sponsorId/parentChain-inconsistent ancestry.
2. Verify every consumer of `level1Count`–`level4Count`, `teamSize`, and `totalReferrals`.
3. Implement a server-only ancestry validator with a documented maximum depth and explicit cycle rejection.
4. Make counter updates idempotent using a registration/referral event key.
5. Keep client writes to `/users/{uid}` denied.

## Verification limits
This phase is source inspection only. No production Firestore data, Firebase Emulator, deployed API, concurrent registration, or integration tests were run. Findings about malformed historical ancestry require a read-only production-data audit to confirm prevalence.
