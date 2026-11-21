# JEMBEE PLAY — Firestore-controlled GitHub APK release channel

## Architecture
APK binary files are uploaded as assets to published, stable GitHub Releases in the official repository. Firestore stores the active release metadata and controls the versions exposed to the mobile app, Android TV app and website. Firebase Storage is not used by the APK release manager.

## Admin publishing workflow
1. Build and sign the Mobile or Android TV APK using the same permanent signing certificate used by previous releases.
2. Create a stable, non-draft and non-prerelease GitHub Release.
3. Upload the APK asset with the exact name `jembee-play-mobile-{versionName}.apk` or `jembee-play-tv-{versionName}.apk`.
4. In Admin > APK Manager, select platform and enter version name, increasing version code, minimum supported version and GitHub Release tag.
5. The server verifies the tag against the official repository, finds the exact asset, requires GitHub's SHA-256 digest, validates asset size and URL, and then transactionally writes `app_releases/{platform}`, `app_remote_config/current` and an audit event in Firestore.
6. Public release lookup reads metadata from Firestore; the download endpoint redirects only to a GitHub Release asset under the official repository.

## Security and limitations
- GitHub API is queried server-side; no GitHub credential is exposed to the browser or app.
- Only published stable releases and exact expected APK filenames are accepted.
- APK asset size must be between 1 byte and 250 MiB.
- GitHub API must expose a `sha256:{64 hex}` asset digest; publishing fails closed if the digest is unavailable.
- Version code and version name must increase. Rollback requires a newly signed build with a higher version code.
- Package IDs remain fixed to `in.jembeeplay.mobile` and `in.jembeeplay.tv`.
- APK binaries are public GitHub Release assets. Do not use this approach for confidential/private APK distribution.
- Android still requires the user to approve installation. This is not a silent updater.
- Real GitHub asset digest availability, release download, signed in-place Android update, Firestore transaction and full CI build remain QA gates.
- Keep the change in preview/review only. Do not merge or deploy to production during the existing review gate.
