# Jembee Shorts — app identity

- Public product name: **Jembee Shorts**
- Product scope: video and short-form video only.
- User-facing brand name must remain “Jembee Shorts” on splash, login, signup, feed, upload, profile, settings, notifications, payment return, and Android app surfaces.
- Theme policy: fixed source-controlled palette; no runtime/admin/user theme customization.
- Fixed palette:
  - Background: `#05070B`
  - Surface/card: `#111827`
  - Primary/accent: `#06B6D4`
  - Secondary accent: `#8B5CF6`
  - Main text: `#F8FAFC`
  - Muted text: `#CBD5E1`
  - Border: `#263244`
- Main web entry: `/` redirects to `/shorts`.
- Main Shorts feed: `/shorts`.
- Legacy `/mlm/watch-earn` entry redirects to `/shorts`.
- This ZIP is the web source project. Native Android Mobile/Android TV Gradle projects and signed APK/AAB artifacts are not present in the supplied backup and must be built/tested separately.

## Delivery status

This first source conversion includes the Shorts web entry/feed reuse, fixed CSS palette,
public brand updates, and retirement redirects for public shopping/MLM pages. It does not
claim a successful production build or a tested Android release. The original ZIP contains
no native Android Gradle project, so APK/AAB generation and physical Mobile/TV testing remain
separate release tasks.


## Live feed connection
The Shorts feed uses the existing Firestore `watchEarnVideos` collection. See `FIREBASE_CONNECT_BEFORE_LIVE_FEED.md`. Real videos require the existing Firebase Web config in local `.env.local` and valid Firestore read rules; no credentials are bundled.
