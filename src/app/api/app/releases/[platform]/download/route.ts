import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ platform: string }> }) {
  const { platform } = await context.params;
  if (platform !== "mobile" && platform !== "tv") return NextResponse.json({ success: false }, { status: 404 });
  try {
    const snap = await getAdminDb().collection("app_releases").doc(platform).get();
    const release = snap.data();
    const target = typeof release?.githubAssetUrl === "string" ? new URL(release.githubAssetUrl) : null;
    if (!snap.exists || !release || release.active !== true || !target ||
        target.hostname !== "github.com" ||
        !target.pathname.startsWith("/jembeekart-design/jembee-kart/releases/download/")) {
      return NextResponse.json({ success: false, error: "Release unavailable" }, { status: 404 });
    }
    return NextResponse.redirect(target.toString(), { status: 302, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("APK download redirect failed:", error);
    return NextResponse.json({ success: false, error: "Download temporarily unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
