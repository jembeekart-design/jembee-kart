# JEMBEE PLAY — Modular Monolith Target Architecture

Date: 2026-11-13  
Status: Architecture baseline / migration plan (not a completed refactor)

## Guardrails

- Keep one Next.js deployable application until independent scaling/deployment is justified.
- Keep route handlers as transport adapters: authenticate, validate, call a module use-case, map the result to HTTP.
- Keep Firebase Admin/Firestore access server-only behind repositories/adapters.
- Never expose Admin SDK, Cashfree secrets, Google Drive refresh tokens, or Monetag credentials to client bundles.
- Do not rename/delete Firestore collections or change document shapes without an approved mapping, backup, migration, and rollback plan.
- Preserve existing public routes and response contracts during migration; use compatibility adapters where necessary.
- Paid-video checkout and live payouts remain disabled until their existing acceptance gates pass.
- No bulk media ingestion before platform readiness approval.

## Bounded contexts and ownership

| Module | Owns | Must not own |
|---|---|---|
| identity | Firebase identity mapping, sessions, roles, account lifecycle | payment ledger, media bytes |
| media | video metadata, upload lifecycle, Drive/CDN adapters, range streaming | creator settlement policy |
| discovery | home feed, search, categories, recommendations | payment execution |
| social | follows, likes, comments, shares, attribution events | payout calculations |
| education | boards, schools, classes, subjects, chapters, courses, progress | general media storage |
| moderation | reports, review queues, policy decisions, audit trail | admin credential verification implementation |
| monetization | ad placements, eligible revenue evidence, creator/sharer attribution | Cashfree payment orchestration |
| payments | Cashfree orders, webhook verification, refunds, immutable ledger | ad placement rendering |
| communication | email/WhatsApp/in-app notification orchestration | user role authority |
| administration | admin workflows, settings, operational audit | bypassing domain authorization |

## Target source layout

```text
src/
  app/                    # Next.js pages and API transport adapters only
  modules/
    identity/
    media/
    discovery/
    social/
    education/
    moderation/
    monetization/
    payments/
    communication/
    administration/
  repositories/           # persistence ports and Firebase implementations
  schemas/                # shared request/domain validation schemas
  infrastructure/
    firebase/
    google-drive/
    cashfree/
    monetag/
```

## Dependency direction

`app -> modules -> repositories (ports)`; infrastructure adapters implement repository ports. Domain modules may call another module only through a documented public application-service interface. No module may import another module's internal files. Client components must not import server-only modules.

## Migration sequence

1. Freeze and fingerprint source baseline; install dependencies reproducibly; run existing tests/build.
2. Extract shared request validation and typed error mapping without changing route behavior.
3. Extract one low-risk vertical slice (education schools) into module + repository; keep API route as adapter.
4. Add contract tests comparing old/new response shapes and authorization outcomes.
5. Migrate media/discovery/social in small slices; preserve streaming, range, cache, and upload behavior.
6. Migrate monetization/payments only after ledger invariants, idempotency, refund reversals, webhook signatures, and reconciliation tests pass.
7. Enable lint/import-boundary checks and CI; block cross-module internal imports.

## Exit criteria for Phase 5

- Module ownership and dependency direction documented.
- No broad file moves before baseline tests/build are reproducible.
- Every migrated route has contract tests for success, invalid input, unauthenticated, unauthorized, and dependency failure paths.
- Firestore paths and document contracts are explicitly mapped; no unapproved schema mutation.
- CI runs install, lint, typecheck, tests, and production build on the intended Node version.
