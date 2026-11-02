# Phase 87 — Published Refund Policy Administration Audit

## Files reviewed
- `src/app/admin/pages/page.tsx`
- `src/app/refund-policy/page.tsx`
- `src/app/[slug]/page.tsx`
- `src/lib/firestore/getFirestoreDocument.ts`
- `firestore.rules`
- `src/firestore/admin/pages/legal/legalPolicySystemSettings.json`

## Findings
1. The public `/refund-policy` route reads `dynamic_pages/refund-policy` through the Firebase Admin SDK and renders its stored title/content only when the document exists and is not hidden. If missing/hidden, it displays “Refund policy is currently unavailable.”
2. The generic Admin Pages Manager reads and writes `dynamic_pages` directly from the browser using the Firebase client SDK (`getDocs`, `setDoc`, `deleteDoc`). It has create, hide/show, and delete actions, but no content editor, approval workflow, version history, or publication preview.
3. `firestore.rules` contains no explicit `dynamic_pages` match. The final recursive rule denies all unmatched reads/writes. Therefore the direct client-side Pages Manager operations are denied by the checked-in rules unless a separate deployed ruleset differs.
4. The checked-in legal settings advertise policy editing, approval workflow, and version control, but the reviewed Pages Manager does not implement those capabilities. The settings are configuration declarations, not proof of deployed functionality.
5. The generic dynamic page route renders stored content as text. The dedicated refund-policy route renders `content` using `dangerouslySetInnerHTML`; the source reviewed here does not show a sanitization step before that HTML is rendered. Treat the policy content as trusted-admin-only HTML and do not allow untrusted users to write it.

## Risk / decision
There is no verified end-to-end admin publication path in the checked-in source for the public refund policy. Do not create a customer refund request endpoint based only on the checked-in 7-day defaults. The actual published policy and active Firestore document must be confirmed first. No live database was queried.

## Recommended next work
- Replace direct client writes with a narrowly scoped, server-side admin API protected by revocation-aware Firebase token verification and admin role checks.
- Add a safe policy editor with draft/preview/approval/publish/version history, or explicitly scope down the UI and settings to what is actually implemented.
- Sanitize rich HTML using a maintained server-side sanitizer or store/render plain text/structured content.
- Add tests proving non-admins cannot publish, drafts are not public, published version is visible, and hidden/missing policy fails closed.
- Confirm deployed Firestore rules and active `dynamic_pages/refund-policy` content before enabling customer requests.

## Phase outcome
Audit/report only; no source behavior changed. Static source assertions passed. No TypeScript build, Firestore Emulator, browser test, deployed-rule comparison, or production Firestore read was run.
