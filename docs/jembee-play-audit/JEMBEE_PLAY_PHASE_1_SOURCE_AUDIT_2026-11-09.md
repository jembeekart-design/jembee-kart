# JEMBEE PLAY — Phase 1 Source ZIP Audit

**Audit date:** 09 November 2026  
**Audit status:** `IN_PROGRESS` (static source audit completed; build/runtime/provider/device verification remains blocked)  
**Source archive:** `JembeeKart-main.zip` (downloaded from the repository's `main` branch)  
**Requirements source:** `JEMBEE_PLAY_Master_Plan_With_Reference_Images.docx`  
**Reference pack:** `JEMBEE_PLAY_Master_Plan_Image_Pack.zip`

## 1. Scope and handling

The source ZIP and reference-image ZIP passed archive integrity checks. The Word requirements document contains 14 pages. The reference pack contains five original screenshots. The source ZIP was extracted into an isolated audit workspace; **no project source files were changed**.

The Master Plan defines Phase 1 as source inventory and audit (routes, APIs, Firebase, Drive, dependencies, environment, tests and known defects), followed by a separate Phase 2 image-to-component/acceptance-test mapping. This report records static evidence and early cross-checks. It does not certify production readiness.

## 2. Source inventory

| Area | Static inventory |
|---|---:|
| Files in extracted project | 389 |
| Next.js page route files | 58 |
| API `route.ts` files | 58 |
| Node `.test.mjs` files run | 22 |
| Native Android Gradle/manifest files | 0 |
| `.env*` files in archive | 0 |
| `.env.example` template | Not present |
| Service-account / PEM / private-key files by filename | None found |

### Main stack in `package.json` / lockfile

- Next.js `16.2.9`
- React `19.2.7` (React DOM `19.2.4`)
- Firebase Web SDK `12.13.0`
- Firebase Admin SDK `13.4.0`
- TypeScript `6.0.3` (locked dev dependency)
- Node/npm available in this audit runtime: Node `v22.16.0`, npm `10.9.2`

### API route groups (58 total)

| Group | Count |
|---|---:|
| admin | 23 |
| shorts | 14 |
| creator | 7 |
| monetag | 4 |
| auth | 3 |
| profile | 2 |
| webhooks | 1 |
| payments | 1 |
| videos | 1 |
| cloudinary | 1 |
| ads | 1 |

### Existing integrations visible in source

- Firebase Authentication, Firestore, Storage rules and Admin SDK.
- Google Drive OAuth, resumable upload and server-side streaming/thumbnail routes.
- Cloudinary moderation webhook/signature route.
- Cashfree paid-video order, verification, webhook, playback-session and refund reconciliation routes.
- Shorts likes/comments/reports/share attribution/notifications.
- Monetag API/reporting and video-floating-ad paths.

These are source-level findings only. No live Firebase, Drive OAuth, Cloudinary webhook, Cashfree sandbox or deployment credentials were available for runtime verification.

## 3. Confirmed positives / preserved safety

1. **Feed eligibility:** `src/lib/videos/watch-earn/fetchWatchVideos.ts` queries `watchEarnVideos` for `status=approved`, `active=true`, `moderation=safe`, `videoAccess=free`, ordered by `createdAt`, limit 50. The default Firestore rule set also denies unspecified writes.
2. **Paid playback gate:** paid stream and thumbnail endpoints validate the short-lived video-scoped playback cookie and the matching paid, non-revoked purchase before serving protected media.
3. **Drive streaming:** the stream endpoint supports byte ranges and caps each ranged response to 8 MiB. Drive file parent, MIME type and file metadata are checked server-side.
4. **Video monetization ledger:** the code calculates creator 30%, sharer 20% and platform remainder in integer paise; unverified sharer attribution is not treated as a verified sharer. Teacher referral is a separate 2% calculation over verified, refund-adjusted admin net profit.
5. **Payout safety:** ledger records use `pending_settlement` states. The payout review page and tests state that these records do not directly credit wallets or trigger payouts. Live payouts must remain disabled until settlement/reconciliation tests and sign-off.
6. **Secret hygiene scan:** no `.env` files, service-account credential files, PEM files or common private-key/token patterns were found in the archive. The real Firebase/Drive/Cashfree credentials are not included (which is correct for a source ZIP).

## 4. Confirmed requirements-to-source discrepancies

### P1 — Home feed is still demo content

**Source:** `src/app/page.tsx`

- The page declares a fixed local `videos` array with demo creators, sample metrics and remote Unsplash thumbnails.
- Category chips are fixed in source.
- Cards link to `/shorts` rather than a video-specific watch route.
- The page labels the cards “Sample preview cards until live feed integration is verified”.

**Plan expectation:** production feed data from Firebase/API; recommended/trending/latest/popular/continue-watching/education/creator sections, and admin-controlled section order/visibility.

**Status:** mismatch confirmed. No conversion to live feed was made.

### P1 — Shorts tabs and bottom navigation do not match references

**Source:** `src/app/shorts/page.tsx`, `src/app/videos/components/ProductionHeader.tsx`, `src/app/videos/components/BottomQuickActions.tsx`, `src/app/videos/page.tsx`

- `/shorts` fixes `activeTab` to `"foryou"`; the page does not expose a state setter or tab controls. Header has search/friends/notifications but no For You/Following tabs.
- Bottom bar currently shows **Home / Explore / Upload / Share / Profile**. Reference 4/5 and the Master Plan call for **Home / Explore / Upload / Earn or Rewards / Profile**.
- Bottom bar Home navigates to `/videos`; `/videos` redirects to `/shorts`. Thus the current Home item returns the user to Shorts rather than the home video feed.

**Status:** discrepancies confirmed.

### P1 — Options sheet is incomplete relative to Reference 3

**Source:** `src/app/videos/components/ShortsMenuSheet.tsx`, `VideoActions.tsx`

Existing sheet actions include Interested, Not interested, Save, Playback speed, Why you're seeing this post and Report. Share is available as a separate right-side action, but is not in the sheet. No Block channel action/handler is present in these components. Save state in `VerticalVideoFeed.tsx` is held in local React state (`savedVideos`) and is not persisted to a user library in the inspected component.

The Options sheet is positioned 150 px above the viewport bottom, which appears intended to leave space for the navigation bar. Actual on-device layering/visibility has not been verified because no runtime/device session was run.

**Status:** missing menu actions and non-persistent save are source-confirmed; visual stacking is not yet runtime-verified.

### P1 — Thumbnail and metadata preload contract is inconsistent

**Source:** `src/app/videos/components/VerticalVideoFeed.tsx`, `VideoPlayer.tsx`, `__tests__/video-preload-cache.test.mjs`

- Current code preloads thumbnails for the active item and next four items.
- Current `VideoPlayer` metadata preload prop is true only for the active video, not the same five-card window.
- A repository test explicitly expects metadata preload for the active and next four videos; that assertion fails against current source.
- No dedicated test/evidence was found for preloading only the initial media segment on tap. Full-video auto-download is not used by this preload path.

**Status:** confirmed source/test mismatch. The one failing test is recorded in Section 7.

### P1 — School Learning catalog is demo-only, not Firestore-backed

**Source:** `src/app/learn/school/page.tsx`, `src/app/admin/education/schools/page.tsx`

- Board, school, class, subject, chapter, question and video-answer records are hardcoded local arrays/objects.
- The flow combines Subject/Book into one stage rather than a separately modeled Book level.
- Four displayed video answers are demo records.
- The school admin form explicitly says production save is not connected and does not save/publish the school.
- No School/Education/Book/Chapter/Question CRUD API routes were found under `src/app/api`.

**Plan expectation:** normalized hierarchy with stable IDs, admin CRUD, validation, search/pagination, teacher mapping and approved lesson-to-question associations.

**Status:** mismatch confirmed.

### P1 — Admin ad slots are not connected to a live placement renderer

**Source:** `src/components/admin/AdNetworkManager.tsx`, `AdSlotManager.tsx`, `src/components/ads/ExternalAdSlot.tsx`, `src/app/api/videos/video-ads/route.ts`, `src/components/MonetagScriptGate.tsx`, `src/app/layout.tsx`

- Admin UI can save `adSlots` and `adNetworks` records.
- `ExternalAdSlot` loads a slot/network but returns an `AdSlotPlaceholder`; its source comment says live slot rendering is a future update. No app usage of `ExternalAdSlot` was found.
- The public Shorts floating-ad API reads `business_rules/videoAds` and enabled `watchEarnFloatingAds` documents, not the general `adSlots` collection.
- The layout includes the AdSense client script, and a separate global gate may load Monetag's script when its admin status endpoint enables it.
- Ad network choices in the manager are GAM, AdSense Auto and AdSense Manual; Adsterra is not present in this selector.

**Plan expectation:** admin-configured placements across Home/Watch/Shorts/category/Education etc., with network policy and format restrictions respected.

**Status:** general manual slot-to-live-renderer integration not demonstrated; Adsterra configuration absent in inspected selector. Do not enable or claim any new network integration on this evidence.

### P1 — Mobile app settings do not map to a native Android build

**Source:** `src/app/admin/mobile-app/page.tsx`, `firestore.rules`

- A Mobile App Control web admin page exists, but no native Android Gradle project, manifest or build wrapper is present in the ZIP.
- The page writes `admin_settings/mobile_app` directly from the client.
- Firestore rules only allow admin writes to `admin_settings/customize`; `admin_settings/mobile_app` is not allowed by that rule. The current client write is therefore expected to be denied by these rules.

**Plan expectation:** separate Android Mobile and Android TV/Google TV video-first apps, with real builds and device/emulator validation.

**Status:** native app build absent; admin settings path/rules mismatch confirmed by static inspection.

### P2 — Revenue split base needs a signed-off definition

**Source:** `src/lib/server/paidVideoRevenueSplit.mjs`, Cashfree webhook and paid-video verification routes.

The split helper receives the complete verified payment amount in paise and applies 30/20/50 to that amount. The Master Plan says the split applies to an **Eligible Net Revenue Base**, and says taxes, fees, refunds, attribution window and invalid traffic rules must be explicitly defined/versioned before implementation.

**Status:** calculation math exists, but the inspected split helper does not itself subtract provider fees/taxes or version a net-revenue-base policy. The eligible base and calculation snapshot rules need a business decision and implementation review before financial sign-off. Keep payouts disabled.

### P2 — Local setup template missing

**Source:** `README.md`, `FIREBASE_CONNECT_BEFORE_LIVE_FEED.md`, root file inventory.

Documentation instructs developers to copy `.env.example`, but there is no `.env.example` in the archive. Real environment credentials are absent, as expected. A safe placeholder template is still needed for setup (without real secrets).

## 5. Reference image mapping — static pass

| Reference | Intended page/component | Observed source state | Result |
|---|---|---|---|
| Ref 1 — Home Video Feed + Watch page | `/` and video watch route | Home has demo feed; every card links to `/shorts`; dynamic original-video route exists but is not used by these cards | Mismatch |
| Ref 2 — Shorts vertical feed | `/shorts`, `ProductionHeader`, `VerticalVideoFeed`, `BottomQuickActions` | Main vertical feed exists; no interactive For You/Following controls; current bottom item is Share not Earn/Rewards | Partial |
| Ref 3 — Options sheet | `VideoActions`, `ShortsMenuSheet` | 6 of the expected menu actions are present; Share and Block channel are absent from the sheet | Partial |
| Ref 4 — Before/After navigation | `BottomQuickActions`, `ShortsMenuSheet` | Bottom bar is rendered separately from sheet; Home route loops back to Shorts and nav label Share differs from Earn | Mismatch |
| Ref 5 — Second Before/After comparison | Same as Ref 4 | Same route/label mismatch; no runtime screenshot to verify exact layering | Mismatch / visual test pending |

The Master Plan itself states that School Learning and Android TV final reference screenshots were not in the image pack. Their pixel-level visual audit cannot be marked verified until the missing screenshots are supplied.

## 6. Phase 1 integration/security notes

- Firebase project alias in `.firebaserc` is `production`; the ZIP contains no web/Admin SDK secrets.
- Firestore and Storage rules are included. The Storage rules deny all unspecified paths and tightly scope invoice evidence creation to admins and verified paid orders.
- Google Drive OAuth documentation describes AES-256-GCM encrypted refresh-token storage and requires a server-side encryption key; this was not live-tested.
- The paid-video stream route checks approved/active/safe status, Drive folder membership, video MIME type, byte ranges and paid purchase entitlement.
- No production Firebase/Drive/Cashfree test was possible from this archive alone.

## 7. Test and build verification

### Node contract/unit tests

Command executed:

```bash
node --test $(find src -name '*.test.mjs' -print | sort)
```

Result: **72 subtests — 71 passed, 1 failed.**

Failing subtest:

`feed limits video metadata preload to the same five-card window`

The test expects `preloadMetadata` to be true for the active and next four videos. The current `VerticalVideoFeed.tsx` source only sets it true for `activeVideoId === video.id`.

### Build / lint / TypeScript

- `npm ci --no-audit --no-fund` was attempted but timed out after the available command window; only a small partial `node_modules` directory was created.
- `next`, local `tsc` and `eslint` binaries were not available after that attempt.
- Next.js production build, TypeScript check and ESLint were therefore **not run / not verified**.
- Firebase Emulator rules tests, live integration tests, browser UI tests and Android/TV device tests were not run.

The README's historical statement that 68 tests passed is not the current result of this audit run. The current execution found 72 subtests and one failure.

## 8. Phase 1 status and next work

**Phase 1: `IN_PROGRESS` — static inventory and key source checks complete; full verification remains blocked.** It is not `VERIFIED_LOCKED`.

Next sequence according to the Master Plan:

1. Complete the Phase 1 build/typecheck/lint run once dependency installation succeeds; add Firebase Emulator and provider tests where test credentials/emulators are available.
2. Complete Phase 2 by mapping each screenshot to exact component/acceptance tests and recording all discrepancies with IDs.
3. Resolve user-visible decisions before Phase 3 cleanup or UI changes (especially bottom-nav Earn destination, Options sheet Share/Block behavior, ads network/placement policy and eligible net-revenue base).
4. Preserve current working video upload, moderation, Drive and paid-playback protections while implementing approved gaps.
5. Keep live payouts disabled until ledger, refund, settlement, reconciliation and required tests are verified and explicitly signed off.

**No code changes, deployments, Firebase writes, payment changes or payout enablement were performed during this audit.**
