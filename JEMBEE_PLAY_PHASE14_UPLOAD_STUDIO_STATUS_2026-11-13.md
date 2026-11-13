# JEMBEE PLAY Phase 14 — Creator Upload Studio hardening

## Implemented
- Added bounded validation/normalization for creator-supplied upload metadata.
- Integrated it into the authenticated Google Drive resumable-upload session endpoint.
- Limits caption to 2,200 chars, hashtags to 30 (50 chars each), display name to 80, username to 40, music to 160, and source IDs to 200 chars.
- Deduplicates and normalizes hashtags; accepts only HTTPS photo URLs.
- Validates optional duration and keeps paid-video price at zero; paid publishing remains disabled.
- Existing 500 MB file validation, Drive resumable session creation, 2 concurrent session cap, 30-second cooldown, completion and recovery endpoints remain in place.

## Tests
- Added focused metadata contract tests. These are source-level tests; they do not replace a full Next.js build or live Google Drive/Firebase integration test.

## Not verified
- Full TypeScript semantic check, ESLint, production build, Firebase Emulator, real Drive upload/recovery, browser upload UI and mobile upload.
- No GitHub push, deployment, bulk upload, paid-video activation or payout activation was performed.
