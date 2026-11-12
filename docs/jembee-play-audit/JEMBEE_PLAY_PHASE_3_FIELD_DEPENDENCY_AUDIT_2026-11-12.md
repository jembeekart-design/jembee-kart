# JEMBEE PLAY — Phase 3 Field Dependency Audit
**Date:** 2026-11-12
**Source:** `JEMBEE_PLAY_FULL_SOURCE_2026-11-12.zip` (uploaded 20 MB archive)
**Scope:** Static source inspection only. No source, Firebase data, configuration, or payout settings were modified.

## 1. Important correction
The earlier preliminary map was too broad in describing `walletBalance` as a field that should simply be preserved or removed after a general wallet audit. The source shows that `walletBalance` currently has multiple, overlapping video-platform meanings:
- creator revenue credit (`createCreatorRevenueShare.ts`);
- sponsor video-budget balance check (`checkSponsorBudget.ts`);
- sponsor video-budget deduction (`deductSponsorVideoBudget.ts`);
- value displayed as “Coins” in the Reward Center (`src/app/videos/reward-center/page.tsx`).

This mixed semantic use is a correctness and accounting risk. Do **not** delete or rename this field until the intended ledger model and existing Firestore data are reconciled.

## 2. Exact source references

| Field | Source reference | Observed behavior | Assessment |
|---|---|---|---|
| `commissionWallet` | `src/lib/security/profileFactory.ts:35` | Initialized to 0 in client-side profile factory | No additional source reads/writes found in `src/` |
| `commissionWallet` | `src/app/api/auth/create-profile/route.ts:113` | Initialized to 0 in server profile creation | No additional source reads/writes found in `src/` |
| `walletBalance` | `src/lib/security/profileFactory.ts:34` | Initialized to 0 | Shared field; ambiguous semantics |
| `walletBalance` | `src/app/api/auth/create-profile/route.ts:112` | Initialized to 0 | Shared field; ambiguous semantics |
| `walletBalance` | `src/lib/videos/watch-earn/checkSponsorBudget.ts:50-54` | Read as sponsor available balance | Sponsor-budget path |
| `walletBalance` | `src/lib/videos/watch-earn/createCreatorRevenueShare.ts:39` | Incremented when creator revenue is credited | Creator-revenue path |
| `walletBalance` | `src/lib/videos/watch-earn/deductSponsorVideoBudget.ts:31` | Decremented for sponsor video spend | Sponsor-budget path |
| `walletBalance` | `src/app/videos/reward-center/page.tsx:18,23` | Read and rendered as “Coins” | UI label may not match underlying money semantics |
| `rewardWallet` | `src/lib/security/profileFactory.ts:36` | Initialized to 0 | No additional source reads/writes found in `src/` |
| `rewardWallet` | `src/app/api/auth/create-profile/route.ts:114` | Initialized to 0 | No additional source reads/writes found in `src/` |
| `kycStatus` | `src/lib/security/profileFactory.ts:32` | Initialized to `pending` | Profile initialization only in inspected `src/` references |
| `kycStatus` | `src/app/api/auth/create-profile/route.ts:122` | Initialized to `pending` | Profile initialization only in inspected `src/` references |
| `kycSubmittedAt` | `src/app/api/auth/create-profile/route.ts:123` | Initialized to null | No further `src/` references found |
| `kycApprovedAt` | `src/app/api/auth/create-profile/route.ts:124` | Initialized to null | No further `src/` references found |
| `pendingWithdrawal` | `src/lib/security/profileFactory.ts:40` | Initialized to 0 | No further `src/` references found |
| `pendingWithdrawal` | `src/app/api/auth/create-profile/route.ts:118` | Initialized to 0 | No further `src/` references found |
| `totalIncome` | both profile creation paths | Initialized to 0 | Also incremented by creator revenue share helper |
| `totalWithdraw` | both profile creation paths | Initialized to 0 | No further `src/` references found in inspected source |
| `walletLocked` | both profile creation paths | Initialized to false | No further `src/` references found in inspected source |

## 3. Findings and risk classification

### A. `commissionWallet`
- Current source evidence: two initialization-only references.
- No source read/write usage found under `src/` in this archive.
- Candidate for removal from **new profile defaults only**, but do not remove until Firestore security rules, admin scripts, Cloud Functions, exports, and legacy data consumers have also been checked.
- Do not bulk-delete the field from existing user documents.

### B. `rewardWallet`
- Current source evidence: two initialization-only references.
- Reward Center reads `walletBalance`, not `rewardWallet`.
- This suggests schema drift or unfinished reward implementation. It is not safe to infer that reward functionality can be removed.
- Keep until the Reward Center specification and any external consumers are resolved.

### C. `walletBalance`
- Active source reads and writes exist.
- Creator income and sponsor ad/video spend share the same field.
- Reward Center presents it as “Coins”.
- This must be separated conceptually and, eventually, technically into distinct ledger-backed balances (e.g. creator payable balance, sponsor prepaid budget, and non-cash reward points) only after inspecting all settlement and Firestore rules.
- Do not run a find-and-replace rename or delete this field.

### D. KYC and withdrawal fields
- The inspected application source only initializes these fields; no matching read/write path was found in `src/`.
- They may be remnants, or may be consumed by admin tooling, Firestore rules, external functions, or future payout flows.
- Retain until all external consumers and approved payout requirements are checked.

## 4. Video business logic that must remain separate from removed commerce/MLM
The following are not shopping/MLM and must remain in the JEMBEE PLAY scope:
- paid-video checkout, Cashfree payment verification, refund and reversal reconciliation;
- creator/sharer/platform ad-revenue allocation;
- video-share attribution and verified expense evidence;
- teacher referral based on verified platform net profit;
- sponsor-funded video promotion, subject to safe budget/ledger implementation.

## 5. Required next inspections before any patch
1. Inspect `firestore.rules`, Firestore indexes, Firebase Functions, `functions/`, `src/firestore/`, scripts, admin routes and any scheduled jobs for these field names.
2. Inspect every ledger/settlement collection and establish authoritative source-of-truth for creator revenue and sponsor budget.
3. Inspect Reward Center requirements: decide whether “Coins” are cash-equivalent earnings or non-cash reward points.
4. Check production Firestore schema using a read-only export or admin-approved sample; do not expose personal data.
5. Add tests for profile creation, sponsor budget reservation/deduction, creator credit idempotency, refund reversals, and ledger reconciliation.
6. Only then propose a minimal, reversible patch with migration/rollback plan.

## 6. Safety status
- No files deleted.
- No code changed.
- No Firebase records changed.
- No payout or payment settings changed.
- No commit, push, merge, or deployment performed.

**Phase 3 status:** Dependency inspection in progress. Safe deletion is not yet authorized by technical evidence. The next action is external-consumer and ledger/rules inspection, not deletion.
