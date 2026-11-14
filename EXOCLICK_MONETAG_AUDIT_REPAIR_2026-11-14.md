# JEMBEE PLAY — ExoClick & Monetag audit / repair

Date: 2026-11-14
Source archive: `JEMBEE_PLAY_EXOCLICK_MONETAG_SOURCE_2026-11-14.zip`

## Repairs made

1. Added `NEXT_PUBLIC_EXOCLICK_VIDEO_ADS_ENABLED=false` to `.env.example`. ExoClick video ads therefore remain opt-in and disabled by default in a fresh deployment configuration.
2. Hardened the long-video IMA player: it now keeps a reference to the IMA AdsLoader, applies a 10-second ad-request timeout, clears that timeout when the ad manager loads, and destroys both the manager and loader on fallback/unmount. A stalled ad request no longer leaves the long video waiting indefinitely.
3. Added regression checks for the ExoClick default-off setting, bounded ad request, and loader cleanup.

## Verified source behavior

- ExoClick long-video and Shorts VAST URLs use HTTPS and have explicit zone IDs in `src/lib/ads/exoclick.ts`.
- ExoClick client-side VAST playback requires `NEXT_PUBLIC_EXOCLICK_VIDEO_ADS_ENABLED=true`.
- Shorts ad insertion is conditional and has a user-controlled Continue action; the ad is not forced to play when the user continues.
- Monetag is currently implemented as admin-managed HTTPS Direct Link / Smart Link cards at a fixed allowlist of page placements. It is **not** loading Monetag global tags, MultiTag, Popunder, Vignette, or In-Page Push scripts. The user must click the sponsored card.
- The public Monetag placement endpoint filters by enabled status, exact placement, format/provider, and deployment environment, and validates HTTPS destinations and creative URLs.
- Monetag aggregate API/CSV revenue is not proof of per-user attribution. Existing code explicitly keeps aggregate-only sync unallocated unless separate verified attribution exists.

## Remaining checks before production activation

- Confirm that ExoClick zone IDs `6089786` and `6089790` are the correct active VAST zones in the actual ExoClick publisher dashboard. The recommendation ID `6089796` is declared but no recommendation ad implementation was found in this source.
- Run real-device playback checks for long video and Shorts, including no-fill, slow VAST response, SDK blocked, swipe-away, and ad completion. A source-level test cannot prove that a provider will return fill.
- Verify Monetag Smart Links and creative assets in the Monetag publisher account, then test each intended `test` and `production` Firestore placement.
- Do not enable real revenue settlement based only on aggregate Monetag reports. Keep user-level earnings and payouts gated until verified records and reconciliation tests support them.

## Test results

- ExoClick configuration and player contract tests: **5 passed**.
- Monetag placement contract tests selected for this audit: **5 passed**.
- A broader pre-repair test selection also exposed two unrelated stale contract assertions: one expects a native `<video controls playsInline preload="metadata">` element although the current long-video page uses the custom ExoClick player; another expects an older Explore category source shape and counts zero. These were not silently changed as part of the ad-network repair.
- `npm ci --no-audit --no-fund` exceeded the available execution window, so a full dependency-backed TypeScript/ESLint/Next.js production build was **not completed** in this run.

## Production status

**Not approved for live activation yet.** The code remains fail-closed by default. Provider dashboard verification and full production build/device QA are still required.
