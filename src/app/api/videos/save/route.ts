import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TOKEN_LENGTH = 10_000;
const MAX_BODY_BYTES = 4 * 1024;
const savedDocumentId = (videoId: string, uid: string) =>
  createHash("sha256").update(uid).update("\0").update(videoId).digest("hex");

export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization") || "";
    if (!authorization.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const token = authorization.slice(7).trim();
    if (!token || token.length > MAX_TOKEN_LENGTH) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const decoded = await getAdminAuth().verifyIdToken(token, true);
    const db = getAdminDb();
    const savedCollection = db.collection("savedWatchVideos");
    const requestedVideoId = req.nextUrl.searchParams.get("videoId")?.trim() || "";
    if (requestedVideoId) {
      if (requestedVideoId.length > 200 || /[\/\\]/.test(requestedVideoId)) {
        return NextResponse.json({ success: false, message: "Invalid video ID" }, { status: 400 });
      }
      const savedDocument = await savedCollection.doc(savedDocumentId(requestedVideoId, decoded.uid)).get();
      // Read legacy keys during migration so existing saved items remain visible.
      const legacyDocument = savedDocument.exists ? null : await savedCollection.doc(`${requestedVideoId}_${decoded.uid}`).get();
      return NextResponse.json({ success: true, saved: savedDocument.exists || Boolean(legacyDocument?.exists) }, { headers: { "Cache-Control": "no-store" } });
    }
    const snapshot = await savedCollection
      .where("userId", "==", decoded.uid)
      .limit(200)
      .get();
    const videoIds = [...new Set(snapshot.docs
      .map((item) => item.data().videoId)
      .filter((id): id is string => typeof id === "string" && id.length > 0 && id.length <= 200 && !/[\\/]/.test(id)))];
    const videoRefs = videoIds.map((id) => db.collection("watchEarnVideos").doc(id));
    const videoSnapshots = videoRefs.length ? await db.getAll(...videoRefs) : [];
    const availableIds = videoSnapshots.filter((item) => {
      const video = item.data();
      return item.exists && video?.status === "approved" && video?.active === true &&
        video?.moderation === "safe" && video?.videoAccess === "free";
    }).map((item) => item.id);
    return NextResponse.json({ success: true, videoIds: availableIds }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const unauthorized = message.includes("Firebase ID token") || message === "UNAUTHORIZED";
    console.error("Saved video list load failed:", error);
    return NextResponse.json(
      { success: false, message: unauthorized ? "Unauthorized" : "Saved videos are temporarily unavailable" },
      { status: unauthorized ? 401 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization") || "";
    if (!authorization.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authorization.slice(7).trim();
    if (!token || token.length > MAX_TOKEN_LENGTH) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = await getAdminAuth().verifyIdToken(token, true);
    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
      return NextResponse.json({ success: false, message: "Request too large" }, { status: 413 });
    }
    const body = (() => { try { return JSON.parse(raw); } catch { return null; } })();
    const videoId = typeof body?.videoId === "string" ? body.videoId.trim() : "";
    const saved = body?.saved;

    if (!videoId || videoId.length > 200 || /[\/\\]/.test(videoId) || typeof saved !== "boolean") {
      return NextResponse.json({ success: false, message: "Invalid save request" }, { status: 400 });
    }

    const db = getAdminDb();
    const videoRef = db.collection("watchEarnVideos").doc(videoId);
    const saveRef = db.collection("savedWatchVideos").doc(savedDocumentId(videoId, decoded.uid));
    const legacySaveRef = db.collection("savedWatchVideos").doc(`${videoId}_${decoded.uid}`);

    const result = await db.runTransaction(async (transaction) => {
      const videoSnap = await transaction.get(videoRef);
      const saveSnap = await transaction.get(saveRef);
      const legacySaveSnap = await transaction.get(legacySaveRef);

      // Unsave must remain possible even after a video is removed, unpublished,
      // made private, or converted to paid access.
      if (!saved) {
        if (saveSnap.exists) transaction.delete(saveRef);
        if (legacySaveSnap.exists) transaction.delete(legacySaveRef);
        return { saved: false };
      }

      if (!videoSnap.exists) return { error: "VIDEO_UNAVAILABLE" as const };
      const video = videoSnap.data();
      // Only public, approved, active and safe videos may be saved. Paid/private
      // content is deliberately excluded; authorization is never inferred here.
      if (
        video?.status !== "approved" ||
        video?.active !== true ||
        video?.moderation !== "safe" ||
        video?.videoAccess !== "free"
      ) {
        return { error: "VIDEO_UNAVAILABLE" as const };
      }

      if (!saveSnap.exists && !legacySaveSnap.exists) {
        transaction.create(saveRef, {
          videoId,
          userId: decoded.uid,
          createdAt: Date.now(),
        });
      }

      return { saved: true };
    });

    if ("error" in result) {
      return NextResponse.json({ success: false, message: "Video is unavailable" }, { status: 404 });
    }

    return NextResponse.json({ success: true, saved: result.saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const unauthorized = message.includes("Firebase ID token") || message === "UNAUTHORIZED";
    console.error("Saved video update failed:", error);
    return NextResponse.json(
      { success: false, message: unauthorized ? "Unauthorized" : "Saved videos are temporarily unavailable" },
      { status: unauthorized ? 401 : 500 }
    );
  }
}
