# JembeeKart remediation work — 31 October 2026

## Release status

**NOT READY FOR PRODUCTION.** This is a remediation worktree, not a final security-fixed release. Static edits have been made for the findings listed below. Several high-risk items require architecture/business-rule decisions, provider configuration, dependency downloads, or runtime testing that are not available in this environment.

## Changes applied to source

| Finding | Remediation state | Changes |
|---|---|---|
| A-01 | Mitigated in archive; external action required | Removed `.env.production` and `.env.vercel.production`, debug logs, nested ZIPs; added sanitized `.env.example`. All previously exposed long-lived credentials still require manual rotation in provider consoles. |
| A-02 | BLOCKED | Lockfile still resolves Next.js 16.2.9 and sharp 0.34.5. npm registry DNS/network was unavailable, so a valid patched lockfile could not be generated. Do not deploy this worktree until Next.js is upgraded to a patched release (audit baseline: 16.4.1+) and sharp to 0.35.5+. |
| A-03 | Mitigated by fail-closed disablement | `/api/ads/event` now returns 503 and performs no billing/payout writes until provider-verifiable impression/click proof is implemented. Ad billing and AdSlot rendering are paused. |
| A-04 | Fixed in code; runtime not tested | Cron rejects missing/blank secrets, uses constant-time comparison, removes secret debug metadata, processes a bounded page of 50. |
| A-05 | Mitigated by disablement | Rollback endpoint requires super-admin token with revocation check and returns 501. Caller-supplied filesystem restore paths are no longer used. |
| A-06 | Partially remediated | Governance and Mission Control API routes require server-verified admin identity and token-revocation checks. Admin client fetches were updated for the main dashboards and service helpers; remaining unreviewed callers need a full UI sweep. |
| A-07 | Fixed in code; browser test not run | OAuth error/catch messages no longer reflect untrusted strings into HTML; static CSP added to callback error response. Refresh token remains HTML-escaped and no-store. |
| A-08 | Mitigated | Dynamic CMS content is rendered as text, not injected HTML. Rich HTML formatting is intentionally unavailable until a vetted sanitizer/rich-text renderer is added. |
| A-09 | Partially remediated | Central business-rules writes now use an admin-authenticated server API with schema validation and atomic audit records; wallet withdrawal and approval also use server transactions. Remaining client collection/rules mismatches for orders, profile, notifications, media and other legacy flows still need individual migration. Firestore rules were not broadly loosened. |
| A-10 | UNRESOLVED | Admin order-delivery financial pipeline needs a dedicated server transaction design and business-rule verification. Existing wallet/MLM logic was not rewritten. |
| A-11 | Fixed in code; emulator/admin workflow tests not run | Added authenticated `/api/wallet/withdrawals` GET/POST, server-side KYC/balance/pending/daily-limit checks, fee/net-payout calculation from centralized wallet rules, atomic wallet hold + withdrawal + ledger + idempotency writes, and replaced the hardcoded mock withdrawal page with live balance/history. Added authenticated admin queue/approve/reject API and real withdrawal-request UI; approval requires a manual verified payout reference, rejection refunds wallet atomically. Ledger writes both `referenceId` and `withdrawId` for legacy compatibility. External bank/UPI transfer is still manual, not an automated payout integration. |
| A-12 | Fixed in code; Qikink sandbox not tested | Qikink now requires an existing internal order owned by the caller, derives SKU/price/address from that order, claims an idempotent fulfillment state and locks ambiguous provider outcomes for reconciliation. No active frontend callsite was found in the supplied source. |
| A-13 | Mitigated by fail-closed disablement | New paid-video upload and paid-video approval are blocked; stream and thumbnail routes deny paid records until verified purchase entitlements exist. Free video path remains enabled. |
| A-14 | Fixed in config; build not run | Removed `typescript.ignoreBuildErrors`. Build/type errors will now block production build. |
| A-15 | Partially remediated | Known fake Mission Control action endpoints return 501 rather than false success. Known mock metrics GET endpoints return 501. Remaining admin demo/local-only modules still require implementation or explicit demo labels. |
| A-16 | Fixed in active code paths; revocation test not run | Active admin verification paths now use `verifyIdToken(token, true)`; shared admin auth helper uses token revocation checks. |
| A-17 | Partially remediated; provider preset required | Added Firebase-authenticated Cloudinary signature API, per-user upload rate limits, and migrated shared image/video helper plus product/category uploads away from unsigned direct uploads. Requires `CLOUDINARY_SIGNED_UPLOAD_PRESET` configured as a signed preset in Cloudinary and provider tests; preset max-file-size/format restrictions must be set in the Cloudinary console. |
| A-18 | Partially remediated | Monetag statistics request uses discovered site ID, follows up to 20 pages, and explicitly marks results incomplete when the cap is reached. Zone IDs and provider pagination semantics still require live account verification. |
| A-19 | Mitigated by fail-closed behavior | Arbitrary JavaScript regex execution removed from comment request path. If enabled regex rules exist, comment submission returns 503 until a linear-time RE2-compatible engine is integrated. |
| A-20 | Fixed in code; emulator test not run | Comment API now enforces per-user minute/hour/day counters and duplicate-text window using a Firestore transaction. |
| A-21 | Partially remediated | Added authenticated comment moderation queue API, transactional approve/reject and audit event, plus admin UI. UI fetches up to 2,000 items; larger queues need further paging/operations. |
| A-22 | Fixed in code | Comment creation now requires video approved, active and `moderation === safe`, checked again inside the transaction. |
| A-23 | Fixed in code | Comment and comment-like request bodies have an 8 KB byte limit and return 413 for oversized bodies. |
| A-24 | Partially remediated | Comment API uses a caller request UUID as deterministic document ID and avoids a second count increment on replay. Client generates a UUID per submit; caller-level retries must reuse the same request body/key. |
| A-25 | Fixed in code; emulator test not run | Moderation settings now save through an admin-authenticated server endpoint; settings and audit record are written in one transaction and admin UID is derived from verified token. |
| A-26 | Fixed in code; emulator test not run | Shared deletion cascade removes current comments and comment likes, legacy comments/replies, likes/shares/saves, and archives video/comment reports. |
| A-27 | Partially remediated | Video deletion first tombstones/hides the video, validates Cloudinary result, then performs bounded 400-write cleanup batches. Retry can resume while the video record remains. External-provider failure/retry still needs integration testing. |
| A-28 | Fixed in code | Admin and creator deletion now share the same report archival policy. |
| A-29 | Fixed in code; abuse test not run | Share attribution requires approved/active/safe video, rejects self-share, deduplicates by user/video/day and no longer returns internal uploader/sharer UIDs. |
| A-30 | Mitigated by fail-closed configuration | Cashfree settings remain disabled even if the admin submits enabled=true, until payment initiation, signed webhook, refund and reconciliation flows exist. |
| A-31 | Partially remediated | Creator upload session creation now has a two-active-session cap and 30-second per-user cooldown; stale upload cleanup and MIME-signature verification remain. |
| A-32 | Fixed by disablement | Legacy unauthenticated `/api/mlm/merge` upload endpoint returns 410. |
| A-33 | Partially remediated | Public mobile product API returns a strict public-field allowlist with cursor pagination. Direct Firestore public reads of full `products` documents may still expose private cost fields; a full public/private product projection migration is unresolved. |
| A-34 | Fixed in code; emulator test not run | Like notification requires authoritative like record; comment notification requires matching approved comment; both use transactions to create notification and increment unread count once. |
| A-35 | Fixed in code; multipart test not run | Removed Busboy `fields` shadow declaration and added field/part limits. |
| A-36 | Partially remediated | Creator cancellation and completion now claim mutually exclusive `uploading -> cancelling/completing` transitions before side effects. Crash recovery for stuck `completing`/`cancelling` states still needs a reconciler. |
| A-37 | Partially remediated | Rejection now claims `pending -> rejecting` before Drive deletion and records `reject_failed` for retry; crash recovery for stuck `rejecting` needs a reconciler. |
| A-38 | Partially remediated | Video moderation, Shorts reports and comment reports use stable document-ID cursor pagination. Current UI reads up to 2,000 per queue and displays a cap warning; further pages need operational UI. |
| A-39 | Fixed in code; Cloudinary webhook test not run | Replaced static shared-header check with Cloudinary-native `X-Cld-Signature` and `X-Cld-Timestamp` verification over raw request bytes, constant-time digest comparison, 2-hour freshness window and 5-minute future skew. Configure Cloudinary webhook auth mode to send legacy HMAC signature (default or `legacy_hmac`); EdDSA-only mode is not handled. |
| A-40 | Fixed in config; emulator test not run | Added composite `creatorAdEarnings(status, payoutDueAt)` index. |
| A-41 | Partially remediated | Numeric validator now rejects all non-finite values and validates more fields/enums. Business Rules writes now go through an admin-authenticated API and preserve audit metadata. Remaining direct legacy settings/rules mismatches and full emulator validation remain. |
| A-42 | Partially remediated | Known demo-only Mission Control GET/action endpoints now return 501 or explicit not-connected responses. Several other local-only admin modules still need real APIs or explicit demo labeling. The withdrawal mock page was replaced with live server-backed balance and history; mock Mission Control metrics/activity/notifications/audit endpoints were disabled. |
| A-43 | Fixed in code; playback test not run | Public video streaming caps full responses and byte ranges at 8 MiB; larger videos require bounded range requests. |
| A-44 | Fixed in code; integration test not run | Thumbnail proxy now validates HTTPS allowlisted Google hosts at each redirect, limits redirects to 3, caps body to 5 MiB, and allowlists image MIME types. |
| A-45 | Fixed in code | Profile watch-data rechecks approved/active/safe/free state and returns an explicit public-field projection, excluding Drive IDs and moderation internals. |
| A-46 | Mitigated by transparent status | Dashboard now flags totals as partial when any query reaches its record cap; aggregate counters or full-period pagination are still needed for exact historical totals. |
| A-47 | Fixed in code; emulator/concurrency test not run | Creator earnings cron now processes at most 50 due records per invocation, orders by due time, validates creator/event/amount and uses deterministic wallet transaction IDs. |

## Verification performed

- Source archive extracted successfully.
- TypeScript/TSX syntax-only transpilation: **774 active source files, 0 syntax diagnostics**, using globally available TypeScript 5.8.3. This is not a full typecheck and differs from the project's locked TypeScript 6.0.3.
- `firestore.indexes.json` JSON parse: expected to be validated in final packaging.
- Real `.env*` files, debug log and nested ZIP removed from this worktree.

## Verification not completed / release blockers

- `npm ci --ignore-scripts --offline --no-audit --no-fund`: failed `ENOTCACHED` because the `zustand@5.0.14` tarball is absent from local npm cache; no `node_modules` was created. `npm view next@16.4.1` also failed with registry DNS error (`EAI_AGAIN`).
- `tsc --noEmit`: failed before project type analysis; global TypeScript 5.8.3 reported missing `@types/node` and unsupported `ignoreDeprecations` option from the TypeScript 6 project config.
- Next.js production build, ESLint, npm audit: not run.
- Firebase Emulator rules/unit tests, API integration tests, concurrency tests, browser/E2E tests: not run.
- Cloudinary, Google Drive, Monetag, Qikink, Cashfree live/sandbox provider tests: not run.
- Production Vercel/Firebase deployed commit, rules and environment values: not verified.

## Mandatory external actions before production

1. Rotate every long-lived credential that was present in the original uploaded `.env.production` / `.env.vercel.production` files. Removing them from this ZIP does not revoke them.
2. Upgrade Next.js and sharp to patched releases and regenerate the lockfile with a clean dependency install.
3. Configure a Cloudinary signed upload preset in the account and set `CLOUDINARY_SIGNED_UPLOAD_PRESET`; set the Cloudinary notification endpoint to send HMAC signature headers.
4. Resolve A-09/A-10/A-17/A-33 and the remaining partial items before declaring the whole project fixed.
5. Run all tests listed above on the exact release candidate.

**Do not deploy this worktree as production until every blocker is closed and the release checks pass.**

## C-36 — Checkout variant binding and request-size validation (31 October 2026)

- Changed `src/app/product/[id]/page.tsx`, `src/app/checkout/page.tsx`, and `src/app/api/orders/create/route.ts`.
- Buy Now now carries the customer's selected size and color to checkout using URL encoding; checkout displays those selected values and submits them to the authenticated order API.
- Order API now enforces an 8 KiB request body limit (Content-Length and actual UTF-8 byte count), rejects malformed/non-object JSON, bounds variant string lengths, validates selected size/color against the product's published options (with the same defaults as the product page), and stores the selected values on the order record.
- This closes the mismatch where the product page selection was discarded and checkout displayed a hard-coded size/color. It does not implement variant-specific stock counts: the current product schema/order transaction decrements aggregate `product.stock` only. Do not represent this as per-size/per-color inventory enforcement.
- TypeScript 5.8.3 syntax-only validation: 3 changed TSX/TS files, 0 diagnostics.
- Not run: full typecheck, ESLint, Firestore Emulator, concurrent stock/variant tests, checkout browser tests, payment-provider tests, or production build.

## C-37 — Withdrawal Admin ledger binding and malformed-body handling re-applied to current worktree (31 October 2026)

- The current extracted worktree was re-opened and the earlier C-35 withdrawal ledger checks were not present in `src/app/api/admin/withdrawal-requests/route.ts`; the source on disk is treated as authoritative and the fix has now been applied to this worktree.
- Admin withdrawal approve/reject now requires exactly one matching ledger record whose type is `withdraw_request`, status is `pending`, user ID matches the withdrawal owner, both withdrawal/reference IDs match, and amount matches exactly in integer cents. A mismatch returns a consistency conflict without writes.
- The Admin API now checks Content-Length and actual UTF-8 request size against 8 KiB, rejects malformed JSON and non-object bodies with HTTP 400 rather than falling through to a generic 500.
- Existing manual payout reference entry is not provider verification. Do not treat `payoutReference` as proof that a bank/UPI transfer settled; an external payout-provider reconciliation integration remains necessary.
- TypeScript 5.8.3 syntax-only transpilation: 1 changed API file, 0 diagnostics.
- Not run: Firebase Emulator, transaction/concurrency tests, full project typecheck, ESLint, actual payout-provider verification, wallet reconciliation, or production build.

## C-38 — Wallet withdrawal request idempotency and JSON validation (31 October 2026)

- Changed `src/app/api/wallet/withdrawals/route.ts`.
- POST now checks both Content-Length (when present) and actual UTF-8 body size against 4 KiB, rejects malformed JSON and non-object payloads with HTTP 400, and avoids returning a generic 500 for parser errors.
- Reusing a withdrawal `requestId` now succeeds as a duplicate only when the stored request belongs to the same authenticated UID and the amount matches in integer cents. Reusing the same key for a different amount is rejected as an idempotency conflict instead of silently returning the earlier withdrawal ID.
- UPI value is not stored in the idempotency record, so the duplicate comparison deliberately binds user and amount only; if strict full-payload idempotency is required, persist a keyed digest of normalized payout details (never the raw UPI in logs) in a future migration.
- TypeScript 5.8.3 syntax-only validation: wallet and Admin withdrawal routes, 2 files, 0 diagnostics.
- Not run: Firebase Emulator transaction/replay/concurrency tests, wallet ledger reconciliation, full project typecheck, ESLint, payout provider integration, or production build.
