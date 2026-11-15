# Native Mobile and TV App Foundation

Date: 2026-11-15
Branch: native-mobile-tv-app-foundation-2026-11-15

## Decisions
- Android Mobile and Android TV / Google TV are separate native Kotlin + Jetpack Compose applications.
- Application IDs: `in.jembeeplay.mobile` and `in.jembeeplay.tv`.
- Both share the JEMBEE PLAY web backend and server-authoritative business rules; neither app owns a separate wallet, revenue ledger or paid-video entitlement decision.
- Mobile is touch-first with bottom navigation and responsive shelves.
- TV uses Android TV Leanback launcher metadata and TV Material Compose surfaces with remote focus navigation.
- Both include Light/Dark presentation state in the initial UI shell; theme persistence and account sync are future integration tasks.

## Source created
- `apps/android-native/settings.gradle.kts`
- `apps/android-native/build.gradle.kts`
- `apps/android-native/gradle.properties`
- `apps/android-native/mobile/` — mobile application module and Compose home shell
- `apps/android-native/tv/` — TV application module, Leanback launcher and TV Compose home shell

## Explicitly not complete
- No Gradle wrapper checked in; generate/validate with Android Studio and pinned Gradle distribution before CI.
- No Android SDK or Gradle build was run in this remote GitHub editing session.
- No Firebase Auth, API client, secure token storage, upload pipeline, playback SDK, notifications, offline download manager, analytics or monetization integration is wired.
- UI shelves currently use sample labels only.
- No signed APK/AAB artifacts or SHA-256 manifests are produced.
- Physical Android phone/tablet, Android TV and Google TV tests are outstanding.

## Next engineering stages
1. Generate Gradle wrapper and pin verified Android Gradle Plugin / Kotlin / Compose versions.
2. Run both module builds and resolve dependency/API compatibility.
3. Implement shared API/auth contracts, secure session storage and server-controlled feature gating.
4. Replace sample shelves with approved API feed and real playback.
5. Implement theme persistence, account settings, notifications, upload and learning flows.
6. Add D-pad focus tests, accessibility, network resilience, app links and security tests.
7. Produce signed APK and AAB per app; publish direct links only after device QA and checksum verification.
