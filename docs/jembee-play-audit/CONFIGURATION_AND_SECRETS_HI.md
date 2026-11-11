# Configuration and secret handling

Use `.env.example` as a variable-name inventory only. Copy it to `.env.local` for a local deployment and fill values through your private secret manager. The real `.env.local` must never enter Git or a source archive.

## Important classifications
- `NEXT_PUBLIC_FIREBASE_*` and `NEXT_PUBLIC_APP_URL` are browser-visible configuration. Firebase API keys are not authorization; Firestore/Storage rules and server authorization are the security boundary.
- `FIREBASE_PRIVATE_KEY`, `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS`, Google OAuth client secret/refresh token, Cashfree encryption key, playback token secret, moderation preview secret, Cloudinary API secret and webhook secret are server-side secrets.
- Existing `MONETAG_*` variables belong to legacy Monetag integration. They do not represent an approved Adsterra/manual Banner/Native implementation. Leave them empty unless the provider is separately approved and configured.
- Source currently references the legacy variable `NEXT_PUBLIC_AI_MODERATION_KEY` in `src/services/aiModerationAdapter.ts`. Do not put a real provider key in this variable. A `NEXT_PUBLIC_*` secret can be exposed to browser JavaScript. Before AI moderation is enabled, refactor the provider call into a server-only API/service and use a server-only variable such as `AI_MODERATION_API_KEY`.
- Do not invent or add Adsterra scripts/zone IDs before checking the user's Adsterra account approval and exact allowed formats. Current source is not an Adsterra integration.

## Required target-environment checks
1. Confirm Firebase project ID and domain; deploy Firestore and Storage rules to an emulator first.
2. Verify server Admin SDK credentials and Google Drive read/upload behavior without exposing public Drive URLs for paid videos.
3. Keep Cashfree and paid-video flags disabled until sandbox webhook signature, INR amount, idempotency, entitlement, refund and playback checks pass.
4. Keep creator payouts disabled until manual settlement reconciliation is signed off.
5. Enable ads only at explicit Admin placements after provider policy and approval; paid lessons and child-directed experiences must follow their ad-free/default restrictions.
