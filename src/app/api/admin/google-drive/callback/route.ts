import { NextResponse } from "next/server";
import {
  createGoogleOAuthClient,
  verifyGoogleOAuthState,
} from "@/lib/googleDriveOAuth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      return new NextResponse(
        `<h1>Google authorization cancelled</h1><p>${error}</p>`,
        {
          status: 400,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    if (!code || !state) {
      return new NextResponse(
        "<h1>Missing OAuth code or state</h1>",
        {
          status: 400,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const stateData = verifyGoogleOAuthState(state);

    const oauth2Client = createGoogleOAuthClient();

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      return new NextResponse(
        "<h1>No refresh token received</h1><p>Authorization succeeded, but Google did not return a refresh token. Please authorize again.</p>",
        {
          status: 400,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store",
          },
        }
      );
    }

    console.log(
      "Google Drive OAuth authorized for admin UID:",
      stateData.uid
    );

    const escapedToken = tokens.refresh_token
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

    return new NextResponse(
      `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>JembeeKart Google Drive Authorization</title>
</head>
<body style="font-family:Arial,sans-serif;padding:32px;max-width:900px;margin:auto">
<h1>Google Drive authorization successful</h1>
<p>Copy the refresh token below and add it to Vercel as:</p>
<pre>GOOGLE_OAUTH_REFRESH_TOKEN</pre>
<p><strong>Do not share this token with anyone.</strong></p>
<textarea readonly style="width:100%;height:120px">${escapedToken}</textarea>
<p>After adding it to Vercel, redeploy the application.</p>
</body>
</html>`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Google Drive OAuth callback error:", error);

    return new NextResponse(
      `<h1>Google Drive authorization failed</h1><p>${
        error instanceof Error ? error.message : "Unknown error"
      }</p>`,
      {
        status: 500,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
