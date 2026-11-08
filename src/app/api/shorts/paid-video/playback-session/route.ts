import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { readBoundedJson } from "@/lib/server/readBoundedJson";
import { createPlaybackToken, playbackCookieName } from "@/lib/payments/cashfreeServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const authorization = req.headers.get("authorization") || "";
    if (!authorization.startsWith("Bearer ")) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    const decoded = await getAdminAuth().verifyIdToken(authorization.slice(7).trim(), true);
    const parsed = await readBoundedJson(req, 4096);
    if (!parsed.ok) return NextResponse.json({ success: false, error: parsed.message }, { status: parsed.status });
    const body = parsed.value as Record<string, unknown>;
    const videoId = typeof body.videoId === "string" ? body.videoId.trim() : "";
    if (!/^[A-Za-z0-9_-]{3,200}$/.test(videoId)) return NextResponse.json({ success: false, error: "Invalid video" }, { status: 400 });
    const db = getAdminDb();
    const [videoSnap, purchaseSnap] = await Promise.all([
      db.collection("watchEarnVideos").doc(videoId).get(),
      db.collection("watchVideoPurchases").doc(`${videoId}_${decoded.uid}`).get(),
    ]);
    const video = videoSnap.data() || {}; const purchase = purchaseSnap.data() || {};
    if (!videoSnap.exists || video.status !== "approved" || video.active !== true || video.moderation !== "safe" || video.videoAccess !== "paid" || video.paidVideoStatus !== "enabled" || video.paidCheckoutEnabled !== true) return NextResponse.json({ success: false, error: "Paid video is not available" }, { status: 409 });
    if (!purchaseSnap.exists || purchase.status !== "paid" || purchase.accessRevoked === true || purchase.userId !== decoded.uid || purchase.videoId !== videoId) return NextResponse.json({ success: false, error: "Verified purchase required" }, { status: 403 });
    const token = createPlaybackToken(decoded.uid, videoId);
    const cookie = `${playbackCookieName(videoId)}=${encodeURIComponent(token)}; Path=/api/shorts/; HttpOnly; Secure; SameSite=Lax; Max-Age=900`;
    return NextResponse.json({ success: true, expiresIn: 900 }, { headers: { "Set-Cookie": cookie, "Cache-Control": "no-store", "Pragma": "no-cache" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "unknown";
    console.error("Paid playback session could not be issued:", code);
    const status = code.includes("auth") || code.includes("ID token") ? 401 : 500;
    return NextResponse.json({ success: false, error: status === 401 ? "Authentication required" : "Playback session unavailable" }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
