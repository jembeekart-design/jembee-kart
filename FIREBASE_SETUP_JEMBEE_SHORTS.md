# Firebase setup for Jembee Shorts

## Local preview
The app now has a local-only placeholder Firebase configuration so the Jembee Shorts interface can be opened without crashing when no Firebase environment file is present. The placeholder does not connect to any real database, account, storage bucket, or payment system. Sign-in, uploads, live video data, notifications, and admin-backed features will not work until real credentials are configured.

## Connect the existing Firebase project
1. Copy `.env.example` to `.env.local`.
2. In Firebase Console, open the EXISTING JembeeKart Firebase project.
3. Open Project settings → General → Your apps → Web app.
4. Copy the Web app config values into the six `NEXT_PUBLIC_FIREBASE_*` variables.
5. For server-side admin features, create/download a service account key from Project settings → Service accounts. Keep it private. Set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` (preserve newlines as `\\n`), or set `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS` to the JSON on one line.
6. Restart the dev server after editing `.env.local`.

Never commit `.env.local`, service-account JSON, or private keys to GitHub.
