import { NextResponse } from "next/server";
import {
  createGoogleOAuthClient,
  verifyGoogleOAuthState,
} from "@/lib/googleDriveOAuth";
import { saveGoogleDriveRefreshToken } from "@/lib/googleDriveTokenStore";
import { getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

const HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store, max-age=0",
  "Pragma": "no-cache",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy":
    "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
};

function html(status: number, body: string) {
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><title>JembeeKart Google Drive</title></head><body style="font-family:Arial,sans-serif;padding:32px;max-width:720px;margin:auto">${body}</body></html>`,
    { status, headers: HEADERS }
  );
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      return html(400, "<h1>Google authorization cancelled</h1><p>Authorization was denied or cancelled. You may retry from the admin settings page.</p>");
    }
    if (!code || !state) {
      return html(400, "<h1>Missing OAuth response</h1><p>The authorization response is incomplete. Please restart the connection flow.</p>");
    }

    const stateData = verifyGoogleOAuthState(state);
    const users = getAdminDb().collection("users");
    const directUser = await users.doc(stateData.uid).get();
    let userData = directUser.exists ? directUser.data() : undefined;
    if (!userData) {
      const matchingUser = await users.where("uid", "==", stateData.uid).limit(1).get();
      userData = matchingUser.docs[0]?.data();
    }
    if (userData?.role !== "admin" && userData?.role !== "super_admin") {
      return html(403, "<h1>Admin access required</h1><p>The account that started authorization is no longer an administrator. Restart from an authorized admin account.</p>");
    }

    const oauth2Client = createGoogleOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      return html(400, "<h1>No refresh token received</h1><p>Google did not return a refresh token. Revoke the previous app grant if necessary, then authorize again.</p>");
    }

    await saveGoogleDriveRefreshToken(tokens.refresh_token, stateData.uid);

    console.info("Google Drive OAuth credentials stored securely for admin UID:", stateData.uid);
    return html(200, "<h1>Google Drive authorization successful</h1><p>The refresh token has been encrypted and stored server-side. It was not displayed in this browser.</p><p>You may close this window and return to the admin panel.</p>");
  } catch (error) {
    // Never log OAuth codes, state payloads, or provider tokens.
    console.error("Google Drive OAuth callback failed:", error instanceof Error ? error.message : "Unknown error");
    return html(500, "<h1>Google Drive authorization failed</h1><p>The credential could not be stored securely. Check server configuration and retry.</p>");
  }
}
