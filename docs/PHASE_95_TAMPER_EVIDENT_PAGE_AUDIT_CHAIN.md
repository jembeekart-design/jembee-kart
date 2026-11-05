# Phase 95 — Tamper-evident dynamic-page audit chain

## Changes
- Added SHA-256 hash chaining for dynamic-page create, content update, publish/hide, restore, and archive events.
- Each page stores `auditRevision` and `lastAuditHash`; each audit event stores `auditRevision`, `previousHash`, and `hash`.
- Audit event creation and page hash/revision update remain in the same Firestore transaction as the page mutation.
- Added an admin-only verification mode: `GET /api/admin/dynamic-pages?audit=<pageId>&verify=true`.
- Verification checks revision ordering, previous-hash continuity, and recomputes each event hash; capped at 5,000 chained events.
- Normal audit event responses now include revision and hash metadata.
- Added the Firestore composite index for `pageId ASC, auditRevision ASC`.

## Compatibility and limitations
- Existing audit records written before Phase 95 have no hash fields. They are reported as legacy and are not retroactively certified.
- A page with no Phase 95 chain starts at revision 1; subsequent Phase 95 events chain from its stored `lastAuditHash`.
- Hash chaining is tamper-evident, not tamper-proof. A privileged project owner/service account able to rewrite both page and audit documents could recompute the chain. Restrict IAM and export audit records to an independently controlled immutable/WORM sink for stronger assurance.
- Verification is bounded to 5,000 chained events per request. Larger histories require a paginated verifier or external audit pipeline.
- This does not implement HTTP request idempotency; a client retry that repeats an entire successful request can still create a second legitimate audit event.

## Validation
- Static source assertions and JSON index parsing are performed for this phase.
- TypeScript build, ESLint, Firestore Emulator, concurrency, and deployed-index tests are not claimed unless separately run and reported.
- No wallet, commission, cashback, or payout behavior was changed. Live payouts remain disabled pending settlement implementation and required tests.
