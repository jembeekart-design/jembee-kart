# JEMBEE PLAY — Phase 2 Source & Requirements Audit

**Audit date:** 12 November 2026
**Source:** `JEMBEE_PLAY_FULL_SOURCE_2026-11-12.zip` (20 MB upload)
**Scope:** Static source inspection, route inventory, existing contract tests, documentation and supplied UI reference-image inventory.
**Handling:** Extracted to an isolated audit directory. No application source files were edited or deleted.

## 1. Archive verification

- Archive size: 20,451,439 bytes (about 19.5 MiB / displayed as 20 MB).
- `unzip -t`: PASS; no compressed-data errors.
- Archive extracted successfully.
- The ZIP includes project source, package manifests, tests, prior audit notes and five Shorts/video reference screenshots.
- No native Android Gradle project or Android manifest was found in this archive.

## 2. Source inventory

- Next.js App Router `page.tsx` files: **62**.
- API `route.ts` files: **67**.
- API route groups: admin 24, shorts 14, creator 7, monetag 4, auth 3, profile 2, MCP 2, ads 2, and one each for webhooks, payments, videos and cloudinary.
- Main stack declared by package.json: Next.js 16.2.9, React 19.2.7, React DOM 19.2.4, Firebase Web SDK 12.13.0, Firebase Admin 13.4.0, TypeScript 6.0.3.
- Five supplied reference images are present under `docs/jembee-play-audit/reference-inputs/reference_images/`.

## 3. Existing automated test execution

Command executed:

```bash
node --test $(find src -type f \( -name '*.test.mjs' -o -name '*.spec.mjs' \) | sort)
```

**Result: 109 passed, 0 failed, 0 skipped.**

Covered contracts include video-only signup/profile, removal of legacy MLM signup capture, paid-video eligibility and Cashfree webhook contracts, refund reversals, creator/sharer 30/20/50 allocation, teacher referral based on verified admin net profit, share attribution, video preload window, Shorts route contracts, manual ad placements, Firestore/Storage security contract checks and UI design catalog integrity.

This is a Node contract-test pass only. It is not a production certification and does not prove live provider, Firebase, browser, device or build behavior.

## 4. Shopping and MLM separation — preliminary result

- No active source file paths matching the conventional commerce/MLM module names (shop, products, cart, checkout, orders, inventory, shipping, seller, vendor, MLM, downline, sponsor, affiliate) were found in the `src` path scan.
- Existing contract tests explicitly assert that new profiles do not initialise legacy shopping/MLM fields, signup/login do not capture old JBK sponsor codes, and unused multilevel-referral helper modules are absent.
- The remaining `commission` and `referral` matches are primarily video-platform business logic: teacher referral ledger, verified share attribution and UI concepts for Sharers. These must not be removed as MLM.
- **Potential legacy residue requiring decision:** `commissionWallet` remains initialised to zero in `src/lib/security/profileFactory.ts` and `src/app/api/auth/create-profile/route.ts`. This is a profile-schema field, not proof of an active MLM feature. Trace all reads/writes and migration implications before removing or renaming it.
- Do not delete historical Firestore commerce/MLM records as part of source cleanup. Any data migration or purge requires a separate backup, retention review and explicit approval.

## 5. Confirmed product gaps / risks

### P1 — School Learning is not production-backed

- `src/app/learn/school/page.tsx` uses local in-file catalog arrays for boards, subjects, chapters and generated questions; school lists are empty arrays.
- The visible UI explicitly says live question-to-video mapping is not connected and shows no fabricated answer videos.
- `src/app/admin/education/schools/page.tsx` explicitly states that Firebase save/publish is not connected; its form only validates locally.
- Required follow-up: implement the approved hierarchy and real Firestore/API CRUD, stable IDs, authorization, duplicate checks, moderation and verified video-to-question mapping. Preserve the approved visual design while wiring real data.

### P1 — Admin RBAC and integrations need runtime verification

- Source includes many admin API routes. Static presence and unit contracts do not prove every route is protected correctly in the deployed environment.
- Verify server-side RBAC, Firebase rules, Storage rules, OAuth token handling, Cashfree signature/amount/currency checks and webhook replay/idempotency in emulator/sandbox before production activation.

### P1 — Home, Shorts and feed must be compared with the supplied references

- The five screenshots are available, but a complete image-to-component acceptance matrix has not yet been generated in this report.
- Existing tests cover Home feed presentation, Shorts contracts and five-item thumbnail/metadata preload behavior. They do not replace screenshot-by-screenshot visual review or real-device interaction testing.
- Follow-up must preserve the currently approved Home black/cyan and Shorts navy/gold designs; no redesign is authorised.

### P1 — Android apps are absent from this source archive

- No `settings.gradle`, Gradle build file, AndroidManifest.xml, APK or AAB was found.
- Mobile PWA settings/pages may exist, but they are not equivalent to native Android Mobile or Android TV/Google TV applications.

### P1 — Build/lint and provider runtime status remain unverified

- The archive has `package.json` and `package-lock.json`, but no `node_modules` was included.
- `npm ci`, `npx tsc`, ESLint and `npm run build` were not run in this isolated audit because dependency installation/build environment was not established here.
- Live Firebase, Google Drive OAuth/resumable upload, Cloudinary moderation, Cashfree sandbox, Monetag/AdSense account approval, Vercel deployment and physical-device playback were not verified.

## 6. Financial and safety controls to preserve

- Creator/Sharer/Platform video revenue split remains 30% / 20% / 50%, calculated using integer paise and verified attribution.
- Teacher referral remains a separate 2% calculation on verified, refund-adjusted platform/admin net profit; it is not a multilevel commission tree and not 2% of gross video sale value.
- Paid-video checkout must remain gated until target-environment payment, webhook, entitlement and refund tests pass.
- Ledger reconciliation must not directly credit wallets or trigger payouts.
- Live payouts remain disabled until settlement implementation, automated tests, manual reconciliation and explicit approval are complete.
- Do not enable bulk video upload until platform readiness has been certified.

## 7. Phase 2 status

**Completed in this checkpoint:** archive integrity, isolated extraction, source/route inventory, package inventory, supplied reference-image inventory, source-path commerce scan and full Node contract test run.

**Still open:** full 40-phase requirements traceability matrix; screenshot-by-screenshot component mapping; detailed per-feature API/Firebase dependency map; full admin RBAC review; profile-wallet field trace; build/TypeScript/ESLint; emulator/provider/device tests.

**Decision:** No source deletion or implementation change is authorised by this audit checkpoint. Proceed to the detailed traceability and dependency map before Phase 3 cleanup.
