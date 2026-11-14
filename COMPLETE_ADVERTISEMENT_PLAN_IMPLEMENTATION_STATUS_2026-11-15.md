# JEMBEE PLAY — Complete Advertisement Plan Implementation Status

Date: 2026-11-15
Source archive reviewed: `jembee-kart-main.zip`

## Implemented in this source update

1. Added a global Admin advertisement master switch (`masterEnabled`), default OFF. It gates both public Monetag sponsored placements and ExoClick long-video playback.
2. Kept separate Free and Paid Long Video ad settings, including audience enable switches, optional pre-roll, first mid-roll, repeat interval, maximum ads, minimum gap, and custom break times.
3. Connected the Long Video player to the public, secret-free schedule endpoint. Mid-roll eligibility is based on the media element's `currentTime`; paused, seeking, and buffering states are ignored. The schedule enforces maximum ads and minimum gap.
4. Added a bounded 10-second VAST request fallback and cleanup for IMA loader/manager resources. No-fill/error/timeout falls back to content playback instead of permanently blocking the video.
5. Added the required Paid Video advertising disclosure to the purchase gate and paid-video watch view. The Cashfree create-order, verification, webhook, and playback-session code was not modified by this ad patch.
6. Added an Admin-controlled Monetag placement for School Learning. Existing Home, Explore, and Videos placements remain allowlisted. Direct Link cards still open only after a user click; no global Monetag tags, popups, or auto-redirects were added.
7. Added source contract tests for master gating, audience schedule, media-time mid-roll behavior, Paid Video disclosure, and Monetag Learning placement.

## Safety defaults

- `masterEnabled=false` by default.
- Long-video master and audience switches remain OFF by default.
- `NEXT_PUBLIC_EXOCLICK_VIDEO_ADS_ENABLED=false` remains in `.env.example`.
- Production environment must not set the ExoClick flag until publisher zone IDs and device QA are verified.
- Monetag slots are returned only when the master switch is ON, the individual slot is Admin-enabled, the placement is allowlisted, the deployment environment matches, and the Direct Link is valid HTTPS.
- Shorts ad policy remains separate and its legacy automatic/timed feed ads remain disabled.
- `/api/ads/event` continues to reject untrusted client billing events. This prevents fake client-side impressions/clicks from becoming settlement evidence.
- Existing Monetag aggregate sync remains `aggregate_only_unallocated`; no creator/sharer earnings or payouts are generated from aggregate reports.

## Verification completed here

- `node --test src/lib/ads/__tests__/exoclick-config.test.mjs src/lib/ads/__tests__/monetag-manual-placements.test.mjs src/app/videos/components/__tests__/long-video-ad-schedule.test.mjs`
- Result: 18 tests passed, 0 failed.

## Not production-approved / external checks still required

1. Confirm ExoClick VAST zone IDs `6089786` (long video) and `6089790` (Shorts) in the publisher dashboard. This archive cannot prove that those zones are active or return valid VAST fill.
2. Verify the ExoClick response and no-fill behavior on real Android devices and supported browsers. Source contract tests do not simulate IMA/VAST network delivery.
3. Verify each Monetag Direct Link and creative in the publisher dashboard, then exercise Preview (`test`) and Production placements with real Admin configuration.
4. Admin request/error log dashboard is not complete. The existing ad event endpoint intentionally rejects untrusted browser events; trustworthy provider-side diagnostics/settlement evidence must be designed before recording billable impressions or clicks.
5. The Creator 30% / Sharer 20% / Platform 50% split must be applied only after verified ad revenue and verified attribution. This patch does not create or activate payouts and does not repurpose paid-video settlement ledgers.
6. A dependency-backed TypeScript/ESLint/production build was not run in this isolated archive workspace because `node_modules` is not included. Run `npm ci`, TypeScript, ESLint, and `npm run build` in the user's Termux/Ubuntu environment before merge/deploy.

## Release decision

**Preview QA only — not approved for Production activation.** Keep the global Admin master OFF and ExoClick environment flag OFF until the external checks above pass. Do not enable live payouts or begin bulk video uploads as part of this ad patch.
