# Google Drive OAuth secure token storage

The OAuth callback stores the Google refresh token in Firestore document
`system_secrets/google_drive_oauth`, encrypted with AES-256-GCM. The token is
never returned to the browser.

## Required server environment variable

Set `GOOGLE_OAUTH_TOKEN_ENCRYPTION_KEY` in the hosting provider's server-side
environment configuration. It must be exactly 64 hexadecimal characters
(32 random bytes). Generate a value with:

```bash
openssl rand -hex 32
```

Do not commit this value, place it in a `NEXT_PUBLIC_` variable, or share it
through chat, screenshots, or client-side configuration. Configure it for the
same deployment environments that run the OAuth callback and Google Drive
server APIs.

## Migration

`GOOGLE_OAUTH_REFRESH_TOKEN` remains as a temporary server-only fallback for
deployments that have not yet completed OAuth again. Once the encrypted
Firestore record is populated and verified, remove the legacy environment
variable from the hosting provider.

The encryption key must remain stable. If it is lost or rotated without
re-encrypting the stored token, the stored credential cannot be decrypted and
Google Drive operations will fail until OAuth is authorized again.

Firestore access uses Firebase Admin SDK. Do not add client read/write rules
for `system_secrets`.
