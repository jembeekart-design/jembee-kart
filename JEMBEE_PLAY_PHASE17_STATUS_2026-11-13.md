# JEMBEE PLAY Phase 17 — Copyright Claims Foundation

## Implemented
- Added `src/modules/trust-safety/copyrightClaim.ts` with bounded copyright-claim validation and explicit admin review action parsing.
- Added `POST /api/shorts/copyright-claims`, requiring Firebase bearer authentication with token revocation checking.
- Request body limited to 12 KB; validates claimant identity fields, email, HTTP(S) source-work URL, description, required good-faith/accuracy attestations, and electronic signature.
- Confirms target video exists and creates a deterministic, idempotent pending claim in `copyrightClaims`.
- Added Firestore rule denying all client reads/writes to `copyrightClaims` (server Admin SDK only).
- No automatic takedown or video deletion is performed.

## Verification
- `node --experimental-strip-types --test src/modules/trust-safety/__tests__/copyrightClaim.test.mjs`: 6 passed, 0 failed.
- Full Next.js build, ESLint, semantic TypeScript check, Firebase Emulator integration, email notice delivery, and statutory counter-notice/legal workflow have not been verified or implemented in this phase.

## Safety boundary
A submitted claim is an allegation, not a legal determination. Only an authorized, documented human review process may request a takedown or restoration. Paid-video and live payout flags remain unchanged.
