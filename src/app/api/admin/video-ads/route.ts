import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";
import { verifyMonetagAdmin } from "@/lib/server/monetagAdminAuth";
import { DEFAULT_VIDEO_ADS_RULES } from "@/lib/ads/videoAdsRules";
import { validateVideoAdsRules } from "@/lib/ads/videoAdsRules";
import { readBoundedJson } from "@/lib/server/readBoundedJson";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function statusFor(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  return code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500;
}

export async function GET(req: Request) {
  try {
    await verifyMonetagAdmin(req);
    const snap = await getAdminDb().collection("business_rules").doc("videoAds").get();
    const rules = validateVideoAdsRules({ ...DEFAULT_VIDEO_ADS_RULES, ...(snap.data() || {}) });
    return NextResponse.json({ success: true, rules }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = statusFor(error);
    return NextResponse.json({ success: false, message: status === 401 ? "कृपया लॉगिन करें।" : status === 403 ? "केवल Admin यह सेटिंग बदल सकता है।" : "Video Ads settings लोड नहीं हुईं।" }, { status });
  }
}

export async function PUT(req: Request) {
  try {
    const uid = await verifyMonetagAdmin(req);
    const parsed = await readBoundedJson(req, 8 * 1024);
    if (!parsed.ok) return NextResponse.json({ success: false, message: parsed.message }, { status: parsed.status });
    if (!parsed.value || typeof parsed.value !== "object" || Array.isArray(parsed.value)) return NextResponse.json({ success: false, message: "Invalid settings." }, { status: 400 });
    const rules = validateVideoAdsRules(parsed.value as import("@/lib/ads/videoAdsRules").VideoAdsRules);
    await getAdminDb().collection("business_rules").doc("videoAds").set({ ...rules, updatedAt: new Date(), updatedBy: uid }, { merge: true });
    return NextResponse.json({ success: true, rules });
  } catch (error) {
    const status = statusFor(error);
    return NextResponse.json({ success: false, message: status === 401 ? "कृपया लॉगिन करें।" : status === 403 ? "केवल Admin यह सेटिंग बदल सकता है।" : "Video Ads settings सेव नहीं हुईं।" }, { status });
  }
}
