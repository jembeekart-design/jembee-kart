# Phase 90 — Dynamic Pages Approval and Version History

## Scope
Harden the existing admin-only Dynamic Pages API and UI. This phase does not change the reserved `refund-policy` route or enable live financial settlement.

## Changes
- Added immutable previous-content snapshots in `dynamic_pages/{slug}/versions/{versionId}` when content actually changes. Snapshot creation and page update occur in the same Firestore transaction.
- Added an authenticated history read via `GET /api/admin/dynamic-pages?history={slug}`; returns the latest 20 snapshots only.
- Added a Version history view in Pages Manager. It is read-only; restoring an older revision is intentionally not enabled.
- Publishing (`visible: true`) is now restricted to `super_admin` and requires a different super admin from the user recorded in `contentUpdatedBy`.
- Publication metadata (`publishedAt`, `publishedBy`, `approvalStatus`) is recorded. Hiding a page records `approvalStatus: unpublished`.
- Admins can still save content drafts and hide pages; they cannot publish them.

## Security notes / limitations
- This is a two-person approval check only when the content editor UID is present. Existing legacy pages without `contentUpdatedBy` rely on the super-admin-only publish restriction; legacy content provenance is not retroactively known.
- The approval is a separate super-admin action, but this is not a full multi-stage workflow with reviewer comments, rejection queue, or signed approval records.
- Version snapshots contain the previous title/content and editor UID of the snapshot operation. There is no retention/cleanup policy or restore endpoint.
- Deleting a page with Firestore subcollections can leave orphaned version documents unless recursive deletion is added; verify deletion behavior before operational use. Do not treat the version history as a backup.
- No Firestore Emulator, browser, deployed Firestore, TypeScript build, or production test was run in this phase.
- Reserved `refund-policy` remains excluded from this generic workflow. Do not infer the published refund terms from checked-in defaults.
- Live payouts remain disabled.

## Verification performed
Static source assertions only: transaction snapshot write, history query cap, super-admin publish gate, distinct-editor approval guard, publication metadata, UI history display, and reserved refund-policy exclusion. ZIP integrity verified separately.
