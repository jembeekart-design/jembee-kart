# Phase 98 — Dynamic Pages Firestore Security Tests

## Changes
- Added four Firestore Rules Unit Testing cases to `firestore.rules.test.mjs`:
  1. Ordinary users cannot read `dynamic_pages/{pageId}` directly.
  2. Even admins cannot bypass the server API with direct client writes to dynamic page documents.
  3. Clients cannot read or write `dynamic_pages/{pageId}/versions/{versionId}` snapshots.
  4. Clients cannot read or write `dynamic_page_audit/{eventId}` records.
- Added `test:dynamic-pages-firestore` to run the Firestore rules suite through Firebase Emulator.
- Added `test:dynamic-pages` as the combined audit-contract + Firestore rules test command.
- Retained the Phase 97 strengthened audit verification: contiguous revision chain, previous-hash validation, recomputed hash validation, and comparison with the page's stored audit head.

## Verification performed here
- `node --test src/app/api/admin/dynamic-pages/__tests__/audit-contract.test.mjs`: 7/7 PASS.
- `package.json` JSON parse: PASS.
- Phase 97 ZIP integrity before extraction: PASS.
- Firestore Emulator tests were authored but NOT executed: Firebase CLI and `node_modules` are not present in this workspace.
- TypeScript build, ESLint, browser tests, and live concurrent-request integration tests were not run.

## Run locally
```bash
npm install
npm run test:dynamic-pages
```
The Firestore rules test script starts the Firestore Emulator on the configured port 8080 and runs the existing `firestore.rules.test.mjs` suite, including the four new dynamic-pages cases.

## Security and release notes
- The checked-in rules explicitly deny direct client access to dynamic page documents, version subcollections, and audit events. Admin access is through trusted server routes using Firebase Admin SDK.
- Emulator tests are still required before marking the Firestore rules cases as passed.
- Hash chain remains tamper-evident, not immutable against privileged Firebase owners/service accounts.
- No settlement or payout logic was changed. Live payouts remain disabled until settlement implementation and required tests are verified.
