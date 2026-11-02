# Phase 94 — Atomic Dynamic Page Mutations and Audit Events

## Changes
- Removed the standalone `writePageAudit` helper that previously wrote events after the page mutation.
- Page creation now creates the page document and `page_created` audit event in the same Firestore transaction.
- Content updates, publishing, and hiding write their audit event in the same transaction as the page update and any version snapshot.
- Restore writes `page_restored` in the same transaction as restoring the page to hidden state.
- Archive writes `page_archived` in the same transaction as the soft-archive mutation.
- If Firestore cannot commit the audit event, the corresponding page mutation transaction also fails.

## Integrity boundary
- Atomicity is provided by one Firestore transaction per page mutation.
- Audit documents remain server-written through Admin SDK routes and explicitly denied to client SDK access by Firestore rules.
- This is not cryptographic tamper-proof storage: project owners/service-account holders can still modify Firestore data. Use an external append-only/WORM sink and restricted IAM for stronger guarantees.
- Reads still return the latest 50 activity events and are not yet cursor-paginated.

## Verification
- Static source assertions verify all four mutation flows include audit writes inside their transactions and no post-transaction audit helper remains.
- ZIP integrity verified.
- TypeScript build, lint, Firestore Emulator concurrency tests, and production deployment tests were not run.
- No live payout or settlement code changed.
