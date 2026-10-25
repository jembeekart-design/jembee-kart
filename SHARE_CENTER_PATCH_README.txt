JembeeKart Share Center patch

Included paths are relative to the project root. Extract this patch over the project root, preferably on a separate Git branch.

What this patch adds:
- Replaces the video feed bottom navigation Earn shortcut with Share and routes it to /share.
- Adds /share dashboard showing share events, attributed in-player watch-time, follower-attribution records, goal progress and reward review status.
- Adds authenticated server API at /api/share-center using Firebase Admin ID-token verification.
- Records share events only after the native share/copy action succeeds.
- Tracks in-player time in 15-second increments only for shared links carrying ?shareBy=<uid>. The server deduplicates by owner + viewer + video and rejects a different session for the same combination, so replaying/reopening that same video does not add more time.
- Milestone target is 2,000 recorded share actions plus 60,000 attributed seconds. When both are reached, a 15-day review window is recorded. This patch does NOT transfer ₹200 to a wallet automatically; it only displays review status, so payment requires a separately reviewed admin/payout workflow.

Important limitations / deployment checks:
- Firebase Admin server credentials must already be configured for the API, using the project's existing @/firebase/admin setup.
- Firestore server collections used: shareCenterEvents, shareCenterWatchers, shareCenterRewards. Server API uses Firebase Admin, so these records are not written from the browser.
- A share action is counted after navigator.share resolves or a copy fallback succeeds. Browsers do not reveal which external app was selected for the native share sheet; those are labeled "native".
- Watch time is only collected when the shared link includes shareBy and the video plays in JembeeKart. External WhatsApp/Facebook watch duration cannot be measured by this website.
- Follower attribution endpoint support exists, but wiring it into the current follow action requires testing the actual share-owner/follow-target relationship. This patch does not fabricate follower attribution.
- User-supplied shareBy query parameter is attribution, not proof of an external share. Fraud-resistant signed attribution links and admin review are recommended before any cash payout.
- Build and live Firestore tests must be run in the target repo before merge/deploy. Do not deploy directly to production without checking build and existing Google Drive upload/playback.
