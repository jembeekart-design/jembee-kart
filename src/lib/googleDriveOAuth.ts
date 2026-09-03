import { google } from "googleapis";
import crypto from "node:crypto";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";

function getOAuthConfig() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret =
    process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  const redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim();

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Google OAuth client configuration is incomplete"
    );
  }

  return { clientId, clientSecret, redirectUri };
}

export function createGoogleOAuthClient() {
  const {
    clientId,
    clientSecret,
    redirectUri,
  } = getOAuthConfig();

  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );
}

export function createGoogleAuthorizationUrl(
  uid: string
): string {
  const oauth2Client = createGoogleOAuthClient();

  const timestamp = Math.floor(Date.now() / 1000);

  const payload = JSON.stringify({
    uid,
    timestamp,
  });

  const encodedPayload = Buffer.from(payload).toString(
    "base64url"
  );

  const secret =
    process.env.MODERATION_PREVIEW_TOKEN_SECRET;

  if (!secret) {
    throw new Error(
      "MODERATION_PREVIEW_TOKEN_SECRET is not configured"
    );
  }

  const signature = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");

  const state = `${encodedPayload}.${signature}`;

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: true,
    scope: [DRIVE_SCOPE],
    state,
  });
}

export function verifyGoogleOAuthState(
  state: string
): { uid: string; timestamp: number } {
  const secret =
    process.env.MODERATION_PREVIEW_TOKEN_SECRET;

  if (!secret) {
    throw new Error(
      "MODERATION_PREVIEW_TOKEN_SECRET is not configured"
    );
  }

  const parts = state.split(".");

  if (parts.length !== 2) {
    throw new Error("Invalid OAuth state");
  }

  const [encodedPayload, providedSignature] = parts;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");

  const expected = Buffer.from(
    expectedSignature
  );
  const provided = Buffer.from(providedSignature);

  if (
    expected.length !== provided.length ||
    !crypto.timingSafeEqual(expected, provided)
  ) {
    throw new Error("Invalid OAuth state signature");
  }

  let payload: {
    uid?: string;
    timestamp?: number;
  };

  try {
    payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString(
        "utf8"
      )
    );
  } catch {
    throw new Error("Invalid OAuth state payload");
  }

  if (
    !payload.uid ||
    typeof payload.timestamp !== "number"
  ) {
    throw new Error("Invalid OAuth state payload");
  }

  const now = Math.floor(Date.now() / 1000);

  if (now - payload.timestamp > 10 * 60) {
    throw new Error("OAuth state expired");
  }

  return {
    uid: payload.uid,
    timestamp: payload.timestamp,
  };
}
