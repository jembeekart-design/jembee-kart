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


## Android APK update channel (Mobile + TV)

Both native apps check the public remote config for their own `latestVersions`,
`minimumVersions`, and `updateUrls` channel. When a newer version and a valid
HTTPS update page URL are configured, the app shows an update prompt and opens
that page in the browser. The native apps intentionally do not request
`REQUEST_INSTALL_PACKAGES` or sideload APKs. For seamless and trusted in-app
updates, distribute the apps through Google Play and use Play In-App Updates.

Configure the Firestore document `app_remote_config/current`:
- `latestVersions.mobile` / `latestVersions.tv`: currently published version
- `minimumVersions.mobile` / `minimumVersions.tv`: minimum supported version
- `updateUrls.mobile` / `updateUrls.tv`: HTTPS update page (prefer official Play Store listing)

The API defaults both latest versions to `0.2.0` (the current native app version),
minimum versions to `0.1.0`, and update URLs to empty. Therefore no update prompt
is shown until a newer version AND its HTTPS update page URL are published.

Only publish APKs signed with the same persistent release keystore. Android
rejects an in-place update if the signing certificate changes. GitHub Actions
debug APKs use runner debug signing and are QA-only, not a permanent auto-update
channel. Existing QA installs may need to be uninstalled before the first
consistently signed release install. Keep the keystore and passwords in protected
GitHub Actions secrets; never commit them.

## Signed release APK CI

The Android workflow builds signed Mobile and TV release APKs when all four
repository Actions secrets are configured:

- `ANDROID_RELEASE_KEYSTORE_BASE64`
- `ANDROID_RELEASE_STORE_PASSWORD`
- `ANDROID_RELEASE_KEY_ALIAS`
- `ANDROID_RELEASE_KEY_PASSWORD`

The keystore must remain backed up securely and must be reused for every
subsequent update. The workflow publishes the signed APKs as the
`jembee-play-android-signed-release-apks` artifact. Debug APKs are for QA only.

