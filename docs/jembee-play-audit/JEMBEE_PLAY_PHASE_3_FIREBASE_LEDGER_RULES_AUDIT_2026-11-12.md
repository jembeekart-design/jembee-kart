# JEMBEE PLAY — Phase 3 Firebase, Ledger & Rules Audit
**Date:** 2026-11-12
**Source:** Uploaded `JEMBEE_PLAY_FULL_SOURCE_2026-11-12.zip`
**Inspection:** Static source/config/rules inspection. No Firebase project was connected and no remote records were read or changed.

## Executive result
- `firestore.rules` and `storage.rules` are present and configured in `firebase.json`.
- No Firebase Cloud Functions deployment directory/source was found in the archive (`functions/` absent).
- Firestore rules deny client writes to user documents, payment orders/purchases/events, settlement ledger, verified expenses, teacher referral attributions, and creator ad earnings.
- The current profile wallet fields are not used as the authoritative paid-video settlement mechanism in the inspected paid-video routes. Those routes create server-side ledger entries with pending settlement statuses.
- Sponsor budget and creator ad earnings still use `users/{uid}.walletBalance` in separate helper paths, so the mixed-balance concern remains.
- No source evidence supports deleting wallet/KYC fields from existing Firestore documents.

## 1. Firebase configuration
`firebase.json` configures:
- Firestore rules: `firestore.rules`
- Firestore indexes: `firestore.indexes.json`
- Storage rules: `storage.rules`
- Firestore emulator port 8080
- Storage emulator port 9199

There is no `functions` configuration in `firebase.json`, and no top-level `functions/` directory or deployable Cloud Functions source was found in this ZIP. This is a source-archive finding only; it does not prove no functions exist in the live Firebase project or another repository.

## 2. Firestore Security Rules findings
### User profile
`users/{uid}`:
- Owner/admin read allowed.
- Client create/delete denied.
- Owner update restricted to only `followingCount` with integer and +/-1 constraints.
- Nested user subcollections default to deny.
This means profile fields such as wallet, KYC, income, withdrawal, and legacy commission values are server-managed from the client rules perspective.

### Video collections
`watchEarnVideos` read access is restricted to admin, eligible approved/free/safe/active videos, or the owning creator. Client writes are denied.
Likes, comment moderation and reports have server/admin-controlled access patterns.

### Payment and settlement collections
The rules explicitly deny client read/write to:
- `watchVideoPaymentOrders`
- `watchVideoPurchases`
- `watchVideoPaymentEvents`
- `shortsSettlementLedger`
- `shortsVerifiedExpenses`
- `teacherReferralAttributions`
- `creatorAdEarnings`
- moderation/report/notification collections listed alongside them

This is consistent with a server-managed payment/settlement model. Do not weaken these rules to make UI features work.

## 3. Paid-video settlement code path
Static source references found:
- `src/app/api/shorts/paid-video/create-order/route.ts`: creates/validates paid-video orders and reads teacher referral attribution.
- `src/app/api/shorts/paid-video/verify/route.ts`: verifies payment and transactionally creates three ledger entries:
  - creator share
  - sharer share (or unallocated sharer share)
  - platform share
- `src/app/api/payments/cashfree/webhook/route.ts`: signed provider webhook creates purchase entitlement and idempotent creator/sharer/platform ledger entries.
- `src/app/api/admin/shorts/paid-video-refunds/reconcile/route.ts`: refund reconciliation creates reversal ledger entries.
- `src/app/api/admin/shorts/teacher-referral/reconcile/route.ts`: computes verified refund-adjusted platform net profit and 2% teacher referral, using verified expense evidence and attribution.
- `src/app/api/admin/shorts/expenses/route.ts` and `verify/route.ts`: expense evidence submission and admin verification.
- `src/app/api/shorts/paid-video/playback-session/route.ts`, `src/app/api/shorts/video-stream/[videoId]/route.ts`, and thumbnail route: purchase entitlement checks for paid playback.

Important distinction: paid-video ledger entries use paise and `pending_settlement` statuses. They do not directly credit `walletBalance` in the inspected payment verification route. Live payouts are documented as disabled pending verification.

## 4. Remaining mixed wallet balance issue
`walletBalance` source references:
- `src/lib/videos/watch-earn/checkSponsorBudget.ts`: read as sponsor budget.
- `src/lib/videos/watch-earn/deductSponsorVideoBudget.ts`: decremented as sponsor video spend.
- `src/lib/videos/watch-earn/createCreatorRevenueShare.ts`: incremented as creator revenue.
- `src/app/videos/reward-center/page.tsx`: rendered as “Coins”.
- profile factories initialize it to zero.

This is a real semantic collision: cash creator payable, sponsor-funded spendable budget, and “Coins” are not interchangeable. It requires separate ledger-backed concepts and explicit product decisions. No rename/deletion should be applied as a blind text replacement.

## 5. Storage rules
`storage.rules` checks paid video order status through Firestore before allowing the protected paid-video storage access path. This must be preserved and tested together with paid-video entitlement logic. Do not modify storage rules as part of shopping/MLM cleanup unless a specific, proven commerce-only rule is found.

## 6. Shopping/MLM cleanup conclusion
- No separate Firebase Cloud Functions source exists in this archive to clean.
- Firestore rules contain no visible shopping cart, product, shipping, order-commerce or MLM collection rules.
- User profile rules are already restrictive; do not broaden them.
- `commissionWallet` is only initialized in the two previously identified profile creation files in application source. However, remote records and external systems remain unverified.
- `rewardWallet`, KYC, withdrawal and wallet fields should not be removed from existing documents based only on this ZIP.

## 7. Required actions before code changes
1. Compare live Firebase deployed rules with this archived `firestore.rules` using authorized Firebase console/CLI access; do not deploy archived rules blindly.
2. Confirm whether any external Cloud Functions, scheduled jobs, admin scripts, or other repositories consume legacy profile fields.
3. Decide and document whether Reward Center “Coins” are cash or non-cash points.
4. Design distinct sponsor-budget and creator-payable ledgers; migrate only after a read-only schema inventory and reconciliation plan.
5. Add emulator tests for user-profile update restrictions, paid-video order/purchase entitlement, ledger idempotency, refund reversals, teacher referral net-profit gate, and storage access.
6. Keep live payouts disabled until the full ledger, reconciliation, and payout tests pass.

## 8. Safety status
- No code modified or deleted.
- No Firestore/Storage rules changed or deployed.
- No Firebase data read, migrated, or deleted.
- No payments, payouts, or external integrations invoked.
- No commit, push, merge, or deployment performed.

**Phase 3 status:** Firebase rules and in-repository ledger dependencies inspected. Next safe step is emulator/config validation and a read-only comparison with deployed Firebase configuration, followed by a reviewed cleanup patch.
