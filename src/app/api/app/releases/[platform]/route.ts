import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ platform: string }> }) {
  const { platform } = await context.params;
  if (platform !== "mobile" && platform !== "tv") return NextResponse.json({ success: false, error: "Invalid platform" }, { status: 400 });
  try {
    const snap = await getAdminDb().collection("app_releases").doc(platform).get();
    const release = snap.data();
    if (!snap.exists || !release || release.active !== true || typeof release.githubAssetUrl !== "string") {
      return NextResponse.json({ success: true, available: false }, { headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({
      success: true, available: true, platform, packageName: release.packageName,
      versionName: release.versionName, versionCode: release.versionCode,
      minimumVersionName: release.minimumVersionName, releaseNotes: release.releaseNotes || "",
      sha256: release.sha256, sizeBytes: release.sizeBytes,
      downloadUrl: "/api/app/releases/" + platform + "/download",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Public APK release lookup failed:", error);
    return NextResponse.json({ success: false, error: "Release unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
