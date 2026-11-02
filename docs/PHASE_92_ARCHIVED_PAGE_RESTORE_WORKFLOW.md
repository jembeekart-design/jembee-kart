# Phase 92 — Archived Page Restore Workflow

## Changes
- Admin API can list active pages and archived pages separately using `?archived=true`.
- Added PUT restore endpoint; only a verified `super_admin` may restore.
- Restore is transactional and only accepts currently archived records.
- Restored pages are always hidden (`visible: false`) and receive `approvalStatus: restored_hidden`.
- Restore actor and timestamp are recorded (`restoredBy`, `restoredAt`).
- Pages Manager now has an Archived Pages panel, history access, and a Restore hidden action.
- Existing version snapshots remain attached to the parent document and are available after restore.
- Restoring does not publish; publication requires a separate approval by another Super Admin.

## Retention policy
No automatic expiry or permanent purge was introduced. The archive retains content and history indefinitely until a separately authorized retention/purge policy is designed. This avoids accidental data loss but requires an organization-approved retention period and legal review before production.

## Important limitations
- The API's existing page list is capped at 200 records; archived and active lists are independently filtered after the same bounded query. A paginated cursor should be added before the collection can exceed this operational cap.
- No Firestore Emulator, browser test, TypeScript build, lint, or production-data migration was run.
- Confirm deployed authorization role source and test admin/super-admin roles before release.
- Live payouts and financial settlement logic were not changed.
