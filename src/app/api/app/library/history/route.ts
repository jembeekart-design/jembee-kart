import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{1,160}$/.test(value);
}

async function uidFromRequest(req: NextRequest): Promise<string | null> {
  const header = req.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  if (!token || token.length > 8192) return null;
  return (await getAdminAuth().verifyIdToken(token, true)).uid;
}

export async function GET(req: NextRequest) {
  try {
    const uid = await uidFromRequest(req);
    if (!uid) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const db = getAdminDb();
    const history = await db.collection("watchHistory").where("userId", "==", uid).limit(500).get();
    const orderedHistory = history.docs.sort((a, b) => Number(b.data().lastWatchedAt || 0) - Number(a.data().lastWatchedAt || 0)).slice(0, 100);
    const entries = await Promise.all(orderedHistory.map(async (entry) => {
      const videoId = entry.data().videoId;
      if (!validId(videoId)) return null;
      const video = await db.collection("watchEarnVideos").doc(videoId).get();
      const data = video.data();
      if (!video.exists || !data || data.status !== "approved" || data.active !== true || data.moderation !== "safe" || data.videoAccess !== "free") return null;
      return {
        id: video.id,
        caption: typeof data.caption === "string" ? data.caption.slice(0, 500) : "",
        creatorId: typeof data.userId === "string" ? data.userId : typeof data.creatorId === "string" ? data.creatorId : "",
        username: typeof data.username === "string" ? data.username.slice(0, 80) : "",
        displayName: typeof data.displayName === "string" ? data.displayName.slice(0, 120) : "",
        thumbnailUrl: "/api/shorts/video-thumbnail/" + encodeURIComponent(video.id),
        playbackUrl: "/api/shorts/video-stream/" + encodeURIComponent(video.id),
        lastPositionSeconds: Number.isFinite(entry.data().lastPositionSeconds) ? Math.max(0, entry.data().lastPositionSeconds) : 0,
        durationSeconds: Number.isFinite(entry.data().durationSeconds) ? Math.max(0, entry.data().durationSeconds) : 0,
        completed: entry.data().completed === true,
        lastWatchedAt: Number.isFinite(entry.data().lastWatchedAt) ? entry.data().lastWatchedAt : 0,
      };
    }));
    return NextResponse.json({ success: true, history: entries.filter(Boolean) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Mobile watch history load failed:", error);
    return NextResponse.json({ success: false, message: "Watch history unavailable" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const uid = await uidFromRequest(req);
    if (!uid) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const body: unknown = await req.json();
    const input = body as { videoId?: unknown; positionSeconds?: unknown; durationSeconds?: unknown; completed?: unknown };
    if (!validId(input?.videoId)) return NextResponse.json({ success: false, message: "Invalid videoId" }, { status: 400 });
    const position = input.positionSeconds;
    const duration = input.durationSeconds;
    if (typeof position !== "number" || !Number.isFinite(position) || position < 0 || position > 86400 ||
        typeof duration !== "number" || !Number.isFinite(duration) || duration <= 0 || duration > 86400) {
      return NextResponse.json({ success: false, message: "Invalid playback position" }, { status: 400 });
    }
    const db = getAdminDb();
    const video = await db.collection("watchEarnVideos").doc(input.videoId).get();
    const data = video.data();
    if (!video.exists || !data || data.status !== "approved" || data.active !== true || data.moderation !== "safe" || data.videoAccess !== "free") {
      return NextResponse.json({ success: false, message: "Video unavailable" }, { status: 404 });
    }
    const positionSeconds = Math.min(position, duration);
    const completed = input.completed === true && positionSeconds >= duration * 0.9;
    const historyId = input.videoId + "_" + uid;
    const ref = db.collection("watchHistory").doc(historyId);
    await db.runTransaction(async (transaction) => {
      const current = await transaction.get(ref);
      const previous = current.data() || {};
      transaction.set(ref, {
        userId: uid,
        videoId: input.videoId,
        lastPositionSeconds: positionSeconds,
        durationSeconds: duration,
        completed: previous.completed === true || completed,
        lastWatchedAt: Date.now(),
      }, { merge: true });
    });
    return NextResponse.json({ success: true, recorded: true, completed }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Mobile watch history update failed:", error);
    return NextResponse.json({ success: false, message: "Watch history could not be updated" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const uid = await uidFromRequest(req);
    if (!uid) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const videoId = new URL(req.url).searchParams.get("videoId");
    const db = getAdminDb();
    if (videoId === "all") {
      while (true) {
        const snapshot = await db.collection("watchHistory").where("userId", "==", uid).limit(400).get();
        if (snapshot.empty) break;
        const batch = db.batch();
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        if (snapshot.size < 400) break;
      }
    } else if (validId(videoId)) {
      const ref = db.collection("watchHistory").doc(videoId + "_" + uid);
      const snap = await ref.get();
      if (snap.exists && snap.data()?.userId === uid) await ref.delete();
    } else {
      return NextResponse.json({ success: false, message: "Invalid videoId" }, { status: 400 });
    }
    return NextResponse.json({ success: true, deleted: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Mobile watch history delete failed:", error);
    return NextResponse.json({ success: false, message: "Watch history could not be deleted" }, { status: 500 });
  }
}
