import { auth } from "@/firebase/config";

interface ReplyVideoCommentData {
  userId: string;
  commentId: string;
  reply: string;
}

export async function replyVideoComment(data: ReplyVideoCommentData) {
  const user = auth.currentUser;
  if (!user) return { success: false, message: "Please sign in before replying." };
  if (data.userId !== user.uid) return { success: false, message: "Authenticated user mismatch." };

  try {
    const token = await user.getIdToken();
    const response = await fetch("/api/shorts/comments/replies", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        commentId: data.commentId,
        reply: data.reply,
        requestId: crypto.randomUUID(),
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success !== true) {
      return { success: false, message: typeof result.message === "string" ? result.message : "Unable to submit reply." };
    }
    return { success: true, replyId: result.reply?.id ?? null };
  } catch (error) {
    console.error("Comment reply request failed:", error);
    return { success: false, message: "Unable to submit reply." };
  }
}
