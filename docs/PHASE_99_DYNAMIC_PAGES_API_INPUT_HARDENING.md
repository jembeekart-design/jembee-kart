# Phase 99 — Dynamic Pages API Input and Authorization Hardening

## Changes
- POST now rejects `null`, arrays, and non-object JSON before accessing request properties. This closes an unhandled malformed-body path.
- POST accepts only `title` and `slug`; unknown properties are rejected.
- PATCH accepts only `id`, `visible`, `content`, and `expectedAuditRevision`.
- PUT/DELETE accept only `id` and `expectedAuditRevision`.
- Existing validation remains in place for slug format/reserved slugs, title length, content length, expected revision, and role-gated publish/restore/archive operations.
- No changes to Firestore mutation semantics or financial settlement logic.

## Verification
- Audit/API source-contract tests: 11/11 PASS using Node.js built-in test runner.
- ZIP integrity: PASS.
- Firestore Emulator, TypeScript build, ESLint, and HTTP integration tests: not run in this workspace (Firebase CLI and project node_modules are absent).

## Recommended local verification
```bash
npm install
npm run test:dynamic-pages
npm run build
npm run lint
```

## Limitations
- Source-contract tests validate important code guards but do not execute Next.js route handlers with mocked Firebase Admin or authenticated HTTP requests.
- Emulator security tests added in Phase 98 remain unexecuted here.
- Live payouts remain disabled until the separate settlement implementation and required tests are verified.
