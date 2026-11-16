import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

function error(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(req: Request) {
  const authorization = req.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return error("Unauthorized", 401);
  const token = authorization.slice(7).trim();
  if (!token || token.length > 8192) return error("Unauthorized", 401);

  let uid: string;
  try {
    uid = (await getAdminAuth().verifyIdToken(token, true)).uid;
  } catch {
    return error("Unauthorized", 401);
  }

  let body: { commentId?: unknown };
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 4096) return error("Request body too large", 413);
    body = JSON.parse(raw);
  } catch {
    return error("Invalid JSON body", 400);
  }

  const commentId = typeof body.commentId === "string" ? body.commentId.trim() : "";
  if (!commentId || commentId.length > 500 || /[\\/]/.test(commentId)) {
    return error("Invalid comment ID", 400);
  }

  try {
    const db = getAdminDb();
    const commentRef = db.collection("comments").doc(commentId);
    const result = await db.runTransaction(async (tx) => {
      const commentSnap = await tx.get(commentRef);
      if (!commentSnap.exists) return { kind: "missing" as const };
      const comment = commentSnap.data() ?? {};
      if (comment.userId !== uid) return { kind: "forbidden" as const };

      const contentId = typeof comment.contentId === "string" ? comment.contentId : "";
      if (!contentId || contentId.length > 200 || /[\\/]/.test(contentId)) {
        return { kind: "invalid" as const };
      }
      const videoRef = db.collection("watchEarnVideos").doc(contentId);
      const videoSnap = await tx.get(videoRef);

      tx.delete(commentRef);
      if (videoSnap.exists) {
        const video = videoSnap.data() ?? {};
        const currentCount = Number(video.comments ?? 0);
        const safeCount = Number.isFinite(currentCount) && currentCount > 0
          ? Math.floor(currentCount)
          : 0;
        tx.update(videoRef, { comments: Math.max(0, safeCount - 1) });
      }
      return { kind: "deleted" as const };
    });

    if (result.kind === "missing") return error("Comment not found", 404);
    if (result.kind === "forbidden") return error("You can only delete your own comment", 403);
    if (result.kind === "invalid") return error("Comment cannot be deleted", 409);
    return NextResponse.json({ success: true });
  } catch (cause) {
    console.error("Comment deletion failed:", cause);
    return error("Unable to delete comment right now", 500);
  }
}
