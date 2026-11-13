# Phase 33 — Firebase Emulator transaction integration harness

Date: 2026-11-13

## Scope

Added an opt-in Firestore Emulator integration suite at
`src/modules/learning/__tests__/settlement-ledger-emulator.integration.test.mjs` and the package command
`npm run test:settlement-emulator`.

The suite covers:
1. Concurrent duplicate paid-webhook retries create one deterministic creator/platform ledger row set.
2. Cumulative refund replay is idempotent; a later cumulative amount gets a separate reversal key.
3. Teacher commission adjustment is appended once while the current summary projection changes.
4. Firestore rejects read-after-write transaction ordering and leaves the batch uncommitted.
5. Concurrent transaction counter increments do not lose updates.

The test connects only when `FIRESTORE_EMULATOR_HOST` is present. The npm command starts `firebase emulators:exec` with a `demo-jembee-play` project, which is intended to prevent accidental production access. The suite uses a unique test prefix and cleans up its own test documents.

## How to run

From the project root with dependencies installed:

```bash
npm ci
npm run test:settlement-emulator
```

The Firestore emulator is configured on port 8080 in `firebase.json`. The CLI downloads/uses the emulator runtime as needed. A successful integration run must show all nested emulator tests passing; merely seeing the suite skipped is not an emulator pass.

To run the suite manually against a locally started emulator:

```bash
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 GCLOUD_PROJECT=demo-jembee-play node --experimental-strip-types --test src/modules/learning/__tests__/settlement-ledger-emulator.integration.test.mjs
```

## Results in this source workspace

The full source `.mjs` test suite was run without an emulator host. The emulator-specific integration test is therefore skipped by design; it is not represented as a live emulator verification. This environment did not have installed `node_modules`/Firebase CLI runtime available, so no emulator process was started and no Firebase network connection was attempted.

## Important limits

- These are Firestore SDK transaction behavior tests against an isolated emulator, not end-to-end Cashfree webhook/refund route tests.
- The production routes were not rewired to a new repository in this phase.
- Admin SDK emulator tests bypass Firestore Security Rules; rules behavior requires separate client-SDK Rules Unit Testing.
- No production project ID, service account, payment secret, or live Firestore endpoint is configured or used.
- No collection/rules/index migration, payout, refund, transfer, or paid-video activation occurred.

## Next step

Phase 34 should add dedicated Firestore Rules Unit Testing for the sensitive settlement/order/payment collections and verify client read/write denial using `@firebase/rules-unit-testing`, still against the emulator only.
