# JEMBEE PLAY Ads Repair – 2026-11-15

## Changes in this repair

- Shorts ExoClick now sends non-billable operational diagnostics for VAST request, ad start, completion, no-fill, SDK error, ad error, and timeout.
- Shorts ad slots now obey the same Global Ads Master switch and deployment ExoClick feature flag as other ad placements. The public configuration endpoint is fetched with `no-store`; failures fail closed.
- Shorts status messages are Hindi-first and explain automatic continuation when no ad is available.
- Admin Ad Network Diagnostics explains that `ad_no_fill` means the provider did not return a playable ad for that request.
- Existing Monetag, long-video schedule, paid-video disclosure, and payout/settlement safeguards are retained.

## Validation

Targeted Node contract tests: 26 passed, 0 failed:
- ad diagnostics API contract
- Shorts auto-ad and no manual Play Ad control
- Shorts diagnostics and global master gating
- long-video ad schedule contract
- ExoClick configuration contract
- Monetag placement contract

## Important production limitations

These are source-level and contract tests, not a live publisher-network certification. They do not prove that ExoClick's publisher account, zone IDs, targeting, inventory, or VAST response is active. Real Preview QA is still required on Android Chrome and desktop.

Mobile browser autoplay / IMA SDK initialization can be restricted by browser user-gesture policies. If the diagnostic log shows `ad_no_fill`, investigate the ExoClick zone/account/inventory. If it shows `sdk_error` or `ad_error`, investigate IMA/browser integration. No-fill cannot be repaired by changing UI switches alone.

Keep Production ad switches and live payouts disabled until real VAST playback, no-fill fallback, and long-video pre-roll/mid-roll have been verified.
