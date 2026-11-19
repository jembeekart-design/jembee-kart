# JEMBEE PLAY Native Android Apps

This directory contains two independent, video-first Android applications:
- `mobile`: touch-first Android phone/tablet app (`in.jembeeplay.mobile`)
- `tv`: Android TV / Google TV lean-back app (`in.jembeeplay.tv`)

Shopping and MLM flows are intentionally out of scope.

## Current integrations

- Home and Shorts request the production `/api/app/video-catalog?limit=40` contract on `https://jembeeplay.in`.
- The clients accept only the server's approved catalogue stream and thumbnail URL paths.
- Playback uses AndroidX Media3 ExoPlayer and the existing website stream proxy.
- Learning reads published nodes from `/api/content-categories` and question answers from `/api/learning/school-video-answers`.
- Learning navigation currently follows the published hierarchy: Board → School → Class → Subject → Chapter → Question. Book nodes are not offered as a Chapter parent because the current server hierarchy parents chapters to subjects.
- Remote maintenance configuration is read from `/api/app/remote-config`.

The public native catalogue is free-video only. Paid playback must remain server-authorized; do not bypass entitlement checks or expose private Drive URLs in the app.

## Authentication and account actions — release blocker

Firebase sign-in/session persistence, account recovery, authenticated likes/comments/saves, and user-library sync are not implemented in these native clients yet. The repository does not currently provide a verified Android Firebase client configuration for both package IDs. Do not invent a Firebase project ID/API key or commit service-account credentials. Before implementation, configure the approved Firebase Android apps for both package IDs using the project's authorized Firebase Console setup, then add the non-secret client configuration through the approved secure repository process. Validate sign-in, token refresh, sign-out, and account recovery against staging before release.

## Build

Requires JDK 17, Android SDK 35, Android Gradle Plugin 8.9.1 and Gradle 8.11.1. From this directory, run:

<<<<<<< HEAD
## Security and release rules
- Never commit Firebase service-account keys, Cashfree secrets, signing keystores or passwords.
- Mobile and TV must use separate package IDs and release tracks.
- Do not enable paid checkout or payouts from the native clients. All entitlement and settlement decisions remain server-authoritative.
- Direct APK URLs must only be published after signed builds, SHA-256 checksums, malware scanning and device QA.
- Keep APK and AAB release artifacts for the same tested version; AAB is for later Play Console submission.


## Reproducible internal QA build

The repository workflow `.github/workflows/android-native.yml` builds both debug APKs on pull requests that touch this directory. The resulting `jembee-play-android-debug-apks` artifact is for internal installation and functional QA only; it is not a signed public release.

### Build locally

From this directory, with JDK 17, Android SDK 35, and Gradle 8.11.1 installed:

```bash
gradle --no-daemon :mobile:assembleDebug :tv:assembleDebug
```

Expected outputs:

- `mobile/build/outputs/apk/debug/mobile-debug.apk`
- `tv/build/outputs/apk/debug/tv-debug.apk`

### Release acceptance checklist

- Replace sample catalog cards with the production catalog API and verify empty/error/loading states.
- Add Firebase Authentication and account/session lifecycle.
- Connect video playback to the approved playback/session API; verify Drive/Cloudinary delivery, orientation, buffering and background/foreground recovery.
- Implement creator upload with server-side moderation and storage authorization.
- Wire learning-library book/chapter/question search and teacher answer flows.
- Keep paid-video entitlements and payment verification server-authoritative; do not enable checkout until backend integration is tested.
- Add notification registration/deep links, privacy disclosures, consent and account deletion flows.
- Add TalkBack/keyboard/remote navigation, accessibility, crash reporting and offline/network failure tests.
- Produce separately signed Mobile and TV release APKs/AABs using protected signing secrets; record SHA-256 checksums and verify installs on physical devices.

A debug artifact must never be represented as a production release.
=======
```sh
gradle --no-daemon :mobile:assembleDebug :tv:assembleDebug
```

The GitHub Actions workflow `.github/workflows/android-native-apk.yml` builds both debug APKs and uploads them as a short-lived workflow artifact when its configured trigger runs. A debug APK is for QA only, not a Play Store release.

## Release gates

- Successful CI build for both modules, with APK artifacts inspected.
- Firebase authentication and session recovery implemented and tested.
- Touch navigation, TV D-pad/focus navigation, playback, background/foreground, and network failure behavior tested on physical devices/emulators.
- Confirm API contracts and stream authorization on staging using free and paid test accounts.
- Add signed release configuration outside source control; generate and verify release APK/AAB and SHA-256 checksums.
- Complete Play Console policy, privacy, data-safety, TV banner/icon, and store listing checks.

Never commit service-account keys, signing keystores, passwords, Cashfree secrets, or other private credentials. Do not enable paid checkout or payouts from native clients. Do not publish APK download links until signed builds, malware scanning, and device QA are complete.
>>>>>>> origin/pr-87
