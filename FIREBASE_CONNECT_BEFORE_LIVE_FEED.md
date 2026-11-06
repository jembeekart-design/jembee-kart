# Jembee Shorts — connect the existing Firebase project

This source ZIP contains the real Firestore video-feed code. It reads documents from the existing `watchEarnVideos` collection and expects a publicly playable video URL in each document's `video` field. It does not contain your Firebase credentials, and this ZIP cannot connect to a private project until you supply them locally.

## 1. Configure the existing Firebase Web app

In the existing JembeeKart Firebase project, open Project settings → General → Your apps → Web app. Copy the Web app config into `.env.local` using `.env.example` as the template:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Do not create a new Firebase project if the existing JembeeKart project is the intended backend.

## 2. Admin-only features

For server-side Admin SDK routes, configure the existing project's service account using `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` (with newlines represented as `\\n`), or `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS`. Never share or commit the service-account JSON/private key.

## 3. Firestore video feed

The feed reads from `watchEarnVideos`, ordered by `createdAt` descending, up to 50 documents. Each video document should include at least:

- `video`: playable HTTPS video URL
- `createdAt`: numeric timestamp used for ordering
- `caption`: string (optional)
- `userId` or `creatorId`: creator UID (recommended)

Optional supported fields include `username`, `displayName`, `photoURL`, `thumbnail`, `hashtags`, `music`, `verified`, `likes`, `comments`, `shares`, `views`, `videoAccess`, and `videoPrice`.

Firestore rules must allow the intended app users to read published videos. Do not make private user or admin collections public to fix feed access.

## 4. Restart after configuration

Stop the dev server with Ctrl+C, then run:

```bash
npm run dev
```

Open `http://localhost:3000/shorts`.

## Important

The feed is wired to the existing Firebase/Firestore implementation, but no real connection or live-video test can be claimed until valid project configuration and access rules are supplied and tested. No fake video records or engagement counts are added by this ZIP.
