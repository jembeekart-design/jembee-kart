import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const fail = (error: string, status: number) => NextResponse.json({ success: false, error }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  try {
    const header = req.headers.get("authorization") || "";
    if (!header.startsWith("Bearer ")) return fail("Authentication required", 401);
    const decoded = await getAdminAuth().verifyIdToken(header.slice(7).trim(), true);
    const body = await req.json().catch(() => null);
    const shareId = typeof body?.shareId === "string" ? body.shareId.trim() : "";
    const videoId = typeof body?.videoId === "string" ? body.videoId.trim() : "";
    if (!/^[A-Za-z0-9_-]{24,80}$/.test(shareId) || !/^[A-Za-z0-9_-]{3,50}$/.test(videoId)) return fail("Invalid share reference", 400);
    const db = getAdminDb();
    const shareRef = db.collection("monetagShareAttributions").doc(shareId);
    const claimRef = db.collection("monetagShareClaims").doc(`${shareId}_${decoded.uid}`);
    await db.runTransaction(async (tx) => {
      const [shareSnap, claimSnap, videoSnap] = await Promise.all([tx.get(shareRef), tx.get(claimRef), tx.get(db.collection("watchEarnVideos").doc(videoId))]);
      if (!shareSnap.exists || !videoSnap.exists) throw new Error("SHARE_NOT_FOUND");
      const share = shareSnap.data() || {};
      const video = videoSnap.data() || {};
      if (share.videoId !== videoId || share.status !== "created" || share.selfShare === true ||
          typeof share.sharerUserId !== "string" || !share.sharerUserId ||
          share.sharerUserId === decoded.uid || share.sharerUserId === video.creatorId ||
          video.status !== "approved" || video.active !== true || video.moderation !== "safe") throw new Error("SHARE_NOT_ELIGIBLE");
      const createdAt = share.createdAt?.toDate?.()?.getTime?.();
      if (!Number.isFinite(createdAt) || Date.now() - createdAt > 7 * 24 * 60 * 60 * 1000 || createdAt > Date.now() + 5 * 60 * 1000) throw new Error("SHARE_EXPIRED");
      if (!claimSnap.exists) tx.create(claimRef, { shareId, videoId, buyerUid: decoded.uid, sharerUid: share.sharerUserId, creatorUid: video.creatorId, status: "claimed", createdAt: FieldValue.serverTimestamp(), attributionSource: "authenticated_share_link_claim" });
    });
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const status = code === "auth/id-token-expired" || code === "auth/argument-error" ? 401 : code === "SHARE_NOT_FOUND" ? 404 : code.startsWith("SHARE_") ? 409 : 500;
    return fail(status === 401 ? "Session expired" : status === 404 ? "Share link not found" : status === 409 ? "Share link is not eligible" : "Could not record share attribution", status);
  }
}
