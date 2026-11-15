import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { readBoundedJson } from "@/lib/server/readBoundedJson";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{3,200}$/;
const SESSION_ID_PATTERN = /^[0-9a-f-]{36}$/i;
const MIN_HEARTBEAT_SECONDS = 8;
const MAX_HEARTBEAT_SECONDS = 20;
const MAX_SESSION_AGE_MS = 4 * 60 * 60 * 1000;

function response(success: boolean, status: number, data: Record<string, unknown> = {}) {
  return NextResponse.json({ success, ...data }, {
    status,
    headers: { "Cache-Control": "no-store", Pragma: "no-cache" },
  });
}

export async function POST(req: Request) {
  const authorization = req.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return response(false, 401, { error: "Authentication required" });

  let uid: string;
  try {
    uid = (await getAdminAuth().verifyIdToken(authorization.slice(7).trim(), true)).uid;
  } catch {
    return response(false, 401, { error: "Authentication required" });
  }

  const parsed = await readBoundedJson(req, 4096);
  if (!parsed.ok) return response(false, parsed.status, { error: parsed.message });
  const body = parsed.value as Record<string, unknown>;
  const action = body.action;
  const db = getAdminDb();

  if (action === "start") {
    const videoId = typeof body.videoId === "string" ? body.videoId.trim() : "";
    if (!VIDEO_ID_PATTERN.test(videoId)) return response(false, 400, { error: "Invalid video" });

    const videoSnap = await db.collection("watchEarnVideos").doc(videoId).get();
    const video = videoSnap.data() || {};
    if (!videoSnap.exists || video.status !== "approved" || video.active !== true ||
        video.moderation !== "safe" || video.videoAccess !== "free") {
      return response(false, 409, { error: "Video is not available for free playback" });
    }

    const sessionId = randomUUID();
    const now = Date.now();
    await db.collection("videoWatchSessions").doc(sessionId).create({
      sessionId, uid, videoId, status: "active",
      startedAtMs: now, lastHeartbeatAtMs: now,
      elapsedSeconds: 0, createdAt: new Date(now), updatedAt: new Date(now),
    });
    return response(true, 201, { sessionId, telemetryOnly: true });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  if (!SESSION_ID_PATTERN.test(sessionId)) return response(false, 400, { error: "Invalid session" });
  const sessionRef = db.collection("videoWatchSessions").doc(sessionId);

  if (action === "heartbeat") {
    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(sessionRef);
      if (!snap.exists) return { error: "not_found" as const };
      const data = snap.data()!;
      if (data.uid !== uid) return { error: "forbidden" as const };
      if (data.status !== "active") return { error: "closed" as const };
      const now = Date.now();
      const startedAt = Number(data.startedAtMs);
      if (!Number.isSafeInteger(startedAt) || startedAt > now) return { error: "invalid" as const };
      if (now - startedAt > MAX_SESSION_AGE_MS) {
        tx.update(sessionRef, { status: "closed", closeReason: "expired", closedAt: new Date(now), updatedAt: new Date(now) });
        return { error: "expired" as const };
      }

      // Re-check moderation and availability on every heartbeat so a video
      // that is unpublished, disabled, or made unsafe cannot keep a session alive.
      const videoRef = db.collection("watchEarnVideos").doc(String(data.videoId));
      const videoSnap = await tx.get(videoRef);
      const video = videoSnap.data() || {};
      if (!videoSnap.exists || video.status !== "approved" || video.active !== true ||
          video.moderation !== "safe" || video.videoAccess !== "free") {
        tx.update(sessionRef, { status: "closed", closeReason: "video_unavailable", closedAt: new Date(now), updatedAt: new Date(now) });
        return { error: "video_unavailable" as const };
      }

      const previous = Number(data.lastHeartbeatAtMs);
      if (!Number.isSafeInteger(previous) || previous > now) return { error: "invalid" as const };
      const elapsed = Math.floor((now - previous) / 1000);
      if (elapsed < MIN_HEARTBEAT_SECONDS) return { error: "too_soon" as const };
      const accepted = Math.min(elapsed, MAX_HEARTBEAT_SECONDS);
      tx.update(sessionRef, {
        lastHeartbeatAtMs: now,
        elapsedSeconds: Math.min(86400, Math.max(0, Number(data.elapsedSeconds) || 0) + accepted),
        updatedAt: new Date(now),
      });
      return { acceptedSeconds: accepted };
    });
    if ("error" in result) {
      const status = result.error === "forbidden" ? 403 : result.error === "not_found" ? 404 : 409;
      return response(false, status, { error: result.error });
    }
    return response(true, 200, { acceptedSeconds: result.acceptedSeconds, telemetryOnly: true });
  }

  if (action === "stop") {
    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(sessionRef);
      if (!snap.exists) return "not_found";
      if (snap.data()?.uid !== uid) return "forbidden";
      if (snap.data()?.status === "active") tx.update(sessionRef, { status: "closed", closedAt: new Date(), updatedAt: new Date() });
      return "closed";
    });
    if (result === "not_found") return response(false, 404, { error: result });
    if (result === "forbidden") return response(false, 403, { error: result });
    return response(true, 200, { status: "closed", telemetryOnly: true });
  }

  return response(false, 400, { error: "Unsupported action" });
}
