# JEMBEE PLAY — Video Platform Integration Status

## Scope
This package is cleaned for the JEMBEE PLAY video platform. Non-video commerce and network-management routes/modules are not included. Video pages now live under `/videos`.

## Retained features
- Shorts feed and longer video playback
- Creator upload, resumable Google Drive upload, OAuth and moderation
- Comments, likes, reports, notifications, creator profiles and follows
- School Learning UI and education administration entry point
- Cashfree paid-video checkout, server verification, signed webhook, purchase entitlement, refund reconciliation and protected stream/thumbnail routes
- Monetag video ad and revenue tooling, video ad placement and expense evidence
- Mobile/Android TV video-app settings and platform admin controls

## Known limitations before production
1. The School Learning UI still contains sample question-answer video records; connect it to a validated Firestore catalog and approved video mapping before presenting those as live lessons.
2. The paid-video playback-session endpoint issues a short-lived video-scoped HttpOnly/Secure cookie only after authenticated purchase and video eligibility checks. Verify this in the target HTTPS/Firebase environment.
3. Thumbnail metadata and browser cache behavior should be verified with real Drive-backed records and mobile network throttling. The feed preloads thumbnails and metadata for only the active/next four videos; it does not auto-download full videos.
4. Verify Google OAuth redirect URI, encrypted refresh-token storage, Drive folder scope, Firebase Admin credentials, Firestore rules, Cashfree sandbox configuration and webhook signature settings.
5. Run `npm ci`, TypeScript, production build, all Node contract/unit tests, upload lifecycle, byte-range stream, paid entitlement/revocation and mobile/Android TV playback tests in the target environment.

## Financial safety
- Paid-video checkout stays disabled until the target environment's payment, webhook, entitlement and refund tests pass.
- Live creator payouts stay disabled until settlement and reconciliation tests are verified.
- Settlement ledger entries do not directly credit wallets or trigger payouts.
- The video-specific teacher referral is separate from a multilevel referral tree and is calculated only from verified platform net profit.
