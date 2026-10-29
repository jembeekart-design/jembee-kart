# JembeeKart Audit Status

## Workspace recovery note (2026-10-29)
The prior temporary audit workspace was not present when work resumed. The available `JembeeKart_Full_Project.zip` was re-extracted into this workspace. It does not contain the most recent temporary edits described in the prior conversation, so the changes below are being reconstructed and must be revalidated before any final package is created.

## Reconstructed change in this workspace
- Added `src/lib/server/readBoundedJson.ts`: bounded streaming JSON parser with exact JSON content-type check, byte limit, and 400/413/415 errors.
- Verification remains pending until route adoptions, syntax checks, type-check, build, and runtime tests are run.

## Bounded request parsing resumed on extracted project (2026-10-29)

- Reconstructed the reusable bounded streaming JSON helper in `src/lib/server/readBoundedJson.ts` because the prior temporary audit workspace was unavailable in this execution environment. The source ZIP currently available did not contain the latest temporary edits from the prior conversation; therefore previously reported fixes must not be assumed present in this extracted copy until individually re-applied and checked.
- Adopted the helper in `src/app/api/admin/monetag-payments/route.ts` (16 KiB), `src/app/api/admin/monetag-settings/route.ts` (16 KiB), `src/app/api/admin/monetag-revenue/import-sync/route.ts` (16 KiB), `src/app/api/admin/monetag-revenue/csv-import/route.ts` (1 MiB + 16 KiB wrapper allowance), and `src/app/api/shorts/video-report/route.ts` (8 KiB). Each rejects non-JSON content types, malformed/oversized bodies, and non-object JSON before processing request fields.
- Validation: all six changed TypeScript files passed syntax transpilation with 0 diagnostics using the globally available TypeScript compiler. This is syntax-only; project type-check, dependency installation, build, and runtime/API tests remain pending.


## Mission-control access-control and request validation phase (2026-10-29)

- Evidence found in the extracted source: `src/app/api/mission-control/review/action/route.ts` and `rollback/route.ts` previously performed privileged review/rollback work without an admin-auth wrapper; `review/route.ts` also exposed scanner review data without an auth wrapper. The rollback route accepted an arbitrary `backupPath`, while `rollbackEngine.ts` recursively copies `<backupPath>/src` into the live `src` tree.
- Added `withAdminAuth` protection to review GET/action, apply, hard-autofix, rollback, and 11 additional mission-control routes that had no auth marker. GitHub connection test now checks required configuration, avoids returning upstream error details, and uses no-store fetch.
- Rollback now uses bounded JSON (8 KiB), validates the body shape, restricts the selected backup to a child directory under `.mission-control-backup`, and requires `backup.json` and `src` to exist before restoring. Review/action, apply, and hard-autofix now use bounded JSON and basic object/array validation.
- Added bounded JSON parsing to Cashfree settings PUT (16 KiB), Monetag sync (16 KiB; real calendar date validation and maximum 366-day range), profile creation (8 KiB), order creation (8 KiB), and Monetag share attribution (8 KiB).
- Updated Mission Control Review, Rollback, and Backup UI requests to send Firebase ID tokens to the newly protected routes.
- Syntax-only validation: 16 changed TypeScript files passed transpilation with 0 syntax diagnostics. Full type-check, lint, build, and runtime tests remain blocked by incomplete dependencies/network availability.
- Important residual findings: several mission-control action endpoints are placeholders that return a success-shaped response without performing the advertised operation; inspect and replace these mocks or return an explicit not-implemented response before production. The `withAdminAuth` helper's current error handling may return HTTP 500 for invalid tokens instead of 401; improve and test it in the next pass. The frontend calls for other Mission Control modules also need a token/header integration review.
- Source archive includes `.env.production` and `.env.vercel.production`; `.gitignore` contains `.env*`, but the archive itself still includes these files. Final ZIP must exclude secret environment files and include only a safe `.env.example` if one is prepared. Do not expose or copy secret values.
- Follow-up hardening: `withAdminAuth` now returns 401 for missing/invalid/revoked Firebase ID tokens, returns 403 for non-admin or ambiguous duplicate UID records, checks revoked tokens, and limits the role lookup to two documents instead of reading every matching record. Rollback also resolves real paths to block symlink escapes; recursive backup copying skips symlink entries.
- Final syntax-only pass for this phase: 32 modified TS/TSX files checked, 0 syntax diagnostics. This still does not establish full TypeScript correctness or runtime safety.
- Current source scan finds 19 API route files still using direct `request.json()`. These require endpoint-specific review; webhook bodies must not be blindly refactored if signature verification depends on raw bytes.
- Mission-control route scan now finds 0 route files without an obvious authorization marker. This is only a static marker check; runtime authorization tests and UI integration checks are still required.


## Video deletion hardening phase (2026-10-29)

- Added bounded 8 KiB JSON parsing and object/type validation to `src/app/api/admin/delete-video/route.ts` and `src/app/api/creator/delete-video/route.ts`; requires a non-empty token and videoId, caps videoId length, and rejects slash-containing IDs before Firestore document lookup.
- Replaced one unbounded Firestore batch per collection with sequential batches of at most 400 deletes, below Firestore's 500-write batch limit. The main video document is deleted only after related-record cleanup succeeds. Admin deletion also removes `videoReports`; creator deletion deliberately preserves moderation reports as audit evidence.
- Residual limitation: storage-provider deletion and Firestore cleanup cannot be atomic across services. Since the current routes remove the external asset before Firestore cleanup, a later Firestore failure can still leave stale metadata. A durable deletion state / retry job is the robust long-term fix; do not describe this as fully transactional.
- Verification in progress: run syntax-only transpilation on changed files and re-count direct request JSON parsing in API routes. Full project type-check/build remains unavailable until dependencies are installed.

## API body-boundary and upload-log hardening (2026-10-29)

- Adopted `readBoundedJson` for the remaining request JSON routes that were using direct `req.json()`/`request.json()`, including Qikink order creation (16 KiB), Monetag manual revenue import (16 KiB), ad event, Shorts comments/likes/notifications, profile photo updates, admin moderation actions, creator Drive upload metadata/cancel/recovery/completion, and the Cloudinary moderation webhook (16 KiB after its shared-secret check).
- Webhook remains protected by its existing shared-secret header check; body is now also size-limited and validated as a JSON object. This is not a cryptographic signature implementation; secret handling and webhook replay controls remain separate review items.
- Removed temporary creator-upload diagnostic logs that printed creator UIDs, submission/Drive identifiers, or verbose metadata.
- Verification: TypeScript syntax transpilation across 767 TS/TSX files produced 0 syntax diagnostics. Bounded JSON helper tests passed 5/5 (valid JSON, wrong content type, malformed JSON, oversized body, and array parsing behavior; route-level object validation rejects arrays). Direct `req.json()`/`request.json()` calls in `src/app/api/**/route.ts` now count as 0.
- Limitations: this is syntax transpilation, not full project type-checking. Local `node_modules/.bin/tsc`, `eslint`, and `next` are unavailable, so type-check, lint, production build, and route integration tests remain unrun. External service response `.json()` calls are intentionally not part of the request-body scan.
- Packaging blocker remains: `.env.production` and `.env.vercel.production` exist in the source archive and must be excluded from any final distributable; do not expose their contents.

## Monetag revenue CSV parser compatibility review (2026-10-29)

- Static inspection found the CSV parser split fields only on semicolons. Standard comma-delimited Monetag CSV exports would be treated as a single column and rejected even when otherwise valid.
- Added first-record delimiter detection that counts comma/semicolon separators outside quoted fields and selects the more common delimiter (comma is the tie/default). Quoted delimiters remain inside the field.
- Verification pending in this phase: run targeted parser tests for comma-delimited, semicolon-delimited, quoted delimiter, escaped quote, and malformed quote input; then run syntax-only checks on the modified route.

## Monetag CSV and API sync correctness hardening (2026-10-29)

- CSV delimiter detection was fixed and targeted tests passed for comma-separated input, semicolon-separated input, quoted delimiters, escaped quotes, CRLF line endings, and rejection of an unterminated quote (6/6).
- Static review found the Monetag statistics request selected the site dynamically but sent a hardcoded `site_ids: [7835975]`. It now sends the validated numeric ID of the matched account site, avoiding silently syncing a different site or no matching rows when IDs differ.
- Removed raw upstream statistics error details from the API response to reduce accidental leakage of provider diagnostics.
- Hardened the API-sync import endpoint to reject slash-containing sync IDs, invalid calendar dates, reversed date ranges, periods longer than 366 days, and implausibly large aggregate revenue before creating an import record.
- Verification: the changed CSV import, API sync, API-sync import, and shared JSON helper files passed syntax-only transpilation with zero diagnostics. Full build/type-check and live Monetag API tests remain unavailable/unrun.

## Firestore Rules: wishlist access restored with owner-only validation (2026-10-29)

- Evidence: `src/hooks/useWishlist.ts` and `src/app/wishlist/page.tsx` use the top-level `wishlist` collection and query by `userId`, but `firestore.rules` had no matching rule, so the catch-all deny blocked all client wishlist reads/writes.
- Added a narrow `/wishlist/{wishlistId}` rule: owners can read/delete their own items; authenticated users can create only their own item with an allowlisted schema and bounded product ID/title/image/price; client updates are denied. Admins retain read/delete access for support/moderation.
- Added four Firestore Rules unit tests covering valid owner create/read, cross-user read denial, forged owner/extra-field denial, and update denial/owner delete.
- Test execution is currently blocked because `@firebase/rules-unit-testing`, `firebase/firestore`, and Firebase CLI are absent from the extracted `node_modules`; the emulator test suite has not been run. Rules syntax/runtime behavior must be verified when dependencies are available.

## Verification update after current changes (2026-10-29)

- Re-ran syntax-only transpilation across all current `src/**/*.ts` and `src/**/*.tsx` files: 759/759 passed with zero syntax diagnostics. Earlier 767 count came from a broader scan that included additional TypeScript files outside the current `src` scan; these are different scan scopes, not contradictory results.
- Reconfirmed zero direct `req.json()` / `request.json()` calls in `src/app/api/**/route.ts` request handlers.
- Re-ran the six focused CSV parser cases: 6/6 passed. `firestore.rules.test.mjs` passes Node's JavaScript syntax check, but Firestore emulator/rules tests are still blocked by missing Firebase CLI and rules-unit-testing dependencies.
- The final archive is still blocked on secret environment files in the source tree and missing full dependency-backed checks. No final ZIP created.

## Qikink order endpoint follow-up (2026-10-29)

- Static inspection found the Qikink create-order route treated missing/invalid stock as unlimited because `Number(product.stock)` could be `NaN` and the insufficient-stock comparison then returned false. It now rejects missing, malformed, fractional, negative, or unsafe-integer stock values and rejects quantities beyond the configured stock.
- Provider-facing order numbers are now server-generated rather than accepted from the browser, reducing spoofing/collision risk. Qikink token/order requests now have 10s/15s timeouts, and the raw provider response body is consumed but not returned to the browser.
- Verification: changed route passed TypeScript syntax transpilation with 0 diagnostics.
- Critical residual limitation: stock is only checked before the external Qikink API call and is not atomically reserved/decremented with a durable idempotency record. Concurrent requests or retries may still over-order/create duplicate external COD orders. Before production use, implement a Firestore reservation/idempotency state machine with compensating release/reconciliation; do not treat this endpoint as fully safe yet.
- The Qikink create-order route currently has no call site in `src` according to static search, but it remains an exposed API route and should be secured before use.

## Financial consistency review (2026-10-29)

- Property-style local arithmetic test: 4,000 combinations of gross amounts, valid uploader/sharer percentages (sum <= 100), and present/missing attributions passed the revenue allocation conservation check (uploader + sharer + platform + unallocated approximately equals gross revenue within 0.00001 USD). This validates the intended arithmetic pattern, not Firestore transaction execution.
- Confirmed API-sync and CSV aggregate imports intentionally create `unallocated` records and do not create uploader/sharer earnings until attribution is separately verified. Manual import uses deterministic hashed record IDs and a Firestore transaction to prevent duplicate externalRecordId imports.
- Additional reporting risk: `src/app/api/admin/monetag-revenue/route.ts` dashboard summary reads only the latest 200 imports, up to 1,000 earnings, and up to 1,000 payments, while `src/app/api/monetag/earnings/route.ts` returns at most 200 earnings and 200 payments without pagination. If the UI labels these sums as lifetime totals, totals become incomplete once limits are exceeded. Needs paginated history or Firestore aggregate queries and explicit time-window labels.
- CSV import currently reads the entire `monetagCsvImports` collection in preview and transaction to detect overlapping periods. This may become expensive/slow as imports accumulate; replace with a bounded/indexed overlap query after confirming required Firestore composite indexes.
- Qikink route follow-up: invalid/missing inventory now fails closed, order number is server-generated, provider calls have timeouts, and raw provider response is no longer exposed. Route syntax transpilation passed with 0 diagnostics. Durable stock reservation/idempotency is still required before production use.
- Global syntax-only validation after these changes: 767 TS/TSX files, 0 syntax diagnostics. Direct request-body `.json()` calls in API route handlers: 0. Full type-check, ESLint, production build, Firestore emulator tests, and external-provider integration tests remain unrun because local tool binaries/dependencies are absent.

## Safe source-package preparation (2026-10-29)

- Re-ran syntax-only transpilation across the current `src` tree using global TypeScript 5.8.3: 767 `.ts`/`.tsx` files scanned, 0 syntax diagnostics.
- Re-scanned `src/app/api/**/route.ts`: 0 direct `req.json()` / `request.json()` calls. This checks only direct request-body parsing patterns; it does not prove all routes have correct schema validation or authorization.
- Full dependency-backed type-check, ESLint, Next.js production build, Firestore emulator tests, and external provider integration tests remain unverified because the extracted workspace lacks the local `tsc`, `eslint`, `next`, and Firebase CLI binaries/dependencies and registry access was unavailable during prior attempts.
- Packaging rule: all `.env*` files are excluded from the distributable. The original `.env.production` and `.env.vercel.production` files remain only in the working source directory and are not copied into the ZIP. Keep private environment values in a secure local/hosting secret store; rotate any credential if the source archive was shared with an untrusted party.
- Packaging also excludes dependency/build/cache directories, logs, and nested ZIP archives. The current source, configuration, documentation, reports, rules, and audit notes are retained.
- Status: safe source archive prepared for handoff, but it is **not certified production-ready** until the dependency-backed checks and listed integration tests pass. Do not interpret syntax-only validation as a full security certification.
