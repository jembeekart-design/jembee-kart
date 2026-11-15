import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function reply(success: boolean, status: number, payload: Record<string, unknown>) {
  return NextResponse.json({ success, ...payload }, {
    status,
    headers: { "Cache-Control": "no-store", Pragma: "no-cache" },
  });
}

export async function GET(req: Request) {
  const header = req.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return reply(false, 401, { error: "Authentication required" });

  let uid: string;
  try {
    uid = (await getAdminAuth().verifyIdToken(header.slice(7).trim(), true)).uid;
  } catch {
    return reply(false, 401, { error: "Authentication required" });
  }

  const db = getAdminDb();
  const sessions = await db.collection("videoWatchSessions")
    .where("uid", "==", uid)
    .orderBy("startedAtMs", "desc")
    .limit(50)
    .get();

  const grouped = new Map<string, {
    sessionId: string;
    videoId: string;
    title: string;
    caption: string;
    thumbnail: string;
    creatorName: string;
    startedAt: string | null;
    elapsedSeconds: number;
    sessionCount: number;
  }>();

  for (const sessionDoc of sessions.docs) {
    const session = sessionDoc.data();
    const videoId = typeof session.videoId === "string" ? session.videoId : "";
    if (!videoId) continue;
    const videoSnap = await db.collection("watchEarnVideos").doc(videoId).get();
    if (!videoSnap.exists) continue;
    const video = videoSnap.data()!;
    // History exposes only videos that remain publicly eligible.
    if (video.status !== "approved" || video.active !== true ||
        video.moderation !== "safe" || video.videoAccess !== "free") continue;

    const current = grouped.get(videoId);
    if (current) {
      current.sessionCount += 1;
      continue;
    }
    grouped.set(videoId, {
      sessionId: sessionDoc.id,
      videoId,
      title: typeof video.title === "string" ? video.title : "",
      caption: typeof video.caption === "string" ? video.caption : "",
      thumbnail: typeof video.thumbnail === "string" ? video.thumbnail : "",
      creatorName: typeof video.displayName === "string" ? video.displayName : typeof video.username === "string" ? video.username : "",
      startedAt: Number.isSafeInteger(session.startedAtMs) ? new Date(session.startedAtMs).toISOString() : null,
      elapsedSeconds: Number.isFinite(Number(session.elapsedSeconds)) ? Math.max(0, Number(session.elapsedSeconds)) : 0,
      sessionCount: 1,
    });
  }


  return reply(true, 200, { items: Array.from(grouped.values()), scannedSessions: sessions.size, limit: 50 });
}
