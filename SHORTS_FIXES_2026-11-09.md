# JEMBEE PLAY Shorts follow-up fixes

Applied to the supplied `JEMBEE_PLAY_FIREBASE_PERMISSION_FIX_2026-11-08.zip` source:

1. Kept the supplied scoped Firestore `users/{uid}/following/{targetUid}` rules.
2. Replaced the Shorts share helper direct client Firestore writes with an authenticated server API.
3. Added `/api/shorts/video-share`; it verifies Firebase ID tokens, checks approved/active/safe video state, and increments shares transactionally at most once per user/video.
4. Changed the native share bridge to share the public/attribution URL rather than the raw media URL.
5. Added an error callback to the Following snapshot listener.
6. Limited HTML video metadata preloading to the active video. Existing latest/visible five thumbnail preloading remains; no full-video download was introduced.

Validation: source edits and ZIP packaging completed. The focused route contract test was added but not executed here. Full TypeScript/Next.js build and runtime Firebase integration tests have NOT been run. Firestore rules must be deployed separately; source changes alone do not publish rules.
