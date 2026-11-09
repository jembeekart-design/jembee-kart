# JEMBEE PLAY Shorts follow-up fixes

Applied to the supplied `JEMBEE_PLAY_FIREBASE_PERMISSION_FIX_2026-11-08.zip` source:

1. Kept the supplied scoped Firestore `users/{uid}/following/{targetUid}` rules.
2. Replaced the Shorts share helper direct client Firestore writes with an authenticated server API.
3. Added `/api/shorts/video-share`; it verifies Firebase ID tokens, checks approved/active/safe video state, and increments shares transactionally at most once per user/video.
4. Changed the native share bridge to share the public/attribution URL rather than the raw media URL.
5. Added an error callback to the Following snapshot listener.
6. Limited HTML video metadata preloading to the active video. Existing latest/visible five thumbnail preloading remains; no full-video download was introduced.

Validation: source edits and ZIP packaging completed. The focused route contract test was added but not executed here. Full TypeScript/Next.js build and runtime Firebase integration tests have NOT been run. Firestore rules must be deployed separately; source changes alone do not publish rules.

## Shorts render recovery follow-up (2026-11-09)

- Replaced the legacy `public/sw.js` third-party ad-network import with a minimal same-origin worker that activates/claims clients and does not cache video or load remote scripts. This allows an existing registration at `/sw.js` to update to the safe worker on the next browser update check.
- Removed `next/dynamic` with `ssr: false` from the Shorts route and statically imported the client components so the initial route can render server HTML instead of an empty client-only shell.
- Added `src/app/shorts/error.tsx` with a visible retry UI and error logging.
- Added `test:shorts-page` contract checks.
- Validation: page contract + share route contract tests passed (4/4); ZIP integrity passed. A full Next.js build was not run in this environment because dependencies are not installed here.
