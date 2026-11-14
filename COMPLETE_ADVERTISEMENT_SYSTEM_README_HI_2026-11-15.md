# JEMBEE PLAY — Complete Advertisement System Update

## Included application behavior

- Global Admin ad master switch remains OFF by default and gates long-video ads plus Monetag manual placements.
- Free and Paid long-video schedules remain separate. The Admin controls pre-roll, first mid-roll, repeat interval, maximum ad attempts, minimum mid-roll gap, and custom breaks.
- Long-video scheduling reads the media element's `currentTime`; it does not advance while paused or buffering. One IMA ad request is active at a time.
- IMA request timeout and a bounded ad-playback watchdog resume content after timeout/error. Ads are not allowed to block content indefinitely.
- Monetag Direct Link placements remain allowlisted and click-only. No auto-tag, popup, popunder, or automatic redirect is introduced.
- Admin Ads Manager now includes operational provider status and recent diagnostic events.

## Diagnostic event safety

`POST /api/ads/diagnostics` accepts a small allowlist of event/provider/placement values, has a per-IP-hash rate limit, stores no raw IP address, and marks all events `billable: false`. It is operational telemetry only. It must never be used to calculate ad impressions, clicks, creator/sharer shares, or payouts. Admin-only `GET /api/admin/ad-diagnostics` returns the latest 100 events.

Firestore collections used:

- `ad_diagnostics` — operational events; documents include `expiresAt` (30 days).
- `ad_diagnostic_rate_limits` — short-lived rate limit counters; documents include `expiresAt` (2 hours).

For automatic cleanup, configure Firestore TTL policies in Firebase Console for the `expiresAt` field on both collections. Until TTL is configured, the expiry field is informational and old documents are not automatically deleted.

## Production gates

- Keep `NEXT_PUBLIC_EXOCLICK_VIDEO_ADS_ENABLED=false` until ExoClick confirms the VAST zone IDs and Android/browser device QA passes.
- Keep `business_rules/videoAds.masterEnabled=false` until Preview QA is approved.
- Configure Monetag Direct Links individually in the correct Preview/Production environment. Test each page placement by clicking the user-visible card.
- No client diagnostic event is trusted billing evidence. Revenue settlement requires independent provider-side verified revenue and verified attribution; aggregate imports remain unallocated until reconciled.
- Creator 30% / Sharer 20% / Platform 50% is not activated by this change. No payout route or paid-video Cashfree gate is modified.
- Do not enable live payouts or start bulk video upload as part of this ad update.

## Verification

The targeted Node contract suite covers the existing ExoClick/Monetag/schedule contracts plus the diagnostic ingestion, admin access, and UI wiring. This archive does not contain `node_modules`; run dependency-backed TypeScript, ESLint, production build, real VAST fill, and device QA in the Termux/Ubuntu project environment before merge or production activation.
