# JEMBEE PLAY — Production Readiness Status

This archive is a source-level video-platform cleanup, not a production certification.

## Verified in this workspace
- Legacy non-video commerce and network-management application/API route directories were removed.
- Video pages now live under the `/videos` route namespace.
- Paid playback-session API now checks Firebase identity, approved/safe paid video state and a non-revoked purchase before issuing a short-lived HttpOnly/Secure cookie.
- Cashfree paid-video webhook is Shorts-only and writes purchase/settlement data transactionally.
- Node contract/unit tests cover paid-video checkout, webhook, playback session, refunds, settlement and teacher-referral calculations.

## Not verified here
- `npm ci` did not complete within the available execution window; therefore TypeScript compilation, ESLint and Next.js production build were not completed.
- Firebase Emulator rules, live Firebase/Google Drive OAuth, Cashfree Sandbox webhook delivery, upload lifecycle and Android Mobile/Android TV device playback were not executed.
- School Learning still contains demo question-answer videos and needs a validated Firestore question-to-approved-video mapping.

Do not enable production paid-video checkout or live creator payouts until the target environment's build, provider, Firestore rules, entitlement, refund, settlement and device tests pass.
