import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { createHash } from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonError("Unauthorized", 401);
  }

  let uid: string;
  try {
    const decoded = await getAdminAuth().verifyIdToken(
      authHeader.slice(7).trim()
    );
    uid = decoded.uid;
  } catch {
    return jsonError("Unauthorized", 401);
  }

  let body: { videoId?: unknown; text?: unknown; requestId?: unknown };
  try {
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 8192) return jsonError("Request body too large", 413);
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 8192) return jsonError("Request body too large", 413);
    body = JSON.parse(raw);
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const videoId = typeof body.videoId === "string" ? body.videoId.trim() : "";
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const requestId = typeof body.requestId === "string" ? body.requestId.trim() : "";

  if (!videoId || videoId.length > 500 || !text || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
    return jsonError("Video ID and comment text are required", 400);
  }

  try {
    const adminDb = getAdminDb();
    const settingsSnap = await adminDb
      .collection("commentModeration")
      .doc("settings")
      .get();

    if (!settingsSnap.exists) {
      return jsonError("Comment moderation settings are not configured", 503);
    }

    const settings = settingsSnap.data()!;

    if (settings.enabled !== true) {
      return jsonError("Comment moderation is currently unavailable", 403);
    }
    if (settings.commentsEnabled !== true) {
      return jsonError("Comments are currently disabled", 403);
    }

    const minLength = Number(settings.minCommentLength ?? 1);
    const maxLength = Number(settings.maxCommentLength ?? 500);
    if (text.length < minLength) {
      return jsonError(`Comment is too short (minimum ${minLength} characters)`, 400);
    }
    if (text.length > maxLength) {
      return jsonError(`Comment exceeds the ${maxLength}-character limit`, 400);
    }

    const normalizedText = settings.caseInsensitive === false ? text : text.toLowerCase();
    const blockedWords = Array.isArray(settings.blockedWords)
      ? settings.blockedWords.filter(
          (word: unknown): word is string =>
            typeof word === "string" && word.trim().length > 0
        )
      : [];

    for (const word of blockedWords) {
      const normalizedWord =
        settings.caseInsensitive === false ? word.trim() : word.trim().toLowerCase();
      const blocked = settings.blockPartialMatch === false
        ? normalizedText.split(/\s+/).includes(normalizedWord)
        : normalizedText.includes(normalizedWord);

      if (blocked) {
        return jsonError(
          typeof settings.customMessage === "string" && settings.customMessage
            ? settings.customMessage
            : "Please avoid abusive language",
          400
        );
      }
    }

    // Arbitrary JavaScript regexes can catastrophically backtrack and block the Node event loop.
    // Until a linear-time RE2-compatible engine is installed, fail closed if active rules exist.
    const regexSnapshot = await adminDb.collection("commentRegexRules").where("enabled", "==", true).limit(51).get();
    if (!regexSnapshot.empty) {
      return jsonError("Custom regex moderation is temporarily unavailable. Please disable custom regex rules; blocked-word moderation remains active.", 503);
    }

    const videoRef = adminDb.collection("watchEarnVideos").doc(videoId);
    const videoSnap = await videoRef.get();
    if (!videoSnap.exists) {
      return jsonError("Video not found", 404);
    }
    const videoData = videoSnap.data() || {};
    if (videoData.status !== "approved" || videoData.active !== true || videoData.moderation !== "safe") {
      return jsonError("Comments are unavailable for this video", 404);
    }

    let userName = "User";
    try {
      const user = await getAdminAuth().getUser(uid);
      userName = user.displayName || "User";
    } catch {
      // A missing optional display name must not prevent commenting.
    }

    const approved = settings.autoApproveComments === true;
    const requestHash = createHash("sha256").update(`${uid}:${requestId}`).digest("hex");
    const commentRef = adminDb.collection("comments").doc(requestHash);
    const rateRef = adminDb.collection("commentRateLimits").doc(uid);
    const queueRef = adminDb.collection("videoCommentReports").doc(requestHash);
    const nowMs = Date.now();
    const textHash = createHash("sha256").update(text.toLowerCase().replace(/\s+/g, " ")).digest("hex");
    const maxPerMinute = Number.isFinite(Number(settings.maxCommentsPerMinute)) ? Math.max(1, Math.min(30, Number(settings.maxCommentsPerMinute))) : 5;
    const maxPerHour = Number.isFinite(Number(settings.maxCommentsPerHour)) ? Math.max(1, Math.min(300, Number(settings.maxCommentsPerHour))) : 30;
    const maxPerDay = Number.isFinite(Number(settings.maxCommentsPerDay)) ? Math.max(1, Math.min(1000, Number(settings.maxCommentsPerDay))) : 100;
    const duplicateWindowMs = Number.isFinite(Number(settings.duplicateCommentWindowSeconds)) ? Math.max(0, Math.min(86400, Number(settings.duplicateCommentWindowSeconds))) * 1000 : 30000;

    const result = await adminDb.runTransaction(async (tx) => {
      const [existingComment, rateSnap, freshVideo] = await Promise.all([
        tx.get(commentRef),
        tx.get(rateRef),
        tx.get(videoRef),
      ]);
      if (existingComment.exists) return { kind: "duplicate", data: existingComment.data() ?? {} };
      const currentVideo = freshVideo.data() || {};
      if (!freshVideo.exists || currentVideo.status !== "approved" || currentVideo.active !== true || currentVideo.moderation !== "safe") {
        return { kind: "unavailable" };
      }
      const rate = rateSnap.data() || {};
      const minuteWindow = Math.floor(nowMs / 60000);
      const hourWindow = Math.floor(nowMs / 3600000);
      const dayWindow = new Date(nowMs).toISOString().slice(0, 10);
      const minuteCount = rate.minuteWindow === minuteWindow ? Number(rate.minuteCount || 0) : 0;
      const hourCount = rate.hourWindow === hourWindow ? Number(rate.hourCount || 0) : 0;
      const dayCount = rate.dayWindow === dayWindow ? Number(rate.dayCount || 0) : 0;
      if (minuteCount >= maxPerMinute || hourCount >= maxPerHour || dayCount >= maxPerDay) return { kind: "rate-limited" };
      if (duplicateWindowMs > 0 && rate.lastTextHash === textHash && nowMs - Number(rate.lastCommentAt || 0) < duplicateWindowMs) return { kind: "duplicate-text" };

      tx.create(commentRef, {
        contentId: videoId,
        userId: uid,
        userName,
        text,
        requestId,
        createdAt: FieldValue.serverTimestamp(),
        status: approved ? "approved" : "pending",
        likes: 0,
      });
      if (!approved) {
        tx.create(queueRef, {
          commentId: commentRef.id,
          contentId: videoId,
          userId: uid,
          userName,
          text,
          status: "pending",
          createdAt: FieldValue.serverTimestamp(),
          reason: "auto-moderation-pending",
        });
      }
      tx.update(videoRef, { comments: FieldValue.increment(1) });
      tx.set(rateRef, {
        minuteWindow, minuteCount: minuteCount + 1,
        hourWindow, hourCount: hourCount + 1,
        dayWindow, dayCount: dayCount + 1,
        lastTextHash: textHash, lastCommentAt: nowMs,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      return { kind: "created" };
    });

    if (result.kind === "rate-limited") return jsonError("Comment rate limit reached. Please try again later.", 429);
    if (result.kind === "duplicate-text") return jsonError("You recently posted the same comment. Please wait before repeating it.", 409);
    if (result.kind === "unavailable") return jsonError("Comments are unavailable for this video", 404);
    if (result.kind === "duplicate" && result.data) {
      return NextResponse.json({ success: true, duplicate: true, comment: { id: commentRef.id, contentId: videoId, userId: uid, userName: result.data.userName || userName, text: result.data.text || text, status: result.data.status || "pending", likes: Number(result.data.likes || 0) } });
    }

    return NextResponse.json({
      success: true,
      comment: {
        id: commentRef.id,
        contentId: videoId,
        userId: uid,
        userName,
        text,
        status: approved ? "approved" : "pending",
        likes: 0,
      },
    });
  } catch (error) {
    console.error("Comment submission failed:", error);
    return jsonError("Unable to submit comment right now", 500);
  }
}
