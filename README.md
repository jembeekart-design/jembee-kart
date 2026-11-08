# JEMBEE PLAY — Video Platform

This source package contains the JEMBEE PLAY video platform only. Legacy legacy non-video commerce and network-management routes/modules have been removed from this package.

## Included
- Shorts/video feed and video playback
- Creator upload and Google Drive resumable upload/OAuth integration
- Video moderation, reports, comments, likes and notifications
- School Learning catalog and education admin entry point
- Cashfree paid-video checkout verification, playback entitlement and refund reconciliation
- Monetag video advertising/revenue tooling and video expense evidence
- Creator profiles, followers and platform administration
- Mobile/Android TV video-app settings

## Safety gates
- Paid-video checkout must remain disabled until Cashfree webhook, payment verification, playback-session and entitlement tests pass in the target environment.
- Live creator payouts must remain disabled until settlement implementation and required reconciliation tests are verified.
- Creator settlement ledger entries are not wallet credits and do not trigger payouts.
- The project uses environment variables for Firebase Admin, Google Drive and Cashfree credentials. Never commit `.env*` or service-account files.

## Local setup
1. Use Node.js 22 LTS.
2. Install dependencies with `npm ci`.
3. Configure `.env.local` from the deployment secret store; do not add real credentials to this archive.
4. Run `npm run build` and the paid-video test scripts before deployment.

68 Node contract/unit tests pass in this workspace. Dependency installation did not complete, so TypeScript and the Next.js production build were not verified. This archive is a source cleanup/integration package, not a declaration of production readiness.
