# Phase 75 — Refund Firestore Security Rules Audit

Date: 2026-11-02

## Scope
Reviewed the active `firestore.rules`, the admin refund request API, the refund processing API, and the admin refund request page in the Phase 74 source archive.

## Findings

### 1. Default-deny rule covers refund collections
The active `firestore.rules` has no explicit client rule for the top-level `refund_requests` or `refundRequestAuditLogs` collections. The final recursive match denies all reads and writes not explicitly allowed:

```rules
match /{document=**} {
  allow read, write: if false;
}
```

Therefore, direct client SDK access to both collections is denied by the active rules. This is the safer default; no permissive client rule was added.

### 2. Orders are read-only to clients
The `orders/{orderId}` rule permits reads only to the matching signed-in owner or an admin. The accompanying comment states order creation and financial/status changes must go through trusted server-side code. No client order write permission was introduced.

### 3. Admin refund APIs verify revoked-token status and database role
Both:
- `src/app/api/admin/refund-requests/route.ts`
- `src/app/api/admin/refund-requests/process/route.ts`

call Firebase Admin `verifyIdToken(token, true)` and then check the user's database role for `admin` or `super_admin`. The admin UI sends the Firebase ID token in the Authorization header; the UI itself is not treated as the security boundary.

### 4. Refund audit records are server-written
The reviewed admin endpoints write audit entries to `refundRequestAuditLogs` using the Firebase Admin SDK. Because the client rules default-deny this collection, browser clients cannot directly create, edit, or delete those records through Firestore client SDK access.

## Decision
No Firestore rules change was justified in this phase. Adding explicit deny rules for these collections would duplicate the existing catch-all deny and would not materially improve enforcement. In particular, do not add client-side admin read/write access merely to make the admin screen work: the current UI obtains refund data through authenticated server APIs.

## Limitations / verification not performed
- Firestore Emulator rules tests were not run.
- No deployed-project rules were fetched or compared; this audit covers the rules file in the supplied source archive only.
- No production Firebase permissions or live admin roles were changed.
- Firebase Admin SDK bypasses Firestore Security Rules by design, so every server route using Admin SDK must continue enforcing authentication, authorization, validation, and audit logging itself.
- This is a source review, not a penetration test.

## Release safety
This phase does not enable payouts, change refund processing, or alter financial settlement behavior. Live payouts remain disabled pending a complete, tested settlement implementation.
