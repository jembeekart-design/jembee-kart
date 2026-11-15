# JEMBEE PLAY — Enterprise Multi-Platform Release Blueprint

Date: 2026-11-15
Branch: enterprise-platform-foundation-2026-11-15

## Product decisions
- Website defaults to Light Mode. Theme choices: Light, Dark and System.
- Native Android Mobile and Android TV / Google TV are separate applications with independent navigation, playback and release artifacts.
- The website has a public Download Centre at /download.
- Initial Android distribution is direct HTTPS APK download from the website; Play Store publication is deferred.
- The Android release pipeline must also produce signed AAB artifacts and store listing metadata so a later Play Console submission does not require rebuilding the product.
- iOS is a separate native target and release workflow. A normal IPA file is not presented as a universally installable website download. Until eligible distribution is established, provide the web/PWA experience and prepare the native iOS project for later App Store submission.
- No download URL is enabled until a signed artifact, checksum, version, compatibility matrix, malware/security scan and physical-device smoke tests are recorded.

## Download Centre contract
- Route: /download
- Mobile APK URL env: NEXT_PUBLIC_JEMBEE_ANDROID_MOBILE_APK_URL
- TV APK URL env: NEXT_PUBLIC_JEMBEE_ANDROID_TV_APK_URL
- If an env URL is absent, show a clear unavailable state; never link to a guessed file or placeholder APK.
- PWA installation uses the browser's beforeinstallprompt event where available. Other browsers receive accurate manual install guidance.
- Do not imply PWA is a native APK.

## Native app architecture (target)
### Android Mobile
- Dedicated native project and application ID, signed release APK + AAB.
- Touch-first Home, Shorts, Explore, School Learning, Library, Creator Studio, Notifications and Account.
- Shared API/authentication contracts with the website; no separate or duplicated financial ledger.
- Secure token storage, deep links, upload retry/resume, network recovery and accessible theme settings.
- Offline downloads are explicit opt-in, encrypted where feasible, revocable and distinct from playback preloading.

### Android TV / Google TV
- Separate TV app target and application ID, signed release APK + AAB.
- Lean-back 10-foot layout, D-pad focus graph, focus restoration, remote Back behavior, readable typography and playback controls.
- TV-safe discovery, search, learning, watchlist and account pairing.
- Validate on emulator and physical Android TV / Google TV devices.

### iOS
- Separate native target, bundle identifier, signing and App Store archive workflow.
- Do not expose IPA as a generic direct-install download for users in India.
- Keep shared backend contracts and design tokens; use iOS-native interaction patterns.

## Release gates
1. Product parity and route/API contract review.
2. Security: auth/session storage, deep links, upload validation, dependency audit, secrets scan.
3. Accessibility: contrast, text scaling, screen reader labels, keyboard/D-pad focus.
4. Performance: cold start, feed thumbnail loading, playback startup and memory.
5. Device matrix: Android phone/tablet, Android TV, Google TV and supported browsers.
6. Signed artifacts, SHA-256 checksums, version manifest, rollback and release notes.
7. Activate public direct-download URLs only after all required gates pass.
8. Later store submission uses the same tested release candidate and store-specific metadata.

## Current implementation status
- Download Centre route and environment-gated links are added.
- PWA install prompt is handled when supported; otherwise manual browser guidance is shown.
- Native Android and iOS application source projects, signed binaries, device certification and store archives are NOT yet delivered by this web-repository change.
- No fake download link or unverified APK is published.
