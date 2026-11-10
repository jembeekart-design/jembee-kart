# JEMBEE PLAY — Phase 3 Architecture & Cleanup Map

**Date:** 09 November 2026  
**Status:** `IN_PROGRESS` — architecture assessment completed and narrow video-only source cleanup applied in the separate cleaned archive; release/build verification remains blocked.  
**Baseline:** `JembeeKart-main.zip`, repository `jembeekart-design/jembee-kart`, branch `main`.  
**Requirements:** `JEMBEE_PLAY_Master_Plan_With_Reference_Images.docx`.

## 1. Phase 3 outcome

The supplied archive is described by its integration manifest as a **JEMBEE PLAY video platform only** and says legacy non-video commerce/network-management modules were removed. A second targeted scan found residual registration profile fields and several shopping-themed admin/UI examples; these were removed or re-labelled in the separate cleaned source copy. Exact changes are recorded in `VIDEO_ONLY_SCOPE_CLEANUP_2026-11-09.md`. The top-level Next.js route tree contains video, Shorts, Learning, account, legal and admin routes; it does not contain dedicated shopping routes such as `/products`, `/cart` or `/checkout`. The source-level boundary is therefore substantially video-first already.

No broad deletion or rewrite is justified from static evidence. The safe Phase 3 decision is:

- Keep the current video, Shorts, moderation, Drive, paid-video, settlement, referral, profile, Firebase and admin foundations until each dependent route/test has been mapped.
- Do not reintroduce JembeeKart shopping, product selling or MLM screens in JEMBEE PLAY.
- Do not remove historical Monetag integration code merely because the ad policy is under review; first implement and verify a replacement placement adapter, then separately approve decommissioning.
- Keep Mobile and Android TV as separate future video/Shorts/Learning app targets. The current archive contains no native Android project.
- Apply narrow server-side fixes for admin settings, saved videos and creator blocking; do not loosen Firestore rules globally.

## 2. Architecture map from the archive

| Layer | Existing source locations | Current evidence | Phase 3 direction |
|---|---|---|---|
| Web routes and UI | `src/app/`, `src/components/`, `src/hooks/` | Next.js App Router with Home, Shorts, Explore, Learning, account, admin and video routes | Retain route structure; fix canonical navigation and replace demo-only areas incrementally |
| Shorts feed/player | `src/app/shorts/`, `src/app/videos/components/`, `src/app/videos/services/` | Approved feed service, full-screen player, action rail, comment drawer, ad/reward overlays | Retain; add explicit tab state, persistence and reference-matched action sheet; preserve paid gating |
| Firebase client | `src/firebase/config.ts`, `src/firestore/`, `src/lib/videos/watch-earn/` | Firebase Web SDK; local preview fallback is deliberately non-production | Keep preview fallback clearly separated from production; require actual env values for live use |
| Firebase server | `src/firebase/admin.ts`, `src/lib/server/`, API route handlers | Admin SDK and server-side token verification exist | Keep all privileged writes on verified server endpoints; default-deny Firestore rule remains |
| Video storage | `src/lib/googleDriveOAuth.ts`, `src/lib/googleDriveTokenStore.ts`, `src/services/googleDriveService.ts`, upload/stream/thumbnail APIs | Google Drive OAuth/token encryption and streaming/thumbnail path are present | Preserve. Test OAuth, resumable upload, range streaming, MIME checks and token rotation before changes |
| Moderation/social | `src/app/api/shorts/`, `src/lib/videos/watch-earn/` | Likes, comments, reports, preferences, share attribution and notifications present | Reuse existing services; add missing block-channel flow with user-scoped server persistence |
| Paid video/payment | `src/app/api/shorts/paid-video/`, `src/app/api/payments/`, `src/lib/payments/` | Cashfree checkout, webhook, entitlement and short-lived playback session paths present | Preserve and regression-test. Fail closed on entitlement uncertainty |
| Revenue/settlement | `src/lib/server/paidVideoRevenueSplit.mjs`, refund reversal and teacher commission helpers; admin settlement APIs | 30/20/50 allocation, teacher 2% calculator, refund reversal and ledger contract tests exist | Preserve ledger semantics; do not issue wallet credits or enable live payouts without sign-off |
| Ads | `src/components/admin/AdNetworkManager.tsx`, `AdSlotManager.tsx`, `src/components/ads/ExternalAdSlot.tsx`, `src/app/api/videos/video-ads/` | Admin slots/network records exist; generic slot component is placeholder/not wired in audited UI; Shorts floating-ad route is a distinct path | Introduce a policy-compliant provider/placement adapter only after provider approval and test. No popunder, forced redirect or automatic placement |
| School Learning | `src/app/learn/school/`, `src/app/admin/education/schools/` | Current catalog and school admin workflow are demo/static; no hierarchy CRUD API routes found | Build normalized catalog and admin APIs as a dedicated workstream; no demo record may be represented as production data |
| Native apps | No Gradle wrapper, Gradle build files or `AndroidManifest.xml` in archive | No native Mobile or TV project found | Create separate Mobile and TV deliverables; do not treat web pages as installable native apps |

## 3. Cleanup boundary check

### 3.1 No deletion approved

The project manifest says legacy commerce/network-management routes have already been removed. Static top-level routes are:

`account`, `admin`, `api`, `contact`, `explore`, `followers`, `learn`, `login`, `privacy`, `profile`, `refund-policy`, `shorts`, `signup`, `terms_conditions`, `verify-email`, `videos`.

No dedicated product catalogue/cart/shopping checkout route is present in `src/app`. Some files contain words such as `product` in descriptive/business context; keyword matches alone are not proof of shopping functionality and are not grounds for deletion.

### 3.2 Preserve these existing capabilities

- Firebase Authentication, Admin SDK and default-deny Firestore rules.
- Google Drive OAuth, encrypted refresh-token storage, video upload, streaming and thumbnails.
- Moderation approval/safe/active gates and public feed filtering.
- Paid-video entitlement, Cashfree webhook verification, playback session/cookie and refunds.
- Social interactions, notifications, report handling and share-attribution claim flow.
- Integer-paise 30/20/50 revenue allocation, teacher referral calculator and refund reversal ledger.
- Admin expense evidence workflow and its private Storage restrictions.

### 3.3 Potential cleanup only after replacement is proven

- Legacy ad provider scripts/configs: keep disabled or gated until a policy-reviewed replacement is integrated and the user explicitly approves removal.
- Static sample Home and School Learning data: replace with API-backed data; do not just delete the routes or render an empty blank page.
- Duplicated/legacy admin screens: inventory consumers, APIs and tests before removal.

## 4. Confirmed integration/security gaps to fix

| ID | Severity | Evidence | Required safe correction |
|---|---|---|---|
| A-01 | High | `src/app/admin/mobile-app/page.tsx` reads/writes `admin_settings/mobile_app` from the client; `firestore.rules` permits admin writes only to `admin_settings/customize` | Route settings through a new authenticated Admin SDK API; do not broaden client Firestore writes |
| A-02 | High | `src/lib/videos/watch-earn/saveVideo.ts` writes `savedWatchVideos` directly from client; `firestore.rules` has no allow rule for this collection and ends with deny-all | Add a verified server API for save/unsave or a narrowly scoped, schema-validated rule after threat review; wire Shorts save to persisted result |
| A-03 | High | Shorts Save in `VerticalVideoFeed.tsx` only toggles React state; profile watch-data already reads `savedWatchVideos` | Make Shorts and Profile use one persisted saved-video source; handle paid/private videos safely |
| A-04 | High | No user/channel block relationship, block API or unblock management surface found; `blockSponsoredVideo` applies only to sponsored ads | Design a user-scoped blocked-creator model, admin/server validation, feed filtering and unblock UI before adding the menu item |
| A-05 | Medium | `/admin/mobile-app` page is a web control surface only; no native build artifacts exist | Do not advertise app settings as a published native app until Mobile/TV builds and release test plans exist |
| A-06 | Medium | `src/services/aiModerationAdapter.ts` reads `NEXT_PUBLIC_AI_MODERATION_KEY`; adapter is currently a stub and comments out external API invocation | Never put a private provider key in a `NEXT_PUBLIC_` variable; move a real provider request to server-only code if/when implemented |
| A-07 | Medium | No `.env.example` in source archive; Firebase config falls back to local preview placeholders | Add a documented variable template with empty placeholders only; never include credentials/token values |
| A-08 | Medium | `src/app/admin/mobile-app/page.tsx` swallows load/save errors to console; save uses an alert only | Add visible, actionable error/success status when the Admin API is corrected |

## 5. Environment contract discovered by static scan

The archive references these environment names. This is an inventory, **not** an assertion that each integration is fully configured or currently used in production:

- Public Firebase config: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`.
- Server Firebase Admin: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_STORAGE_BUCKET`, `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS`.
- Google Drive: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`, `GOOGLE_OAUTH_REFRESH_TOKEN`, `GOOGLE_OAUTH_TOKEN_ENCRYPTION_KEY`, `GOOGLE_DRIVE_FOLDER_ID`.
- Cashfree/paid playback: `CASHFREE_PAYMENTS_ENABLED`, `CASHFREE_CREDENTIALS_ENCRYPTION_KEY`, `SHORTS_PAID_VIDEO_CHECKOUT_ENABLED`, `PLAYBACK_TOKEN_SECRET`.
- Cloudinary/moderation: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_SIGNED_UPLOAD_PRESET`, `CLOUDINARY_WEBHOOK_API_SECRET`, `MODERATION_PREVIEW_TOKEN_SECRET`.
- Ads/app runtime: `MONETAG_API_TOKEN`, `MONETAG_SITE_URL`, `NEXT_PUBLIC_APP_URL`, `VERCEL_URL`, `NODE_ENV`.
- `NEXT_PUBLIC_AI_MODERATION_KEY` is referenced by a stub adapter. Treat it as client-exposed if configured; do not place private API secrets there.

## 6. Recommended implementation order after Phase 3

1. **Build environment and baseline:** install locked dependencies; read the installed Next.js 16 docs required by `AGENTS.md`; capture successful TypeScript/lint/build baselines.
2. **Admin settings security:** add the Mobile App settings API, server-side admin verification, and route contract tests.
3. **Shorts interaction integrity:** visible For You/Following tabs; Home route correction; Earn/Rewards tab to Reward Center only after its displayed balance is confirmed server-backed; persisted Save; Share inside the options sheet; then design Block channel.
4. **Preload/cache:** align metadata preload to the active+next-four approved/authorized cards; retain thumbnail cache; verify no whole-file fetch; implement tap-only first-segment warm-up and low-memory invalidation tests.
5. **Home feed:** replace local sample list with approved API feed; stable video IDs and watch route; categories/section configuration from admin-backed data.
6. **School Learning:** normalized Board/School/Class/Subject/Book/Chapter/Topic/Question IDs, CRUD APIs, validation, search/pagination and approved lesson mapping.
7. **Ads:** network-neutral, manually configured placements; policy review and provider sandbox; keep paid learning and child-directed defaults protected.
8. **Mobile/TV:** separate native app projects and platform-specific tests, not reuse a shopping web container.
9. **Regression/security/release:** all role rules, payment/refund/settlement, accessibility, performance, emulator/device tests, secret scan and release archive.

## 7. Phase 3 status

**`IN_PROGRESS`**. Architecture boundaries are documented. A narrow source cleanup was applied to the separate cleaned archive: new profile creation, signup/login, unused multi-level registration helpers, admin theme/audiences/roles/support/settings, old shopping redirects and Shorts metadata preload. The original uploaded ZIP remains unchanged. The 79 Node contract tests pass.

The repository `AGENTS.md` requires reading the installed Next.js guide before Next.js edits. The installed `next` package and its local guide were unavailable because dependency installation did not complete. The cleanup touched the create-profile Route Handler but did not add new Next.js APIs; production build/typecheck/lint remain unverified and are a release blocker.

**No external services were mutated. No Firebase rules were deployed. No live payouts or ad providers were enabled. GitHub branch/commit/push remains blocked by the integration 403.**
