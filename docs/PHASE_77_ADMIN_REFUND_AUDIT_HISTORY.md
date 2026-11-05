# Phase 77 — Admin Refund Audit History Access

Date: 2026-11-02

## Changes
- Added `src/app/api/admin/refund-requests/audit/route.ts`, a read-only GET endpoint for one refund request's audit events.
- The endpoint verifies Firebase ID token revocation status and checks the current database role (`admin` or `super_admin`) before reading.
- Requires a valid `requestId`; returns at most 50 newest events and `no-store` cache headers.
- Response is allowlisted: event ID, action, admin ID, order/refund IDs, provider/committed status, bounded error category, amount, reservation release flag, and timestamp. It does not return arbitrary audit document fields or rejection reason/customer profile data.
- Added a “View audit history” control and read-only history panel to `src/app/admin/refund-requests/page.tsx`.
- Added a composite index in `firestore.indexes.json` for `refundRequestId ASC, createdAt DESC`.

## Immutability / access review
- Active `firestore.rules` continues to deny all client access to `refundRequestAuditLogs` through the catch-all deny rule.
- Source scan found only server-side audit document creation (`doc()` plus transaction `create`/`set`) and the new server-side read endpoint. No audit collection update/delete call was found in `src` source.
- The endpoint exposes no mutation method; unsupported methods are handled by the framework.
- Firebase Admin SDK bypasses Firestore rules, so source discipline and server authorization remain essential. This is not cryptographic/tamper-evident immutability.

## Limits
- API returns the latest 50 records only; no cursor pagination is implemented.
- Historical events before audit coverage was added are not backfilled.
- Firestore composite index deployment was not run. Deploy `firestore.indexes.json` before relying on the history query in production.
- TypeScript build, UI browser test, Firestore Emulator test, and production permission tests were not run.

## Release safety
No refund or payout behavior was changed. Live payouts remain disabled pending full settlement implementation and tests.
