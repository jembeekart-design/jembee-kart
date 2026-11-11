# JEMBEE PLAY — Master Plan Delivery Matrix (Hindi)

**Checkpoint:** 09 November 2026  |  **Source:** Video-Only source archive and supplied Master Project Plan v1.0

यह matrix plan के 19 phases को वर्तमान source और इसी checkpoint पर चलाए गए tests से map करती है। `PARTIAL` का अर्थ है कि कुछ source/tests मौजूद हैं, पर phase की पूरी Definition of Done अभी पास नहीं हुई।

| Phase | Scope | स्थिति | प्रमाण / अगला जरूरी काम |
|---:|---|---|---|
| 1 | Source ZIP/GitHub audit | **STATIC AUDIT COMPLETE; GitHub write blocked** | Source inventory, route/API scan, Firebase/Drive/payment/static checks recorded. No GitHub branch or push was possible due integration 403. |
| 2 | Reference mapping | **MAPPING COMPLETE FOR 5 PROVIDED IMAGES** | Five supplied Home/Watch and Shorts references mapped to routes/components and acceptance findings. School and Android TV final visual references were not supplied. |
| 3 | Architecture and cleanup | **PARTIAL** | Separate Video-Only source boundary and legacy commerce/MLM active-route cleanup are present. Full architecture refactor, Next build and regression gate remain incomplete. |
| 4 | Authentication, roles, profiles, navigation | **PARTIAL** | Video-only profile/signup contract tests pass and legacy sponsor capture is removed. Full role matrix, redirect, deep-link and live auth tests remain. |
| 5 | Home feed, player, categories, search, history | **PARTIAL** | Video UI/routes exist. Production Firebase feed composition, admin ordering, pagination, comprehensive search and playback/device verification remain. |
| 6 | Shorts feed, options, bottom navigation, moderation | **PARTIAL** | Feed and 5-card thumbnail/metadata preload contracts pass. Reference gaps remain for visible For You/Following, bottom-nav behavior, persisted Save and complete Options actions. |
| 7 | Upload, thumbnail, cache, lightweight preload, playback | **PARTIAL** | Google Drive upload integration and video flow exist; five-card cache tests pass. Full initial-segment preload, slow-network/device tests and complete end-to-end upload verification remain. |
| 8 | School Learning hierarchy and Admin CRUD | **NOT COMPLETE** | Catalog and school UI have demo/static elements; production-backed Board/School/Class/Book/Subject/Chapter/Question CRUD, search and pagination are not verified. |
| 9 | Creator dashboard and analytics | **PARTIAL** | Creator/video profile and admin analytics routes exist. End-to-end metrics correctness and production analytics source are not verified. |
| 10 | Teacher verification, lesson mapping, 2% referral ledger | **PARTIAL** | Teacher referral calculator and reconciliation contracts pass. Verification workflow, education mapping and manual ledger reconciliation remain. |
| 11 | Sharer attribution and referral dashboard | **PARTIAL** | Authenticated share token/claim contracts exist and pass. Full attributed-view lifecycle, reporting dashboard and real abuse/fraud tests remain. |
| 12 | Settlement engine 30/20/50, ledger, refunds, tests | **PARTIAL; PAYOUTS DISABLED** | Allocation/refund/idempotency contract tests pass. Production eligible revenue base, manual reconciliation sign-off and payout tests remain; no live payouts. |
| 13 | Ad manager and approved network integrations | **NOT COMPLETE** | Existing Monetag-specific controls remain. Admin-only manual Banner/Native policy, network approval, provider wiring and placement renderer are not verified; Popunder/Social Bar/forced redirects must stay off. |
| 14 | Social features, notifications, moderation | **PARTIAL** | Likes/comments/reports/follows/notifications and moderation routes are present. Persistent Save/Block behavior and full role-security test matrix remain. |
| 15 | Admin control panel and audit logs | **PARTIAL** | Admin surfaces exist. Some Firestore/API authorization mismatches and end-to-end audit-log coverage remain open. |
| 16 | Android Mobile app and device testing | **NOT STARTED IN THIS SOURCE** | No native Gradle project, AndroidManifest, APK or AAB was present in the supplied source. A separate video/Shorts/Learning mobile app must be built and device-tested. |
| 17 | Android TV/Google TV app, remote, focus, casting | **NOT STARTED IN THIS SOURCE** | No native TV Gradle project or TV UI was present. TV-specific Home/player/search/profile, D-pad focus, remote and casting require implementation and device/emulator tests. |
| 18 | Security, performance, accessibility, regression | **PARTIAL** | 79 Node contract tests pass and server-side paid-video checks exist. Firebase Emulator, TypeScript, ESLint, Next build, accessibility, load/device and live integration testing remain. |
| 19 | Release packaging, deployment checklist, docs | **SOURCE PACKAGE PREPARED; RELEASE NOT READY** | Clean Video-Only source, master plan, five reference images, audit matrix and test evidence are packaged. Production build/deployment and external service/device gates remain. |

## Release gates — अभी बंद रखें

1. **Live creator payouts:** बंद रहें। Ledger tests pass होना live payout approval नहीं है। Manual reconciliation, production settlement verification और explicit sign-off बाकी हैं।
2. **Paid-video checkout:** target Firebase/Cashfree environment में webhook signature, amount/currency, entitlement, playback session और refund reconciliation verify होने तक deployment feature flag बंद रखें।
3. **Ads:** user-approved policy के अनुसार केवल Admin-selected Banner/Native placement को network policy और account approval के बाद चालू करें। Popunder, Social Bar, forced redirect और autoplay/forced ad navigation नहीं। मौजूदा Monetag code को Adsterra implementation न मानें।
4. **Firebase data:** पुराने historical user, commerce, payment और Drive records को source cleanup के नाम पर delete/migrate न करें। अलग backup, migration plan और explicit approval जरूरी है।
5. **Secrets:** `.env`, service-account JSON, private keys, provider tokens या real OAuth refresh token ZIP/Git में न रखें।

## Test और environment result

- Node.js: `v22.16.0`
- Test files: `23`
- Test cases: **79 passed, 0 failed** (`node --test` over all `*.test.mjs` / `*.spec.mjs` under `src`)
- ZIP/source secret scan: कोई `.env*` populated secret file, Firebase service-account JSON, PEM या P12 file इस package में शामिल नहीं की गई।
- npm registry request: `EAI_AGAIN getaddrinfo registry.npmjs.org` — dependency install blocked by DNS/network in this execution environment.
- `node_modules/next/dist/docs` उपलब्ध नहीं है; project `AGENTS.md` के अनुसार Next.js source change से पहले installed Next.js version की local guide पढ़ना अनिवार्य है। इसलिए TypeScript, ESLint और Next.js production build को PASS नहीं कहा जा सकता।
- Firebase Emulator/live Firebase, Google Drive OAuth, Cashfree sandbox/webhooks, ad network approvals, Android emulator/physical devices: इस checkpoint पर run नहीं हुए।

## Package integrity

- Source tree: `JEMBEE_PLAY/`
- Original Master Plan: `docs/jembee-play-audit/reference-inputs/JEMBEE_PLAY_Master_Plan_With_Reference_Images.docx`
- Five original reference images: `docs/jembee-play-audit/reference-inputs/reference_images/`
- Release verification command: `bash scripts/verify-release.sh` (Node 22 + npm registry access required)

**Overall:** यह tested source-and-documentation package है, Production Ready release नहीं। Phases 8, 13, 16 और 17 अभी स्पष्ट रूप से अधूरे हैं; कई अन्य phases partial हैं।
