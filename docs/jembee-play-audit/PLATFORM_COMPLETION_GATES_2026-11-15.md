# JEMBEE PLAY — Platform Completion Gates
**Created:** 2026-11-15  
**Base:** Native Mobile/TV foundation PR #54 head  
**Purpose:** Finish and verify the web platform, Android Mobile app and Android TV/Google TV app before conducting the consolidated visual/design review.

This is the release execution checklist. A feature is not "ready" because a screen exists: its real API, authorization, failure states, tests and end-to-end behavior must work.

## Release rule
- Do not start bulk video upload or public creator onboarding until the platform readiness gates below pass.
- Do not call a native app complete until real authentication, live catalog/feed, playback and device testing work.
- Do not enable real payouts, settlement, paid checkout or production monetization merely because configuration fields exist.
- Keep secrets server-side. No placeholder media, fake metrics, demo content presented as live content, or invented download links.
- Conduct the full UI/design review only after functional readiness; fix critical accessibility, responsiveness and usability defects before public launch.

## Gate 0 — Build and release controls
- [x] Web TypeScript and Next.js production build passed in PR #54 CI run #3.
- [x] Changed release-critical files ESLint passed in PR #54 CI run #3.
- [ ] Resolve existing full-repository ESLint errors; the current full lint step is informational, not a clean pass.
- [x] Android Mobile and TV debug builds passed in PR #54 CI run #28.
- [ ] Generate signed release APK/AAB with protected signing credentials; verify package IDs, versioning, signing certificate and checksums.
- [ ] Run physical-device QA on at least one Android phone and one Android TV/Google TV device.
- [ ] Merge only reviewed, green, non-draft PRs; verify production deployment and smoke tests after merge.

## Gate 1 — Web platform core
- [ ] Verify public routes, navigation, legal pages, privacy/terms, contact/support, error and empty states.
- [ ] Verify Firebase login, registration, logout, token refresh, revoked-session handling and role-based access on real configured environments.
- [ ] Verify profile, creator identity, upload authorization and account deletion/data lifecycle.
- [ ] Verify responsive layouts and accessibility on mobile, tablet and desktop.
- [ ] Verify production SEO metadata, sitemap, robots, canonical URLs and social preview metadata.
- [ ] Confirm no shopping/MLM flows leak into JEMBEE PLAY; keep JembeeKart separate.

## Gate 2 — Catalog, thumbnails and video delivery
- [ ] Connect Home, Shorts, search, category, creator and learning screens to real approved catalog APIs; remove demo-only content from production paths.
- [ ] Verify pagination/cursors, sorting, filters, deduplication, stale-data handling and rate limits.
- [ ] Ensure visible video cards have thumbnail + essential metadata; retain the latest/visible 4–5 item cache behavior.
- [ ] Verify thumbnail authorization, safe content types, bounded response sizes and correct cache policy.
- [ ] Verify Google Drive ownership/folder checks, metadata, MIME/size checks, byte-range requests, bounded streaming and disconnect/error handling.
- [ ] Test slow networks, interrupted playback, seek, resume, orientation changes and concurrent viewers.
- [ ] Do not download/cache entire videos automatically; full offline downloads must be a separate opt-in feature.
- [ ] Confirm production video storage/streaming capacity and cost limits before bulk uploads.

## Gate 3 — Native Mobile app
- [ ] Integrate Firebase authentication and secure session lifecycle.
- [ ] Replace placeholder shelves/cards with the same authorized live catalog APIs as web.
- [ ] Implement real video player integration, adaptive/appropriate playback behavior, seek/resume and playback error recovery.
- [ ] Implement Shorts feed with current + next four metadata preload, without prefetching full media.
- [ ] Implement Learning, Search, Library, Profile and Creator entry points against real APIs.
- [ ] Add upload flow only after creator authorization, validation, moderation and storage pipeline are verified.
- [ ] Add notification permissions and delivery only after notification backend and preferences are ready.
- [ ] Verify Android back behavior, lifecycle, rotation, network loss, app resume and accessibility.
- [ ] Verify APK install/update/uninstall and minimum supported Android version.

## Gate 4 — Android TV / Google TV app
- [ ] Integrate Firebase authentication with remote-friendly sign-in and session recovery.
- [ ] Replace placeholder shelves with live approved catalog and learning APIs.
- [ ] Implement D-pad focus order, visible focus indicators, back behavior and remote-only operation.
- [ ] Implement TV player controls, seek, pause/resume, subtitles/audio behavior where supported and playback recovery.
- [ ] Test multiple screen sizes, overscan/safe areas, readable typography and 10-foot viewing distance.
- [ ] Verify install, launch, sleep/wake, network recovery and long-session stability on physical TV hardware.

## Gate 5 — Learning discovery
- [ ] Implement Category → Board/Curriculum → School → Class → Subject/Book → Chapter → Question → matching videos.
- [ ] Add search, filters, sorting and pagination/infinite loading at every large-list level.
- [ ] Show all matching free and paid videos together, with clear access labels and teacher/creator attribution.
- [ ] Verify curriculum data quality, duplicate handling, moderation and missing-content states.

## Gate 6 — Creator, moderation and trust
- [ ] Verify creator onboarding, ownership checks, profile and channel pages.
- [ ] Verify upload validation, processing, thumbnail generation, moderation queue, reports, copyright claims and takedown flow.
- [ ] Verify admin review/audit trail and least-privilege role enforcement.
- [ ] Verify user safety controls, comments/likes/reports, blocking and rate limits.
- [ ] Verify abuse/fraud monitoring and operational alerting.

## Gate 7 — Monetization and financial safety
- [ ] Verify each ad provider with approved live test placements and provider-side reporting; distinguish configuration presence from actual ad delivery.
- [ ] Verify consent, privacy, ad placement rules, frequency controls and invalid-traffic safeguards.
- [ ] Verify paid-video Cashfree order creation, signature-verified webhook, payment verification, idempotency, entitlement, playback session, refund/reversal and reconciliation in sandbox before production.
- [ ] Keep paid-video remote kill switch fail-closed until the entire flow is verified.
- [ ] Reconcile only verified ad revenue: Creator 30%, Sharer 20%, Platform 50%.
- [ ] Teacher referral commission remains 2% of verified platform net profit, not gross revenue.
- [ ] Keep live payouts disabled until ledger, reconciliation, refund/chargeback handling, fraud checks and required tests are independently verified.

## Gate 8 — Admin operations and observability
- [ ] Verify system-health diagnostics in production without exposing secrets.
- [ ] Verify remote config authentication, schema validation, audit logs, version conflicts and client safe defaults.
- [ ] Verify maintenance/update controls and ensure each advertised flag is enforced by its backend.
- [ ] Add useful operational logs/alerts for feed, streaming, storage, auth, payment and provider failures.
- [ ] Distinguish configuration checks from end-to-end provider transaction checks and device telemetry.

## Gate 9 — Consolidated visual/design review (after functional gates)
- [ ] Review website Home, Shorts, Watch, Learning, Search, Creator, Profile, Library and Admin on mobile/tablet/desktop.
- [ ] Review Android Mobile and TV navigation, typography, focus, player and responsive behavior on real devices.
- [ ] Compare the experience against the intended premium video-platform quality while retaining JEMBEE branding.
- [ ] Fix inconsistent spacing, typography, card ratios, thumbnails, loading states, skeletons, empty/error states and accessibility.
- [ ] Only after these checks, approve public launch and begin controlled content seeding; bulk upload remains a separate approved operation.

## Current verified baseline (2026-11-15)
- PR #54 web release workflow passed TypeScript, changed-file ESLint and production build.
- PR #54 Android workflow passed remote-config/security contract tests and produced Mobile + TV **debug** APKs.
- PR #54 remains Draft and unmerged.
- Debug APK success does not prove physical-device behavior, signed release readiness, live authentication, real feed/playback or Play Store readiness.
- Current native shells still contain placeholder/sample presentation and are not yet connected to the live end-to-end product experience.

## Execution tracking
For each unchecked item, record: owner, implementation PR/commit, automated test, manual test evidence, environment, date and pass/fail. Never mark a gate complete on the basis of UI presence or configuration presence alone.
