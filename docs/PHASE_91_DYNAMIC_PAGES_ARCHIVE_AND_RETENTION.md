# Phase 91 — Dynamic Pages Archive and Version Retention

## Scope
Hardened page deletion after reviewing the Phase 90 API, editor, public renderer, and checked-in Firestore rules.

## Changes
- Replaced permanent document deletion with a transactional soft-archive operation.
- Archive requires a verified `super_admin` identity.
- A page must already be hidden before it can be archived.
- Archive records `isDeleted`, `archivedAt`, `archivedBy`, `approvalStatus`, and update metadata.
- Version snapshots remain in the page's `versions` subcollection because the parent document is retained.
- Admin list response exposes an `archived` flag.
- Archived pages cannot be edited, republished, or toggled through PATCH.
- Public dynamic-page renderer fails closed for archived pages.
- UI confirms archival (not permanent deletion), labels archived pages, and disables edit/toggle/archive actions for archived or visible pages.

## Data retention and migration notes
- Existing documents without `isDeleted` remain active; no destructive migration was run.
- Existing version subcollections are preserved.
- Archived slugs remain reserved by their retained Firestore document; this intentionally prevents accidental slug reuse.
- No restore/purge workflow was added. A future retention policy must define who can restore and when permanent purge is legally/operationally permitted.
- Existing Firestore rules have a final deny-all catch-all and no explicit `dynamic_pages` client rule. This patch continues to use the Admin SDK API; deployed rules were not compared.

## Verification
- Static source assertions: see Phase 91 execution checks.
- ZIP integrity checked after packaging.
- TypeScript build, lint, Firestore Emulator, browser tests, production data migration, and deployed-rules comparison were not run.

## Release cautions
- Deploy the API and UI together.
- Confirm `requireAdmin` supplies a trustworthy `role` field sourced from current server-side admin authorization.
- Verify a non-super-admin receives 403; visible page archive receives 409; hidden page archive succeeds; public route returns not found for archived pages; version history remains readable by admins.
- Live financial payouts remain disabled; this phase does not modify settlement logic.
