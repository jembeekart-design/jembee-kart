import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TOKEN_LENGTH = 10_000;
const historyDocumentId = (uid: string, videoId: string) =>
  createHash("sha256").update(uid).update("\0").update(videoId).digest("hex");

const validVideoId = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0 && value.length <= 200 && !/[\\/\\\\]/.test(value);

async function authenticatedUid(req: NextRequest): Promise<string> {
  const header = req.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const token = header.slice(7).trim();
  if (!token || token.length > MAX_TOKEN_LENGTH) throw new Error("UNAUTHORIZED");
  return (await getAdminAuth().verifyIdToken(token, true)).uid;
}

function errorResponse(error: unknown) {
  const unauthorized = error instanceof Error &&
    (error.message === "UNAUTHORIZED" || error.message.includes("Firebase ID token"));
  return NextResponse.json(
    { success: false, message: unauthorized ? "Unauthorized" : "Watch history is temporarily unavailable" },
    { status: unauthorized ? 401 : 500, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(req: NextRequest) {
  try {
    const uid = await authenticatedUid(req);
    const db = getAdminDb();
    const snapshot = await db.collection("videoWatchHistory")
      .where("userId", "==", uid)
      .limit(100)
      .get();

    const validRecords = snapshot.docs
      .map((item) => item.data())
      .filter((record) => validVideoId(record.videoId));
    const videoRefs = validRecords.map((record) => db.collection("watchEarnVideos").doc(record.videoId));
    // Fetch the associated videos in one Firestore batch instead of issuing
    // one network read per history item.
    const videoSnapshots = videoRefs.length ? await db.getAll(...videoRefs) : [];
    const videoById = new Map(videoSnapshots.map((item) => [item.id, item]));
    const records = validRecords.map((record) => {
      const videoId = record.videoId as string;
      const videoSnap = videoById.get(videoId);
      if (!videoSnap?.exists) return null;
      const video = videoSnap.data();
      // History never grants playback rights. Only currently public free videos
      // are listed; paid access must be re-authorized by the purchase flow.
      if (
        video?.status !== "approved" || video?.active !== true ||
        video?.moderation !== "safe" ||
        (video?.videoAccess !== "free" && video?.videoAccess !== undefined) ||
        video?.paidVideoStatus === "payment_integration_pending" || video?.videoFormat !== "long"
      ) return null;
      const duration = Number(record.durationSeconds);
      const position = Number(record.positionSeconds);
      return {
        videoId,
        title: typeof video.caption === "string" ? video.caption.slice(0, 500) : "Untitled video",
        thumbnail: typeof video.thumbnail === "string" && video.thumbnail.startsWith("https://") ? video.thumbnail : "",
        durationSeconds: Number.isFinite(duration) ? duration : 0,
        positionSeconds: Number.isFinite(position) ? position : 0,
        updatedAt: typeof record.updatedAt?.toMillis === "function" ? record.updatedAt.toMillis() : 0,
      };
    });

    const history = records.filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.updatedAt - a.updatedAt);
    return NextResponse.json(
      { success: true, history },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Viewer watch history load failed:", error);
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const uid = await authenticatedUid(req);
    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf8") > 4 * 1024) {
      return NextResponse.json({ success: false, message: "Request too large" }, { status: 413 });
    }
    let body: Record<string, unknown>;
    try { body = JSON.parse(raw) as Record<string, unknown>; } catch {
      return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
    }
    const videoId = body.videoId;
    const positionSeconds = body.positionSeconds;
    const durationSeconds = body.durationSeconds;
    if (
      !validVideoId(videoId) ||
      typeof positionSeconds !== "number" || !Number.isFinite(positionSeconds) ||
      typeof durationSeconds !== "number" || !Number.isFinite(durationSeconds) ||
      durationSeconds <= 0 || durationSeconds > 24 * 60 * 60 ||
      positionSeconds < 0 || positionSeconds > durationSeconds
    ) {
      return NextResponse.json({ success: false, message: "Invalid watch progress" }, { status: 400 });
    }

    const db = getAdminDb();
    const videoRef = db.collection("watchEarnVideos").doc(videoId);
    const historyRef = db.collection("videoWatchHistory").doc(historyDocumentId(uid, videoId));
    const outcome = await db.runTransaction(async (transaction) => {
      const videoSnap = await transaction.get(videoRef);
      const historySnap = await transaction.get(historyRef);
      const video = videoSnap.data();
      if (
        !videoSnap.exists || video?.status !== "approved" || video?.active !== true ||
        video?.moderation !== "safe" ||
        (video?.videoAccess !== "free" && video?.videoAccess !== undefined) ||
        video?.paidVideoStatus === "payment_integration_pending" || video?.videoFormat !== "long"
      ) return "UNAVAILABLE" as const;

      const previous = historySnap.data();
      const lastUpdated = typeof previous?.updatedAt?.toMillis === "function" ? previous.updatedAt.toMillis() : 0;
      // Avoid excessive writes from frequent media timeupdate events.
      if (Date.now() - lastUpdated < 10_000) return "THROTTLED" as const;
      transaction.set(historyRef, {
        userId: uid,
        videoId,
        positionSeconds: Math.min(positionSeconds, durationSeconds),
        durationSeconds,
        updatedAt: new Date(),
      }, { merge: true });
      return "SAVED" as const;
    });

    if (outcome === "UNAVAILABLE") {
      return NextResponse.json({ success: false, message: "Video unavailable" }, { status: 404 });
    }
    return NextResponse.json({ success: true, saved: outcome === "SAVED" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Viewer watch progress save failed:", error);
    return errorResponse(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const uid = await authenticatedUid(req);
    const videoId = req.nextUrl.searchParams.get("videoId") || "";
    if (!validVideoId(videoId)) {
      return NextResponse.json({ success: false, message: "Invalid video ID" }, { status: 400 });
    }
    await getAdminDb().collection("videoWatchHistory").doc(historyDocumentId(uid, videoId)).delete();
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Viewer watch history delete failed:", error);
    return errorResponse(error);
  }
}
