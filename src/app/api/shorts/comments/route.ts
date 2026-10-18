import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
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

  let body: { videoId?: unknown; text?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const videoId = typeof body.videoId === "string" ? body.videoId.trim() : "";
  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (!videoId || videoId.length > 500 || !text) {
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

    // Apply administrator-defined regex rules on the trusted server.
    const regexSnapshot = await adminDb.collection("commentRegexRules").get();

    for (const ruleDoc of regexSnapshot.docs) {
      const rule = ruleDoc.data();

      if (rule.enabled !== true || typeof rule.pattern !== "string" || !rule.pattern) {
        continue;
      }

      try {
        const regex = new RegExp(
          rule.pattern,
          settings.caseInsensitive === false ? "" : "i"
        );

        if (regex.test(text)) {
          return jsonError(
            typeof rule.message === "string" && rule.message.trim()
              ? rule.message
              : typeof settings.customMessage === "string" && settings.customMessage
                ? settings.customMessage
                : "Please avoid abusive language",
            400
          );
        }
      } catch {
        // Ignore invalid administrator patterns rather than breaking all comments.
        console.error("Skipping invalid comment moderation regex:", ruleDoc.id);
      }
    }

    const videoRef = adminDb.collection("watchEarnVideos").doc(videoId);
    const videoSnap = await videoRef.get();
    if (!videoSnap.exists) {
      return jsonError("Video not found", 404);
    }

    let userName = "User";
    try {
      const user = await getAdminAuth().getUser(uid);
      userName = user.displayName || "User";
    } catch {
      // A missing optional display name must not prevent commenting.
    }

    const approved = settings.autoApproveComments === true;
    const commentRef = adminDb.collection("comments").doc();

    const batch = adminDb.batch();
    batch.set(commentRef, {
      contentId: videoId,
      userId: uid,
      userName,
      text,
      createdAt: FieldValue.serverTimestamp(),
      status: approved ? "approved" : "pending",
      likes: 0,
    });

    if (!approved) {
      const queueRef = adminDb.collection("videoCommentReports").doc();
      batch.set(queueRef, {
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

    batch.update(videoRef, {
      comments: FieldValue.increment(1),
    });

    await batch.commit();

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
