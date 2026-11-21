# JEMBEE PLAY — Admin-controlled direct APK release channel

## Scope
The web Admin APK Manager publishes separately signed Android Mobile and Android TV APKs to a private Firebase Storage path. A server-only API verifies the object metadata and SHA-256 stream checksum, enforces increasing Android version codes, writes the active release record and updates the existing public remote-config document transactionally.

## Release path
1. Admin signs in and uploads a .apk to app-releases/{mobile|tv}/{versionCode}/{platform}-{versionCode}.apk.
2. Firebase Storage rules allow create-only writes from an authenticated admin or super_admin; clients cannot read, overwrite or delete release files.
3. Admin API verifies package ID, platform, version code, object size/type/custom metadata and independently calculates SHA-256 from the stored object stream.
4. A Firestore transaction publishes app_releases/{platform}, increments app_remote_config/current.configVersion, updates latest/minimum versions and sets the official website update page URL. An audit event is appended.
5. Public /api/app/releases/{platform} returns release metadata and a 15-minute signed download URL only for an active published release.
6. Native clients already read remote config and open the HTTPS update page. The website download cards resolve the active release at request time.

## Safety
- APK maximum size: 250 MiB.
- APK package IDs are fixed to in.jembeeplay.mobile and in.jembeeplay.tv.
- SHA-256 is independently recomputed server-side.
- Version code must increase; rollback is a new build with a higher version code.
- The same persistent signing certificate must be used for in-place updates. Debug APKs must never be published as releases.
- Android installation still requires user confirmation and permission for installs from the chosen source.
- No arbitrary code or configuration is downloaded/executed by remote config.

## Required environment verification before production
- Confirm the Firebase Storage bucket configured for the target Firebase project.
- Run Storage Emulator rules tests and route contract tests.
- Verify admin upload, denied non-admin upload, size/type rejection, checksum mismatch, monotonic version code, signed URL expiry and Android in-place update on real devices.
- Configure persistent Android signing secrets in GitHub Actions. Never commit keystore files or passwords.
- Keep all changes preview-only until the existing 2–3 day review gate is complete.
