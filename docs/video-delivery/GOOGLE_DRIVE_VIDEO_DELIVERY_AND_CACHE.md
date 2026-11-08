# JEMBEE PLAY — Google Drive video delivery and thumbnail cache

## Provider decision

Google Drive remains the video object store. Do not migrate uploaded video objects to Firebase Storage as part of this work.

## Existing server-side delivery path

- Uploads use the Google Drive resumable upload session in `src/services/googleDriveService.ts`.
- Approved video bytes are served by `src/app/api/shorts/video-stream/[videoId]/route.ts`.
- The stream endpoint checks the Firestore `watchEarnVideos` record, approval/active/moderation state, Drive parent folder, MIME type, and bounded HTTP byte ranges.
- Paid playback remains fail-closed and requires the video-scoped playback cookie plus a matching paid purchase record. Do not weaken this check.
- Thumbnails are proxied by `src/app/api/shorts/video-thumbnail/[videoId]/route.ts`; raw Drive thumbnail URLs must not be placed in client markup.

## Cache and loading policy

- Free thumbnail responses can be cached privately by the signed-in browser for 5 minutes, with a 10-minute stale-while-revalidate window.
- Paid thumbnail responses remain `private, no-store` and keep the same purchase/playback authorization checks.
- Video elements use the optional `thumbnailUrl` as their poster and use `preload=auto` only for the active item; inactive items use metadata preload.
- Feed integration should pass the proxy URL `/api/shorts/video-thumbnail/{videoId}` as `thumbnailUrl` for each approved record. Do not pass Drive URLs directly.
- The feed controller should only prefetch thumbnails for the visible item and up to the next four items (maximum five). Avoid preloading entire video files. Only the active item's stream may use eager/auto preload; the server still enforces bounded byte ranges.
- Offline full-video downloads must remain a separate explicit user action.

## Important integration boundary

The School Learning page in this ZIP still contains four clearly labelled demo answers and a sample test clip. It does not yet query a production Firestore school-question-to-video mapping. It cannot be presented as live teacher content until that mapping is implemented, verified, and populated with approved Drive-backed records. The existing Drive stream route reads `watchEarnVideos`; a school catalog adapter must resolve an approved record ID and then use the same protected stream route.

## Required production checks

1. Configure Google OAuth client ID, secret, redirect URI, refresh token store, and Drive folder ID on the server only.
2. Confirm the service account/OAuth principal can read the configured folder and upload destination.
3. Verify resumable upload completion and persist the returned Drive file ID against the moderation record.
4. Verify Drive thumbnail availability; videos without a Drive thumbnail need a generated thumbnail workflow before publication.
5. Test free and paid byte-range playback, revoked purchase access, pending moderation, wrong Drive parent, expired upload sessions, and large-file seeking.
6. Never enable paid playback or live payouts until payment, entitlement, ledger, and reconciliation tests pass.
