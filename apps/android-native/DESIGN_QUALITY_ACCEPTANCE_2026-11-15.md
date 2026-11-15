# JEMBEE PLAY Native App Design Quality Gates

## Product bar
The Android Mobile and Android TV / Google TV apps must feel like premium, purpose-built video products—not a web page wrapped in an app. The target is a polished, high-investment product experience. This is a quality target, not a claim about actual project expenditure.

The website is the baseline for product identity. Native apps must exceed it in native usability, motion, responsiveness, focus behavior and playback ergonomics while retaining the JEMBEE PLAY brand.

## Shared brand system
- Keep a recognizable JEMBEE PLAY wordmark, consistent blue/cyan accent, restrained dark ink surfaces and accessible light theme.
- Use a deliberate type scale, consistent spacing tokens, rounded media surfaces and clear hierarchy. Avoid emoji or text glyphs as final navigation icons.
- Use real creator avatars, thumbnails, durations and metadata from approved APIs. Never present fabricated sample content as live content.
- Every loading, empty, offline, error, maintenance and restricted/paid state must have a designed UI—not a blank screen or raw exception.
- Respect system font scaling, contrast, touch target sizes, reduced motion and light/dark theme.

## Android Mobile acceptance
- Phone-first layout must adapt cleanly from compact phones through large phones and tablets. No clipped labels, horizontal page overflow or tiny tap targets.
- Bottom navigation remains reachable with one hand; selected state is obvious and destinations preserve their scroll state.
- Home feed uses a clear editorial hierarchy: featured content, continue watching, recommended videos, learning discovery and creator discovery. Do not show empty decorative shelves when API data is absent.
- Shorts uses edge-to-edge vertical playback, safe-area-aware controls, readable creator details and thumb-reachable actions. Do not simulate playback with a static play glyph.
- Search, learning catalog, library, profile, sign-in and creator entry points must have real navigation and defined loading/empty/error states.
- Video cards must preserve thumbnail aspect ratio and avoid black flashes; preload only visible/current and next 4–5 metadata/thumbnails. Preload only a lightweight initial playback segment; never silently download entire videos.
- Accessibility: semantic labels, TalkBack order, minimum 48dp touch targets and text scaling.

## Android TV / Google TV acceptance
- Design for a 10-foot viewing distance with large typography, high-contrast selected/focused states and generous card spacing.
- Every interactive element must be reachable using only a D-pad and Select/Back. Focus must never disappear, jump unpredictably or become trapped.
- Use horizontal shelves with predictable focus restoration; Back returns to the previous screen/shelf position.
- Playback controls must be TV-native: play/pause, seek, captions/audio where supported, next/previous where relevant, clear focus ring and timeout behavior.
- No touch-only gestures, hover-only actions, dense mobile layouts or tiny text.
- Support landscape TV dimensions and safe overscan margins; do not stretch phone UI to fill a television.

## Functional quality gates before final design review
1. Live Firebase authentication and account/session recovery.
2. Real approved video catalog and cursor pagination.
3. Secure playback, byte-range seeking, buffering/retry and thumbnail loading.
4. Shorts feed, likes/shares/comments and moderation-safe actions.
5. Learning hierarchy from board through question-level answer videos.
6. Library, watch history and creator profile flows.
7. Server-authoritative paid-video entitlements; checkout remains disabled until Cashfree verification is complete.
8. Admin-controlled remote config and maintenance/error recovery.
9. Phone/tablet matrix plus physical Android TV / Google TV remote testing.
10. Performance, accessibility, crash-free and release-signing checks.

## Release evidence
- Record screenshots/video from representative phone sizes, tablet, Android TV emulator and physical TV device.
- Record D-pad navigation paths and focus screenshots.
- Verify API-backed content rather than demo fixtures.
- Run accessibility checks, startup/feed/playback performance checks and regression tests.
- Signed release APK/AAB, checksum, version metadata and Play Console readiness are separate from debug CI builds.

## Review order
Complete the functional gates first. Then conduct one consolidated review of website, mobile and TV together, revise the visual system, and only then approve production release. Do not bulk-upload launch videos or enable payouts before the corresponding readiness gates pass.
