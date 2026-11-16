import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

const ALLOWED_REASONS = [
  "spam", "misleading", "hate", "nudity", "violence",
  "copyright", "other", "harassment", "misinformation", "inappropriate",
];

function error(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(req: Request) {
  const authorization = req.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return error("Authentication required", 401);
  const token = authorization.slice(7).trim();
  if (!token || token.length > 8192) return error("Invalid authentication token", 401);

  let uid: string;
  try {
    uid = (await getAdminAuth().verifyIdToken(token, true)).uid;
  } catch {
    return error("Please sign in again", 401);
  }

  let body: { videoId?: unknown; reason?: unknown; message?: unknown };
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 8192) return error("Request body too large", 413);
    body = JSON.parse(raw);
  } catch {
    return error("Invalid JSON body", 400);
  }

  const videoId = typeof body.videoId === "string" ? body.videoId.trim() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim().toLowerCase() : "";
  const message = body.message === undefined ? "" : body.message;
  if (
    !videoId || videoId.length > 200 || /[\\/]/.test(videoId) ||
    !ALLOWED_REASONS.includes(reason) ||
    typeof message !== "string" || message.length > 1000
  ) return error("Invalid report details", 400);

  try {
    const db = getAdminDb();
    const videoRef = db.collection("watchEarnVideos").doc(videoId);
    const reportId = createHash("sha256").update(uid).update("\0").update(videoId).digest("hex");
    const reportRef = db.collection("videoReports").doc(reportId);
    const result = await db.runTransaction(async (tx) => {
      const [videoSnap, reportSnap] = await Promise.all([tx.get(videoRef), tx.get(reportRef)]);
      if (!videoSnap.exists) return { success: false, message: "Video not found", status: 404 };
      const video = videoSnap.data() ?? {};
      if (video.active !== true || video.status !== "approved" || video.moderation !== "safe") {
        return { success: false, message: "Video is not available for reporting", status: 404 };
      }
      if (reportSnap.exists) return { success: true, alreadyReported: true, status: 200 };
      tx.create(reportRef, {
        userId: uid, videoId, reason, message: message.trim(),
        status: "pending", createdAt: Date.now(),
      });
      return { success: true, alreadyReported: false, status: 201 };
    });
    return NextResponse.json(result, { status: result.status });
  } catch (err) {
    console.error("Shorts video report API error:", err);
    return error("Unable to submit report", 500);
  }
}
