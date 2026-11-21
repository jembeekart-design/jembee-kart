import { NextResponse } from "next/server";
import { getAdminDb, getAdminStorage } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ platform: string }> }) {
  const { platform } = await context.params;
  if (platform !== "mobile" && platform !== "tv") return NextResponse.json({ success: false }, { status: 404 });
  try {
    const snap = await getAdminDb().collection("app_releases").doc(platform).get();
    const release = snap.data();
    if (!snap.exists || !release || release.active !== true || typeof release.storagePath !== "string") {
      return NextResponse.json({ success: false, error: "Release unavailable" }, { status: 404 });
    }
    const file = getAdminStorage().bucket().file(release.storagePath);
    const [exists] = await file.exists();
    if (!exists) return NextResponse.json({ success: false, error: "APK file unavailable" }, { status: 404 });
    const filename = "jembee-play-" + platform + "-" + String(release.versionName) + ".apk";
    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 5 * 60 * 1000,
      responseDisposition: 'attachment; filename="' + filename + '"',
    });
    return NextResponse.redirect(signedUrl, 302, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("APK download redirect failed:", error);
    return NextResponse.json({ success: false, error: "Download temporarily unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
