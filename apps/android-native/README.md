# JEMBEE PLAY Native Android Apps

This directory contains two independent, video-first Android applications:
- `mobile`: touch-first Android phone/tablet app (`in.jembeeplay.mobile`)
- `tv`: Android TV / Google TV lean-back app (`in.jembeeplay.tv`)

Shopping and MLM flows are intentionally out of scope.

## Current integrations

- Home and Shorts use the production catalogue contract at `https://jembeeplay.in/api/app/video-catalog`.
- Clients accept only approved catalogue stream and thumbnail URL paths.
- Playback uses AndroidX Media3 ExoPlayer and the existing website stream proxy.
- Learning reads published nodes from `/api/content-categories` and question answers from `/api/learning/school-video-answers`.
- Remote maintenance configuration is read from `/api/app/remote-config`.
- Paid playback remains server-authorized; private Drive URLs are never exposed in the app.

## Known release blockers

Firebase sign-in/session persistence, account recovery, authenticated likes/comments/saves, and user-library sync are not implemented in these native clients. The repository does not contain verified Android Firebase client configuration for both package IDs. Configure the approved Firebase Android apps through Firebase Console before implementing authentication. Never invent Firebase credentials or commit service-account keys.

Creator upload with server-side moderation and storage authorization, notification registration/deep links, privacy disclosures, consent, account deletion, and complete learning-library book/chapter/question flows also require implementation and QA before public release.

## Build

Requires JDK 17, Android SDK 35, Android Gradle Plugin 8.9.1 and Gradle 8.11.1.

```sh
gradle --no-daemon :mobile:assembleDebug :tv:assembleDebug
```

Expected outputs:
- `mobile/build/outputs/apk/debug/mobile-debug.apk`
- `tv/build/outputs/apk/debug/tv-debug.apk`

The GitHub Actions workflow `.github/workflows/android-native.yml` builds both debug APKs and uploads them as a short-lived workflow artifact. These are internal QA builds only, not signed public releases. A documentation-only commit may be used to rerun this build after a native source fix; it does not change app behavior.

## Release acceptance checklist

- Verify the production catalogue's loading, empty, pagination, and error states.
- Implement and test Firebase Authentication, token refresh, sign-out, and account recovery.
- Test touch navigation and TV D-pad/focus navigation on physical devices or emulators.
- Verify playback, orientation, buffering, background/foreground recovery, and network failures.
- Validate free and paid playback authorization against staging; do not bypass server entitlements.
- Complete creator upload, moderation, learning, notification, privacy, and account-deletion flows.
- Add accessibility, crash reporting, and offline/network failure tests.
- Produce separately signed Mobile and TV release APKs/AABs using protected signing secrets; record SHA-256 checksums and verify installs.

Never commit service-account keys, signing keystores, passwords, payment secrets, or other private credentials. Do not enable paid checkout or payouts from native clients. Do not publish debug APKs as production releases.


## Mobile APK update channel

The mobile app now checks the public remote config for `latestVersions.mobile`,
`minimumVersions.mobile`, and `updateUrls.mobile`. When a newer version and a
valid HTTPS APK URL are configured, the app offers an update, downloads the APK
with Android DownloadManager, and opens Android's package installer. Android
still requires the user to approve installation; the app cannot silently install
an APK on a normal non-rooted device.

Configure the current remote config document `app_remote_config/current` with:
- `latestVersions.mobile`: latest published version, e.g. `0.2.0`
- `minimumVersions.mobile`: minimum supported version, e.g. `0.1.0`
- `updateUrls.mobile`: permanent HTTPS URL to the matching `mobile` APK

Only publish APKs signed with the same persistent release keystore. Android
rejects an in-place update if the signing certificate changes. The current
GitHub Actions debug APK workflow uses runner debug signing and is for QA only;
it is not a permanent auto-update distribution channel. Before enabling updates
for existing QA installs, install the first consistently signed release build
(the first install may require uninstalling the old debug APK). Keep the release
keystore and passwords in protected GitHub Actions secrets; never commit them.

The TV app has not yet been wired to this mobile update prompt. Its update channel
must be implemented and tested separately before configuring `latestVersions.tv`
or `updateUrls.tv`.
