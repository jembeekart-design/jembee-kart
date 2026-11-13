# Phase 06 — Education School Catalog Module Migration

Date: 2026-11-13
Status: Partial migration implemented; integration/build verification pending.

## Scope

Migrate only the school-catalog create/review application flow into the Modular Monolith boundaries. Existing Next.js routes remain HTTP adapters. Existing Firestore collections and document contracts are preserved.

## Implemented

- `src/schemas/education/school.ts`: pure input parsing and shared school types.
- `src/modules/education/schools.ts`: application use-cases with an injected repository port.
- `src/repositories/education/firestoreSchoolCatalog.server.ts`: server-only Firestore adapter; retains `educationSchools` and `educationSchoolAuditLogs`, SHA-256 deterministic IDs, transaction duplicate protection, and audit events.
- School create and review routes delegate to schema, module, and repository boundaries.
- Existing public school reads remain in the route adapter and expose approved records only, bounded to 500 records.

## Verification

- All 29 `*.test.mjs` files executed: 114 tests passed, 0 failed.
- Focused school contract tests: 5 passed, 0 failed.
- Tests are source-contract/unit-style checks; they do not replace Firebase Emulator or live project integration tests.

## Outstanding / not claimed

- Full dependency installation, semantic TypeScript check, ESLint, Next.js production build.
- Firebase Emulator tests for create/review/read and rules.
- Pagination/index strategy for the school catalog; current public/admin query is capped at 500.
- Auth hydration behavior in the admin UI.
- Full school → class → subject → chapter → lesson/video/question catalog. Only the school selection data source is connected; deeper hierarchy remains incomplete.
- Separate `jembee-play` GitHub repository and separate Vercel project are not verified. Search did not find a public repository named `jembee-play`; a private repo may exist.

## Safety

No Firestore collection rename/delete, data migration, payout activation, paid-video activation, commit, push, or deployment was performed.
