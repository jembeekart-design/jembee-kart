import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { readBoundedJson } from "@/lib/server/readBoundedJson";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function reply(success: boolean, status: number, payload: Record<string, unknown>) {
  return NextResponse.json({ success, ...payload }, {
    status,
    headers: { "Cache-Control": "no-store", Pragma: "no-cache" },
  });
}

async function authenticatedUid(req: Request): Promise<string | null> {
  const header = req.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return null;
  try {
    return (await getAdminAuth().verifyIdToken(header.slice(7).trim(), true)).uid;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const uid = await authenticatedUid(req);
  if (!uid) return reply(false, 401, { error: "Authentication required" });

  const parsed = await readBoundedJson(req, 4096);
  if (!parsed.ok) return reply(false, parsed.status, { error: parsed.message });
  const body = parsed.value as Record<string, unknown>;
  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  const positionSeconds = body.positionSeconds;
  if (!/^[0-9a-f-]{36}$/i.test(sessionId) ||
      typeof positionSeconds !== "number" ||
      !Number.isFinite(positionSeconds) ||
      positionSeconds < 0 ||
      positionSeconds > 86400) {
    return reply(false, 400, { error: "Invalid progress data" });
  }

  const db = getAdminDb();
  const sessionRef = db.collection("videoWatchSessions").doc(sessionId);
  const result = await db.runTransaction(async (tx) => {
    const sessionSnap = await tx.get(sessionRef);
    if (!sessionSnap.exists) return "not_found";
    const session = sessionSnap.data()!;
    if (session.uid !== uid) return "forbidden";
    if (session.status !== "active") return "closed";

    const startedAt = Number(session.startedAtMs);
    const nowMs = Date.now();
    if (!Number.isSafeInteger(startedAt) || startedAt > nowMs) return "invalid_session";
    if (nowMs - startedAt > 4 * 60 * 60 * 1000) {
      tx.update(sessionRef, {
        status: "closed",
        closeReason: "expired",
        closedAt: new Date(nowMs),
        updatedAt: new Date(nowMs),
      });
      return "closed";
    }

    const videoRef = db.collection("watchEarnVideos").doc(String(session.videoId));
    const videoSnap = await tx.get(videoRef);
    if (!videoSnap.exists) return "unavailable";
    const video = videoSnap.data()!;
    if (video.status !== "approved" || video.active !== true ||
        video.moderation !== "safe" || video.videoAccess !== "free") return "unavailable";

    const duration = Number(video.durationSeconds);
    if (Number.isFinite(duration) && duration > 0 && positionSeconds > duration + 5) return "invalid_position";

    const progressRef = db.collection("users").doc(uid)
      .collection("watchProgress").doc(String(session.videoId));
    const existing = await tx.get(progressRef);
    const previous = Number(existing.data()?.positionSeconds) || 0;
    const now = new Date();
    tx.set(progressRef, {
      uid,
      videoId: session.videoId,
      positionSeconds: Math.min(positionSeconds, Number.isFinite(duration) && duration > 0 ? duration : 86400),
      // Resume position is user-interface state only; it is not verified watch time.
      maxPositionSeconds: Math.max(previous, Math.min(positionSeconds, Number.isFinite(duration) && duration > 0 ? duration : 86400)),
      updatedAt: now,
      lastSessionId: sessionId,
    }, { merge: true });
    return "saved";
  });

  if (result !== "saved") {
    const status = result === "forbidden" ? 403 : result === "not_found" ? 404 : 409;
    return reply(false, status, { error: result });
  }
  return reply(true, 200, { saved: true, telemetryOnly: true });
}

export async function GET(req: Request) {
  const uid = await authenticatedUid(req);
  if (!uid) return reply(false, 401, { error: "Authentication required" });
  const db = getAdminDb();
  const progressSnap = await db.collection("users").doc(uid)
    .collection("watchProgress").orderBy("updatedAt", "desc").limit(50).get();

  // Fetch each referenced video once, in parallel, instead of issuing a
  // sequential read for every progress row.
  const progressRows = progressSnap.docs.map((progressDoc) => {
    const progress = progressDoc.data();
    const videoId = typeof progress.videoId === "string" ? progress.videoId : progressDoc.id;
    return { progress, videoId };
  });
  const videoIds = Array.from(new Set(progressRows.map((row) => row.videoId).filter(Boolean)));
  const videoSnapshots = await Promise.all(videoIds.map((videoId) =>
    db.collection("watchEarnVideos").doc(videoId).get()
  ));
  const videosById = new Map(videoIds.map((videoId, index) => [videoId, videoSnapshots[index]]));

  const items = progressRows.map(({ progress, videoId }) => {
    const videoSnap = videosById.get(videoId);
    if (!videoSnap?.exists) return null;
    const video = videoSnap.data()!;
    if (video.status !== "approved" || video.active !== true ||
        video.moderation !== "safe" || video.videoAccess !== "free") return null;
    return {
      videoId,
      title: typeof video.title === "string" ? video.title : "",
      caption: typeof video.caption === "string" ? video.caption : "",
      thumbnail: typeof video.thumbnail === "string" ? video.thumbnail : "",
      creatorName: typeof video.displayName === "string" ? video.displayName : typeof video.username === "string" ? video.username : "",
      durationSeconds: typeof video.durationSeconds === "number" && Number.isFinite(video.durationSeconds) ? video.durationSeconds : null,
      positionSeconds: typeof progress.positionSeconds === "number" ? progress.positionSeconds : 0,
      updatedAt: progress.updatedAt?.toDate?.()?.toISOString?.() ?? null,
    };
  });

  return reply(true, 200, { items: items.filter(Boolean), scannedProgress: progressSnap.size, limit: 50 });
}
