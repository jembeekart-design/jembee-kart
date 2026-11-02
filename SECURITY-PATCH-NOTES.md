# JembeeKart security remediation notes

This source tree contains a **partial remediation worktree**, not a production-ready release. See `REMEDIATION_STATUS_20261031.md` and `TEST_RESULTS_20261031.md` for the exact state of all findings.

## Implemented safeguards

- Cloudinary client uploads now request a Firebase-authenticated server signature. Active product/category/image/video upload callers use the shared signed helper. Configure a signed Cloudinary upload preset using `CLOUDINARY_SIGNED_UPLOAD_PRESET`; set allowed formats and max file size in Cloudinary.
- Cloudinary moderation webhook now verifies Cloudinary-native `X-Cld-Signature` and `X-Cld-Timestamp` headers over the raw body using the configured Cloudinary API secret (or `CLOUDINARY_WEBHOOK_API_SECRET`). Configure the webhook trigger to send legacy HMAC signature headers (`default` or `legacy_hmac`), not EdDSA-only.
- Qikink create-order requires a real internal JembeeKart order owned by the authenticated user and uses order/product data from Firestore. It only accepts placed COD orders. Ambiguous provider results are locked for manual reconciliation.
- Wallet withdrawals use authenticated server transactions for wallet holds, withdrawal records, ledger writes, idempotency and daily limits. Admin approval/rejection is also server-side; approval requires a manual verified payout reference and rejection atomically refunds the wallet.
- Mission Control and Governance APIs require verified admin identity and token-revocation checks. Known mock/demo endpoints and unsafe rollback actions are disabled rather than returning fake success.
- Comment moderation has bounded bodies, transactional per-user rate limits, deterministic request IDs, safe-video checks and an authenticated pending-comment review queue.
- Video deletion hides the video first, validates Cloudinary deletion results, cleans related records in bounded batches and archives moderation evidence.
- Paid-video publishing and Cashfree checkout remain disabled until purchase/payment entitlement flows are implemented and verified.
- Real environment files and debug artifacts have been removed from the archive. Rotate every secret that was present in the originally uploaded environment files.

## Remaining release blockers

- Next.js/sharp dependencies are not yet upgraded to patched versions; the lockfile could not be regenerated because the npm registry was unavailable.
- Full Firestore rules migration, order-delivery commission pipeline, complete product public/private projection, Cloudinary preset configuration, and some legacy/demo admin modules remain unresolved or partial.
- Typecheck, build, lint, Firebase Emulator, browser/E2E, concurrency and live-provider tests have not passed or have not run. Do not deploy this worktree to production.

## Required setup before testing

1. Use a separate Firebase test project and test-only credentials.
2. Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and a signed `CLOUDINARY_SIGNED_UPLOAD_PRESET`.
3. Configure the Cloudinary moderation webhook with HMAC signature headers and set `CLOUDINARY_WEBHOOK_API_SECRET` if using a dedicated webhook secret.
4. Use Qikink sandbox credentials and a real test JembeeKart COD order.
5. Install dependencies, upgrade vulnerable packages, then run typecheck/build/lint and all emulator/API/browser tests before any deployment.
