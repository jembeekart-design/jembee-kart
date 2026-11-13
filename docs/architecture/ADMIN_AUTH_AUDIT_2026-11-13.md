# Admin Authentication Audit — 2026-11-13

Status: Source-level comparison only. No auth helper was replaced.

## Helpers compared

- `src/lib/server/monetagAdminAuth.ts` — `verifyMonetagAdmin`
- `src/lib/mcp/security.ts` — `verifyFirebaseAdminToken`, `verifyAdminRequest`, `isAdminUid`
- `src/lib/server/requireAdmin.ts` — `requireAdmin`, `isAdminIdentity`
- Several API routes still contain local `verifyAdmin` implementations (for example `src/app/api/admin/moderate-video/route.ts`).

## Common behavior observed

- Bearer Firebase ID token is required.
- `verifyIdToken(token, true)` checks token revocation for the compared admin helpers.
- Admin role is `admin` or `super_admin`.
- Both direct `users/{uid}` lookup and fallback `users` query by `uid` are used.

## Differences / risks

- Error contract differs: helpers throw string-coded errors; `requireAdmin` returns `NextResponse` 401/403.
- Token length bounds differ: MCP helper caps at 10,000 chars; `requireAdmin` caps at 8,192; `verifyMonetagAdmin` has no explicit length bound before Firebase verification.
- `verifyMonetagUser` intentionally verifies a normal user token without revocation check (`verifyIdToken` without second argument); do not conflate it with admin authorization.
- Local route copies increase drift risk. Some routes may have subtly different response and audit behavior.

## Safe next action

Create a shared server-only primitive with explicit `AdminAuthError` codes and a compatibility wrapper, then migrate routes in batches with route-contract tests. Before implementation, enumerate every local verifier and compare status codes, response bodies, role lookup semantics, revocation behavior, and audit logging. Do not change this behavior in a bulk replacement.
