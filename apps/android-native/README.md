# JEMBEE PLAY Native Android Apps

Two independent Android applications are maintained here:

- **Android Mobile** — `in.jembeeplay.mobile`, touch-first phone and tablet UI.
- **Android TV / Google TV** — `in.jembeeplay.tv`, landscape lean-back UI with D-pad navigation.

Both apps are video-first. They do not include JembeeKart shopping, cart, checkout, MLM or seller dashboards.

## Current implementation

- Native Jetpack Compose app shells with separate package IDs and themes.
- Mobile Home reads the approved public video catalog from `/api/app/video-catalog`.
- Mobile Shorts has a live approved-video list and Media3 playback.
- Mobile Learning opens the responsive school-learning experience at `/learn/school` inside a restricted HTTPS WebView.
- TV Home, Long videos and Shorts are separate catalog views with D-pad-selectable filters.
- TV playback uses AndroidX Media3; Back closes the player.
- TV Learning opens the school-learning experience in a restricted HTTPS WebView.
- Both apps read the server-controlled remote configuration and display maintenance state.
- Catalog responses are restricted to approved, active, safe, free videos. Native clients validate same-origin thumbnail and playback paths.

## Build debug APKs

The GitHub Actions workflow `.github/workflows/android-native.yml` builds both debug APKs using JDK 17, Android Gradle Plugin 8.9.1 and Gradle 8.11.1. Debug APKs are uploaded as a short-retention internal QA artifact, not a public release.

Build locally from this directory with Android SDK 35 and JDK 17 installed:

```bash
gradle --no-daemon :mobile:assembleDebug :tv:assembleDebug
```

Outputs:

- `mobile/build/outputs/apk/debug/mobile-debug.apk`
- `tv/build/outputs/apk/debug/tv-debug.apk`

## Not release-ready yet

The current source is a functional native foundation, not a signed Play Store release. The following work and evidence remain required:

1. Physical-device testing on multiple Android phones/tablets and an Android TV / Google TV device.
2. Verify real catalog, thumbnails, byte-range seeking, buffering, playback retry and lifecycle behavior against production.
3. Complete account authentication and account-bound features only after their mobile/TV scope and security flows are approved. Native authentication remains disabled in this build.
4. Connect and test saved videos, history, creator actions, upload, notifications and other account-dependent features.
5. Add final app icons, TV banner artwork, accessibility and performance review.
6. Configure protected release signing outside Git; never commit keystores or signing passwords.
7. Generate signed release APK/AAB, verify checksums, scan artifacts and complete Play Console policy review.

Do not publish debug APKs as production downloads. Do not enable paid checkout, paid entitlements or payouts from the native clients; those remain server-authoritative.
