JembeeKart security fix patch
================================
This ZIP contains only modified files, preserving their paths from the supplied archive.
No live deployment was performed. No Git commit or push was performed from this environment.

IMPORTANT BEFORE APPLYING
- Create a new Git branch first.
- Confirm your local repo matches the supplied ZIP/source tree.
- Inspect this patch before merging. A build may reveal existing TypeScript errors because next.config.ts no longer ignores them.
- Configure CLOUDINARY_MODERATION_WEBHOOK_SECRET in the server environment and in the webhook caller before enabling the webhook-protected route. Without it, the webhook fails closed (401).
- Qikink token endpoint now requires an admin Firebase ID token and returns connection status only, not the token.
- Root Qikink create-order was replaced with the nested server-priced implementation. It authenticates Firebase users and blocks prepaid until server-verified Cashfree payment support is configured.
- MLM merge now requires Firebase Bearer auth, binds userId to verified uid, accepts selected video MIME types and caps file size at 100 MiB. Verify the frontend sends Authorization: Bearer <Firebase ID token>.
- Watch-and-earn feature flag default is set false; this does not remove historical wallet/reward data or change unrelated MLM/referral earnings.
- Test on staging first. These are security-oriented changes and may affect clients relying on the old response format.


BUILD FIX ADDED
- Added jembeekart/src/firestore/businessRules/types.ts from the matching source archive because the patched nested defaults.ts imports ./types and TypeScript could not resolve it.
