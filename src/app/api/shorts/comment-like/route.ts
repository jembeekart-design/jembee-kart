import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

type CommentLikeDependencies = {
  verifyToken: (token: string) => Promise<{ uid: string }>;
  getDb: () => any;
};

export function createPostHandler(deps: CommentLikeDependencies) {
  return async function POST(req: Request) {
    const header = req.headers.get("authorization");

    if (!header || !header.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    let uid: string;

    try {
      const token = header.slice(7).trim();
      if (!token) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 },
        );
      }

      uid = (await deps.verifyToken(token)).uid;
      if (!uid) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 },
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    let body: { commentId?: unknown; action?: unknown };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON" },
        { status: 400 },
      );
    }

    const commentId =
      typeof body.commentId === "string" ? body.commentId.trim() : "";
    const action = body.action;

    if (
      !commentId ||
      commentId.length > 500 ||
      (action !== "like" && action !== "unlike")
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid request" },
        { status: 400 },
      );
    }

    try {
      const db = deps.getDb();
      const commentRef = db.collection("comments").doc(commentId);
      const likeRef = db
        .collection("videoCommentLikes")
        .doc(commentId + "_" + uid);

      const result = await db.runTransaction(async (tx: any) => {
        const comment = await tx.get(commentRef);
        const like = await tx.get(likeRef);

        if (!comment.exists || comment.data()?.status !== "approved") {
          return {
            success: false,
            message: "Comment not available",
            status: 404,
          };
        }

        const raw = Number(comment.data()?.likes ?? 0);
        const count =
          Number.isFinite(raw) && raw >= 0 ? Math.floor(raw) : 0;

        if (action === "like") {
          if (like.exists) {
            return {
              success: false,
              message: "Already liked",
              status: 409,
            };
          }

          tx.set(likeRef, {
            commentId,
            userId: uid,
            createdAt: Date.now(),
          });

          tx.update(commentRef, {
            likes: count + 1,
            updatedAt: Date.now(),
          });
        } else {
          if (!like.exists) {
            return {
              success: false,
              message: "Not liked",
              status: 409,
            };
          }

          tx.delete(likeRef);

          tx.update(commentRef, {
            likes: Math.max(0, count - 1),
            updatedAt: Date.now(),
          });
        }

        return { success: true, status: 200 };
      });

      return NextResponse.json(result, { status: result.status });
    } catch (error) {
      console.error("Comment like API failed:", error);

      return NextResponse.json(
        { success: false, message: "Unable to update like" },
        { status: 500 },
      );
    }
  };
}

export const POST = createPostHandler({
  verifyToken: async (token) =>
    getAdminAuth().verifyIdToken(token),
  getDb: () => getAdminDb(),
});
