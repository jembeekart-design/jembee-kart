# Phase 88 — Dynamic Pages Admin API Hardening

## Scope
Move the Pages Manager away from direct browser Firestore reads/writes and place its existing list/create/visibility/delete operations behind a server-side admin API.

## Changes
- Added `src/app/api/admin/dynamic-pages/route.ts` with GET, POST, PATCH and DELETE handlers.
- Every handler calls the shared `requireAdmin` helper, which verifies Firebase ID tokens with revocation checking and confirms the current Firestore admin role.
- Added strict title/slug validation, bounded list output (200 documents), transactional create/update/delete, conflict/not-found responses, and audit metadata (`createdBy` / `updatedBy`).
- New pages start hidden and empty. The API refuses to make an empty-content page public.
- Reserved `refund-policy` from this generic manager API so the dedicated legal policy cannot be modified/deleted through it.
- Updated `src/app/admin/pages/page.tsx` to call the API with the signed-in user's ID token; removed direct client Firestore writes and reads.

## Important limitations
- This is not a full policy editor, approval workflow, version history, or HTML sanitizer.
- Generic dynamic page content editing remains absent. Newly created pages remain hidden until a separate safe content workflow exists.
- The refund-policy page remains untouched and is not made publishable by this phase.
- The API uses Firebase Admin SDK; deployed Firebase credentials and hosting configuration still need environment-specific verification.

## Verification
- Static assertions: API exports all four methods; all methods use `requireAdmin`; page manager uses the API and no longer imports Firestore CRUD helpers; reserved refund policy is excluded; empty content cannot be made public.
- ZIP integrity checked after packaging.
- TypeScript build, lint, Firestore Emulator, browser/admin-role integration, and production deployment were not run because this extracted archive has no `node_modules` and no deployed environment access.

## Release posture
Do not treat this as production sign-off. Do not enable live payouts. Validate against staging Firebase rules and admin accounts before deployment.
