import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { readBoundedJson } from "@/lib/server/readBoundedJson";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ success: false, message: "शेयर attribution के लिए लॉगिन करें।" }, { status: 401 });
    const decoded = await getAdminAuth().verifyIdToken(authHeader.slice(7).trim());
    const parsed = await readBoundedJson(req, 8 * 1024);
    if (!parsed.ok) return NextResponse.json({ success: false, message: parsed.message }, { status: parsed.status });
    if (!parsed.value || typeof parsed.value !== "object" || Array.isArray(parsed.value)) return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 });
    const body = parsed.value as Record<string, unknown>;
    const videoId = typeof body.videoId === "string" ? body.videoId.trim() : "";
    if (!videoId || videoId.length > 180) return NextResponse.json({ success: false, message: "वीडियो ID मान्य नहीं है।" }, { status: 400 });
    const db = getAdminDb();
    const videoSnap = await db.collection("watchEarnVideos").doc(videoId).get();
    if (!videoSnap.exists) return NextResponse.json({ success: false, message: "वीडियो नहीं मिला।" }, { status: 404 });
    const video = videoSnap.data() || {};
    const uploaderUserId = String(video.creatorId || video.uploaderUserId || "").trim();
    if (!uploaderUserId) return NextResponse.json({ success: false, message: "इस वीडियो का verified uploader ID उपलब्ध नहीं है।" }, { status: 409 });
    const shareId = randomUUID();
    await db.collection("monetagShareAttributions").doc(shareId).create({ shareId, videoId, uploaderUserId, sharerUserId: decoded.uid, createdAt: FieldValue.serverTimestamp(), status: "created", attributionSource: "authenticated_share_action", selfShare: decoded.uid === uploaderUserId, landingCount: 0, lastLandingAt: null });
    const origin = new URL(req.url).origin;
    const url = `${origin}/mlm/watch-earn?v=${encodeURIComponent(videoId)}&ref=${encodeURIComponent(shareId)}`;
    return NextResponse.json({ success: true, shareId, url, uploaderUserId, sharerUserId: decoded.uid, selfShare: decoded.uid === uploaderUserId });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const status = code === "auth/id-token-expired" || code === "auth/argument-error" ? 401 : 500;
    return NextResponse.json({ success: false, message: status === 401 ? "लॉगिन समाप्त हो गया। दोबारा लॉगिन करें।" : "Share attribution रिकॉर्ड नहीं हो सका।" }, { status });
  }
}
