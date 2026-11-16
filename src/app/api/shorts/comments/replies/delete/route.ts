import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(req: Request) {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return fail("Unauthorized", 401);
  const token = header.slice(7).trim();
  if (!token || token.length > 8192) return fail("Unauthorized", 401);

  let uid: string;
  try {
    uid = (await getAdminAuth().verifyIdToken(token, true)).uid;
  } catch {
    return fail("Unauthorized", 401);
  }

  let body: { replyId?: unknown };
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 4096) return fail("Request body too large", 413);
    body = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body)) return fail("Invalid JSON body", 400);
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const replyId = typeof body.replyId === "string" ? body.replyId.trim() : "";
  if (!replyId || replyId.length > 500 || /[\\/]/.test(replyId)) return fail("Invalid reply ID", 400);

  try {
    const db = getAdminDb();
    const replyRef = db.collection("videoCommentReplies").doc(replyId);
    const result = await db.runTransaction(async (tx) => {
      const replySnap = await tx.get(replyRef);
      if (!replySnap.exists) return "missing" as const;
      const reply = replySnap.data() || {};
      if (reply.userId !== uid) return "forbidden" as const;
      const commentId = reply.commentId;
      if (typeof commentId !== "string" || !commentId || commentId.length > 500 || /[\\/]/.test(commentId)) {
        return "invalid" as const;
      }
      const commentRef = db.collection("comments").doc(commentId);
      const commentSnap = await tx.get(commentRef);
      tx.delete(replyRef);
      if (commentSnap.exists) {
        const count = Number(commentSnap.data()?.replyCount ?? 0);
        tx.update(commentRef, {
          replyCount: Math.max(0, (Number.isFinite(count) ? Math.floor(count) : 0) - 1),
        });
      }
      return "deleted" as const;
    });
    if (result === "missing") return fail("Reply not found", 404);
    if (result === "forbidden") return fail("You can only delete your own reply", 403);
    if (result === "invalid") return fail("Reply cannot be deleted", 409);
    return NextResponse.json({ success: true });
  } catch (cause) {
    console.error("Reply deletion failed:", cause);
    return fail("Unable to delete reply right now", 500);
  }
}
