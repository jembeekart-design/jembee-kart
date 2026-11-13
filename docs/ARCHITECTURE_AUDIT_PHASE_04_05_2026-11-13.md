# JEMBEE PLAY — Phase 04–05 Repository & Architecture Audit

**Audit date:** 2026-11-13  
**Scope:** Uploaded source archive `JEMBEE_PLAY_LATEST_SOURCE.zip` and the remediation workspace derived from it.  
**Mode:** Read-only architecture audit plus documentation. No source modules were moved and no external repository/deployment was changed.

## 1. Executive result

The application package is named `jembee-play`, but the uploaded source directory is `jembee-kart-main`. The archive has no `.git` metadata, so its exact remote, branch, commit ancestry, and GitHub linkage cannot be proven from this copy. A GitHub repository-name search for `jembee-play` returned no public/searchable match; this does **not** prove that a private repository does not exist.

The current code is a Next.js modular application in practice, but it is not yet organized as the target domain-oriented Modular Monolith. App Router handlers, Firebase/Firestore helpers, business services, payment logic, moderation, and UI are distributed across `src/app`, `src/lib`, `src/services`, `src/firestore`, and `src/firebase`.

**Decision:** do not bulk-move files or change import aliases in this phase. First establish the destination repository and a passing baseline build/test environment; then migrate one bounded context at a time with compatibility wrappers.

## 2. Observed project facts

- `package.json` name: `jembee-play`.
- Framework: Next.js `16.2.9`; React `19.2.x`; Firebase client/Admin SDKs are dependencies.
- TypeScript strict mode is enabled; alias `@/*` maps to `src/*`.
- API route handlers are under `src/app/api` and cover admin, creator/upload, education, ads/Monetag, Cashfree webhook, profile, Shorts, and video streaming.
- Business/service code currently exists in `src/lib`, `src/services`, `src/firestore/services`, and `src/firebase`.
- `src/modules`, `src/repositories`, and `src/schemas` are not present as established architecture layers.
- `src/app/api/education/schools` was added in the preceding remediation and is currently an API route, not yet a dedicated education domain module.
- `.github` currently contains Dependabot configuration only; no verified CI workflow was found in this archive.
- No native Android Gradle project was found in the source archive (separate release requirement; not an architecture blocker for web module migration).

## 3. Target bounded contexts

The following is the recommended target map. It is a migration destination, not a claim that these modules already exist.

| Bounded context | Owns | Existing source candidates |
|---|---|---|
| identity | Firebase identity, profile, roles, admin authorization | `src/firebase`, `src/app/api/auth`, `src/app/api/profile`, `src/lib/server/requireAdmin.ts` |
| media | video metadata, upload lifecycle, Drive/Cloudinary, streaming, thumbnails | `src/app/api/creator`, `src/app/api/shorts/video-stream`, `src/services/googleDriveService.ts`, `src/services/cloudinaryServerService.ts`, `src/lib/videos` |
| discovery | home feed, explore, search, categories, school discovery | `src/app`, `src/app/learn`, `src/firebase/categories` |
| social | likes, comments, shares, follows, notifications | `src/app/api/shorts/*`, `src/firestore/services/socialService.ts`, `src/lib/social` |
| education | boards, schools, classes, subjects, courses, lessons, progress, certificates | `src/app/learn`, `src/app/api/education` |
| moderation | submissions, reports, review queues, automated moderation | `src/lib/moderation`, `src/services/moderationService.ts`, `src/app/api/admin/moderate-video` |
| monetization | ad placements, Monetag attribution, revenue evidence, creator/sharer settlement | `src/lib/ads`, `src/app/api/monetag`, `src/app/api/admin/monetag-*` |
| payments | Cashfree orders, webhooks, entitlements, refunds, settlement ledger | `src/lib/payments`, `src/lib/server/paidVideo*`, `src/app/api/payments`, `src/app/api/shorts/paid-video` |
| communication | email, WhatsApp, student-teacher communication, support | future module; no complete domain module verified |
| administration | admin configuration, audit trail, operational dashboards | `src/app/admin`, `src/lib/admin-config` |

## 4. Required target folder contract

```text
src/
  app/                         # Next.js routes/pages only; thin adapters
  modules/
    identity/{domain,application,infrastructure}/
    media/{domain,application,infrastructure}/
    discovery/{domain,application,infrastructure}/
    social/{domain,application,infrastructure}/
    education/{domain,application,infrastructure}/
    moderation/{domain,application,infrastructure}/
    monetization/{domain,application,infrastructure}/
    payments/{domain,application,infrastructure}/
    communication/{domain,application,infrastructure}/
    administration/{domain,application,infrastructure}/
  shared/
    contracts/                 # shared DTOs and cross-module contracts only
    security/                  # shared primitives; no domain policy
    observability/
```

### Dependency rules

1. `app` may call a module's application entry point; it must not contain domain policy.
2. `domain` must not import Next.js, Firebase SDKs, Google APIs, or other infrastructure.
3. `application` coordinates use cases and depends on domain contracts/ports.
4. `infrastructure` implements ports (Firestore, Drive, Cashfree, Monetag, Cloudinary).
5. A module must not import another module's internal files. Cross-module calls use exported application APIs or shared contracts.
6. Client components must never import server-only credentials, Firebase Admin, payment secrets, or server infrastructure.
7. Existing Firestore collection names and document shapes remain unchanged during structural migration unless a separately approved migration plan exists.

## 5. Security/consistency observations requiring follow-up

- Two admin-auth wrappers exist: `src/lib/server/requireAdmin.ts` and `src/lib/api/adminAuth.ts`. They differ in fallback lookup, token/error handling, and status behavior. Consolidation is recommended only after call-site inventory and contract tests; do not swap them globally without review.
- The `requireAdmin` helper verifies revoked tokens (`verifyIdToken(token, true)`) and checks a direct UID document before a bounded fallback query. `withAdminAuth` queries by `uid` and currently returns HTTP 500 for caught authentication/infrastructure errors. This behavioral difference must be resolved deliberately.
- Payment, settlement, and moderation routes should remain server-owned. Do not relax Firestore client writes or enable live payouts as part of architecture refactoring.
- Current source archive does not prove deployed Firestore rules, Cashfree webhook configuration, Google Drive OAuth, or Vercel project isolation.

## 6. Safe migration sequence

1. Confirm/create the destination GitHub repository and record its owner, default branch, and source commit. Keep the existing repository untouched.
2. Establish a reproducible Node 22 dependency install, `npm ci`, lint, semantic TypeScript check, test suite, and production build baseline.
3. Add CI checks before structural movement.
4. Migrate one low-risk bounded context first (education school API) behind compatibility exports; preserve route URLs and Firestore schema.
5. Add module boundary tests and import restrictions.
6. Migrate media/social/moderation/monetization/payments separately; run each context's contract tests after each move.
7. Remove old compatibility files only after all call sites and production behavior are verified.

## 7. Acceptance gates for this phase

- [ ] Destination repository is confirmed and isolated from JembeeKart.
- [ ] Source commit and archive provenance are recorded.
- [ ] CI workflow is active and green.
- [ ] `npm ci` completes reproducibly on Node 22.
- [ ] ESLint, semantic TypeScript, tests, and `next build --webpack` pass.
- [ ] Module boundary rules are enforced.
- [ ] No Firestore collection/schema changes occurred during folder migration.
- [ ] Existing Drive resumable upload, HTTP Range/206 streaming, thumbnail metadata caching, and paid-video security contracts pass regression tests.

## 8. Current phase status

**Phase 04–05: audit and migration design completed; repository separation and code migration are blocked pending confirmed destination repository and a clean validation baseline.** No commit, push, deployment, live payment, payout, or data migration was performed.
