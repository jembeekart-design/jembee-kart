# JEMBEE PLAY — Phase 3 Dependency & Safe Cleanup Map
Date: 2026-11-12
Source: `JEMBEE_PLAY_FULL_SOURCE_2026-11-12.zip` (20 MB; archive root commit `8662810be9046b02dd3f2f6b306befad942a873b`)

## Scope and safety
This is a source-level dependency review only. No source files, Firebase documents, production settings, or payout settings were changed. Do not delete data or deploy based on this report alone. Preserve approved Home and Shorts designs.

## Confirmed exact legacy field references
A repository-wide source search found exactly two occurrences of `commissionWallet`:

1. `src/lib/security/profileFactory.ts:35` — client-side initial profile factory writes `commissionWallet: 0` when constructing a new profile.
2. `src/app/api/auth/create-profile/route.ts:113` — server-side authenticated profile creation transaction writes `commissionWallet: 0` only when a user document does not already exist.

No other `commissionWallet` reads or writes were found in the extracted repository search. This suggests the field is currently a legacy initialization-only field in this source snapshot. It does **not** prove that existing Firestore documents, external clients, exports, or historical ledger processes do not use it.

## Classification — keep vs review vs remove

### Keep — JEMBEE PLAY video business features
- Paid video purchase flow under `src/app/api/shorts/paid-video/`.
- Cashfree signed webhook and paid-video ledger handling under `src/app/api/payments/cashfree/webhook/`.
- Creator/Sharer/Platform paid-video allocation ledger entries (`paidvideo_*_creator`, `paidvideo_*_sharer`, `paidvideo_*_platform`) — these are video revenue settlement, not shopping MLM.
- Video share attribution under `src/app/api/shorts/video-share/` and `src/app/api/monetag/share-attribution/`.
- Teacher referral reconciliation under `src/app/api/admin/shorts/teacher-referral/reconcile/` and its net-profit/payment-ledger policy documents. Preserve the 2% of verified actual platform net profit rule; do not calculate on gross paid-video sales.
- Monetag revenue import/reconciliation and video earning profile display.

### Remove from new JEMBEE PLAY profile schema — candidate, requires approval/test gate
- `commissionWallet` initialization in the two files above. It has no in-repository consumer in this ZIP, but existing Firestore user records may still contain the field. Preferred approach: stop writing the legacy field for newly created users, retain backward-compatible reads if any external consumer is discovered, and do not bulk-delete existing Firestore fields.

### Do not remove yet — ambiguous generic wallet/accounting fields
- `walletBalance`, `rewardWallet`, `totalIncome`, `todayIncome`, `totalWithdraw`, `pendingWithdrawal`, `walletLocked`, `rewardCount`, `kycStatus`, and `kyc*` fields appear in profile creation. Names alone are insufficient to classify them as shopping/MLM. Map every read/write, admin page, withdrawal workflow, Firebase rule, and test before deciding. Some may support platform rewards, creator earnings, KYC, or legacy commerce.

## Shopping / MLM route findings
The `src` tree scan did not find a clearly named active shopping/catalog/cart/checkout/shipping module. However, generic strings such as `order`, `product`, and `referral` are not reliable deletion criteria:
- `orderId` and `watchVideoPaymentOrders` belong to paid-video Cashfree purchases and must remain.
- `referral` and `share` are used by video share attribution and teacher referrals and must remain.
- UI design catalog entries for Sharer/Profile/Referral are video-platform concepts and must not be mistaken for shopping MLM.

Therefore, no broad text-based deletion is safe.

## Phase 3 cleanup gates
1. Enumerate all profile fields and trace their reads/writes across `src`, tests, Firestore rules/indexes, admin screens, and server jobs.
2. Classify each item as `REMOVE_COMMERCE`, `KEEP_VIDEO`, `KEEP_PLATFORM`, or `NEEDS_EVIDENCE`.
3. Add/adjust profile factory and API tests before changing schema defaults.
4. Keep existing user documents intact; no Firestore bulk migration/deletion without a separately reviewed migration and backup.
5. Verify paid-video purchase, Cashfree webhook idempotency, refund reversal, creator/sharer/platform ledger, teacher referral net-profit gate, and share attribution tests.
6. Run TypeScript, ESLint, unit/integration tests, and production build on the exact source branch before marking cleanup complete.
7. Preserve UI design freeze; no visual redesign during backend cleanup.

## Current Phase 3 status
- Dependency map: completed for `commissionWallet` and identified video revenue/referral routes.
- Full field-by-field profile/wallet/KYC trace: pending.
- Firebase rules and existing production data review: pending; source ZIP alone cannot establish live database contents.
- Source modifications/deletions: none.
- Deployment/payout activation: none.

## Next action
Continue with a full profile schema inventory and reference graph, then prepare a minimal patch proposal for the two `commissionWallet` initializers only if tests and all consumers confirm it is safe. Keep the generic wallet/reward/KYC fields untouched until classified.
