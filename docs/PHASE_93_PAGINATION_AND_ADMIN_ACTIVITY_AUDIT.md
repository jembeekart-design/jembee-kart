# Phase 93 — Dynamic Pages Pagination and Admin Activity

## Changes
- Replaced the hard 200-document list read with cursor-based pagination, default 50 and maximum 100.
- Active and archived pages can be paged independently; the cursor advances over scanned documents so mixed active/archive records do not cause repeated pages.
- Added per-page admin activity read API (`?audit=<pageId>`) capped at 50 events.
- Server records create, content update, publish, hide, restore, and archive events with actor UID, action, details, timestamp, and schema version.
- Pages Manager now has Load More controls for active and archived pages and an Activity panel.
- Added Firestore composite index for `dynamic_page_audit` (`pageId ASC`, `createdAt DESC`).
- Added explicit Firestore client-deny rules for `dynamic_pages`, its version subcollections, and `dynamic_page_audit`; server Admin SDK routes remain the access path.

## Important audit limitations
- Audit writes currently occur after the primary page mutation in a separate transaction. If the audit write fails, the page change may already have committed. A follow-up phase should move each mutation and its audit event into one atomic Firestore transaction.
- Audit records are protected from client writes by Firestore rules and no mutation endpoint is exposed, but Admin SDK credentials can still alter them. This is not cryptographic tamper-proof/WORM storage.
- Activity API returns latest 50 events; pagination for audit history is not yet implemented.
- Page list cursor uses document ID ordering and scans `pageSize + 1` docs; filtering active/archived occurs after scanning. Some pages may be sparse where the collection contains many records of the other state, but the cursor advances and can continue.

## Verification
- Static source assertions and JSON parse checks are run at packaging time.
- ZIP integrity is checked.
- TypeScript build, lint, Firestore Emulator, deployed-index/rules comparison, browser testing, and production migration were not run.
- Live payouts and settlement logic were not changed.
