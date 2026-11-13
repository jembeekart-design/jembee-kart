# Phase 34 — Firestore Security Rules Unit Testing

Date: 2026-11-13

## Audit result

The current `firestore.rules` already has explicit `allow read, write: if false` rules for:
- `watchVideoPaymentOrders`
- `watchVideoPurchases`
- `watchVideoPaymentEvents`
- `shortsSettlementLedger`
- `shortsVerifiedExpenses`
- `teacherReferralAttributions`
- `creatorAdEarnings`

It also has a final recursive deny rule. The admin role helper is used for selected administrative collections, but the financial collection rules deliberately do not grant direct client access even to an admin client token. Server-side Admin SDK routes remain a separate trusted boundary and must be protected by server authentication/authorization.

## Added tests

`src/firebase/__tests__/firestore-financial-rules.emulator.test.mjs` is an opt-in Rules Unit Testing suite using `@firebase/rules-unit-testing` and the Firestore client SDK. It seeds fixture documents with rules disabled and tests:
1. Authenticated regular users cannot read or list financial collections.
2. Authenticated regular users cannot create, update or delete financial records.
3. Admin client tokens also cannot directly read or write these collections.
4. Owner profile reads remain separate from financial collection access.
5. Static guard tests ensure explicit financial denies and default deny remain present.

The test runs only when `FIRESTORE_EMULATOR_HOST` is set. It does not connect to a production Firebase project.

## Run command

```bash
npm ci
npm run test:firestore-rules-emulator
```

The command uses `firebase emulators:exec --project demo-jembee-play --only firestore` and then runs the Rules Unit Testing suite. Firebase CLI downloads/starts the local emulator as needed.

## Execution result in this workspace

The static guard tests pass. The emulator integration test is skipped because the emulator host was not set and Firebase CLI/runtime was not available in this workspace. Therefore this phase records the suite as authored, not as an executed emulator verification.

## Scope and limitations

- No Firestore rules were changed because the inspected financial collection rules already explicitly deny client access.
- No Firebase production project, service account, or live Firestore endpoint was used.
- No rules deployment, data migration, collection change, payment/refund, payout or transfer occurred.
- Admin SDK server routes bypass Firestore client rules; their own Firebase ID token revocation checks and role checks still require separate server-route security testing.
- Rules tests with Admin SDK fixture seeding intentionally bypass rules only for test setup.

## Next step

Phase 35 should audit and test Admin SDK route authorization and request-level boundaries for all financial/payment/refund reconciliation endpoints, including admin role enforcement, token revocation, bounded body parsing, idempotency and no-store responses.
