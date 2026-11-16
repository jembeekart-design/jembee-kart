# JEMBEE PLAY — Premium Product Execution Scope
Date: 2026-11-16
Branch: feat/jembee-premium-product-execution-2026-11-16

## Product boundary
JEMBEE PLAY is a premium video, Shorts, creator, teacher and school-learning platform. This scope explicitly excludes MLM, shopping, e-commerce, products, cart, orders, inventory, shipping, seller/vendor journeys, affiliate/downline/sponsor-tree journeys, MLM commission and shopping cashback pages or modules. Do not reintroduce those journeys in navigation, pages, APIs, dashboards or new user flows. Existing data must not be destructively purged as part of UI cleanup; trace dependencies and preserve backups before any migration.

## Experience and quality target
Build to a premium, globally competitive product standard. The aspiration is a product that feels like a carefully engineered multi-crore platform; this is a design/quality target, not a claim about actual cost or valuation.
- Consistent design system: typography, spacing, color tokens, responsive grids, motion, focus states, accessible contrast, skeletons, empty/error/retry states.
- Premium browser experience, separate mobile-first Android app experience, and separate remote-first Android TV/Google TV experience.
- No dead buttons, fake metrics, placeholder-only routes, nonfunctional forms, or sample data presented as real.
- Every page must have a real purpose, connected data/API, authorization, validation, loading/empty/error states, and tests appropriate to the feature.

## Core product areas
1. Home and discovery: featured videos, trending, recommendations, categories, search, continue watching, following, and learning picks.
2. Long-form video: adaptive playback, quality, speed, captions/subtitles where available, like, dislike, share, save, playlists, watch later, comments/replies, follow/subscribe, report, history, continue watching, creator details and related videos.
3. Shorts: vertical swipe feed, autoplay controls, preloading, like/comment/share/save/follow/report, creator attribution, moderation and feed personalization.
4. School learning: board, class, subject, book/edition, cover, chapter, question and multiple teacher video answers; searchable stable IDs and admin-managed catalog. Defer JSON upload complexity; provide a simple admin UI first.
5. Teacher and creator: profiles, verification, upload, moderation status, analytics, content management and reputation.
6. Teacher ratings/reviews: 1–5 star ratings, written reviews, eligible learner checks, one review per eligible interaction according to policy, edit/report/moderation, anti-spam/abuse controls, aggregate rating and audit trail.
7. Notifications: in-app plus automated email and WhatsApp Business notifications for relevant account, teacher, content and moderation events. Require consent/opt-in, verified destination, approved WhatsApp templates, preferences, idempotency, rate limits, retries, delivery webhooks/logs, opt-out and admin controls. Never claim delivery until provider confirms it.
8. Advertising: configurable compliant ad placements and frequency controls; ads must not break playback or misrepresent availability.
9. Admin Control Center: mission control, users/roles, creators, teachers, video/Shorts moderation, media library, learning catalog, reviews, notification templates/delivery, ad manager, analytics, feature flags, SEO, system health, security and audit logs.
10. Native mobile and TV apps: separate navigation and interaction patterns; do not claim native app readiness without source, builds and device tests.

## Engineering and safety requirements
- Keep Firebase Auth, Firestore and Storage rules least-privilege; enforce authorization server-side for sensitive actions.
- Preserve existing video documents, Google Drive files and media URLs; do not bulk migrate or re-upload without an approved plan.
- Maintain moderation gates: only approved, active and safe videos are publicly discoverable.
- Protect private/paid content using server-side access checks if such features remain enabled in the current product; fail closed when entitlement is uncertain.
- Use secure secret management; never commit credentials or service-account keys.
- Notifications must be consent-aware, auditable and provider-confirmed.
- Teacher ratings must be resistant to self-rating, duplicate accounts, review bombing and unverified reviews.
- Do not remove legacy fields or data until all readers/writers, rules, jobs and migration impact have been audited and backups verified.

## Execution order
1. Baseline inventory: current default branch, recent PR/deployment state, routes/pages/APIs, components, Firestore/Storage rules, indexes, tests, environment-variable names (never values), existing design-system tokens and known production/staging differences.
2. Route and feature audit: classify each page as functional, partial, placeholder, duplicate, broken or out of scope. Map every visible action to handler/API/data.
3. Shopping/MLM scope audit: identify residual routes, links, labels, API modules and imports; remove from user-facing scope only after dependency review. Preserve unrelated video creator/teacher functionality.
4. Premium design system and key surfaces: Home, long-video watch, Shorts, learning discovery, teacher profile and Admin Control Center.
5. Functional gaps: long-video engagement actions; teacher rating/review workflow; notification orchestration; complete learning catalog CRUD and teacher/student linking.
6. Dummy-page remediation: implement, redirect to a meaningful destination, or remove safely; never leave fake data/actions.
7. Tests and release: typecheck, lint, unit/contract tests, Firebase Emulator rules tests, build, browser/device checks, staging integration and production readiness review.

## Acceptance criteria
- Public Home feed loads approved, active, safe existing videos and reports actionable errors.
- Long-video like/dislike/share/save/playlist/comment/follow/report actions persist and respect authorization.
- Teacher ratings and reviews are restricted to eligible learners and have abuse/report/moderation controls.
- Email/WhatsApp workflows use verified provider integrations, persisted consent/preferences, delivery status and retry handling.
- All in-scope pages are functional, responsive, accessible and tested; no fake metrics or inert controls.
- Admin operations are role-protected and audited.
- No Shopping/MLM pages or new flows appear in the JEMBEE PLAY product.
- Build, lint, typecheck, tests and staging smoke tests pass before release claims.
- A feature is marked complete only with code evidence and verification results; a branch/PR alone is not a production deployment.
