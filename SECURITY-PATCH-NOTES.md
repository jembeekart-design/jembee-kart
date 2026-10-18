# Jembeekart security patch notes

This package contains targeted source changes for isolated testing. It is NOT a claim that every item in the prior audit is fixed.

## Changes in this patch
- Qikink create-order now requires a Firebase ID token, looks up the product by SKU in Firestore, calculates price on the server, validates quantity/stock/shipping fields, and does not return Qikink token data. Prepaid Qikink order creation is intentionally blocked until server-verified Cashfree payment linkage is implemented.
- Cloudinary moderation webhook now fails closed unless `CLOUDINARY_MODERATION_WEBHOOK_SECRET` is configured and sent as `x-webhook-secret`. It sets video coins and pendingCoins to zero, consistent with the no-watch-reward business rule. Configure the webhook caller before testing; otherwise requests return 401.
- The Qikink token, Mission Control auto-fix, and Mission Control review/apply routes in this source tree use `withAdminAuth`.

## Not fixed / must not be treated as verified
- Firestore production rules are NOT changed by this patch. The existing Console rules shown in screenshots (`allow read, write: if true`) remain a critical risk until a collection-by-collection ruleset is tested and deployed. Do not deploy guessed rules.
- Cashfree credential encryption/verified payment webhooks, all withdrawal/payout engines, order ownership, admin checks across all APIs, dependency vulnerabilities, build/lint issues, and full integration tests are not all resolved by this package.
- This archive excludes environment files and secrets. Do not copy production secrets into the test environment.

## Required isolated test setup
1. Use a separate Firebase test project and test-only credentials.
2. Set `CLOUDINARY_MODERATION_WEBHOOK_SECRET` in the test environment and configure the test webhook to send `x-webhook-secret`.
3. Use Qikink test/sandbox credentials if available. Prepaid order creation is intentionally blocked.
4. Run lint/build and functional tests before any deployment.
