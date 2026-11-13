# JEMBEE PLAY remediation package — 2026-11-13

## Scope of this package
This package is a source-level remediation increment based on the supplied `main` source archive. It is **not certified as a complete production release** and does not claim all 40 master-plan phases are complete.

## Implemented in this increment
- Added a server-side Education School catalog API.
  - Public GET returns approved schools only.
  - Admin GET (Firebase ID token + server-side Admin role verification) can inspect the review queue.
  - Admin POST validates input, limits payload size, uses deterministic IDs, prevents duplicate school records, and creates records in `pending` status.
  - Admin review endpoint supports approve/reject and writes an audit record.
- Connected the School Management admin page to the API instead of the former validation-only prototype.
- Connected the learner School page's board-to-school step to approved catalog records instead of hard-coded empty arrays.
- Corrected the Firestore rule scope for `admin_settings/mobile_app` so only Admins can read/write that settings document (previously only `customize` was permitted).

## Important limitations still open
- The rest of the School hierarchy (Class → Subject/Book → Chapter → Question → approved video answer mapping) remains sample/static and is not complete.
- Teacher management, teacher verification, reviews/ratings, email, WhatsApp, private student-teacher messaging, courses/progress/certificates, support/disputes, Android Mobile native app, Android TV/Google TV native app, and complete analytics still need implementation and integration testing.
- Monetag/AdSense provider-side configuration, Firebase production credentials/rules deployment, Google Drive OAuth, Cashfree webhook and refund/entitlement verification, email provider, WhatsApp Business API, CDN, backup restore, legal review, and real-device acceptance cannot be verified from this source ZIP alone.
- Existing paid-video and payout safety gates must remain disabled until their full acceptance tests pass.
- No production deployment, live payout enablement, or paid-video enablement was performed.

## Required verification before production
1. Run `npm ci`.
2. Run `npx tsc --noEmit --incremental false --pretty false`.
3. Run `npm run lint`.
4. Run `npm run build`.
5. Run the existing paid-video, referral, upload, streaming, moderation and revenue tests.
6. Run Firebase Emulator Rules tests and integration tests for school create/duplicate/review/public visibility.
7. Deploy Firestore rules and API only to a staging project, then verify using real Admin and non-Admin accounts.
8. Complete the remaining 40-phase acceptance matrix before calling this production-ready.
