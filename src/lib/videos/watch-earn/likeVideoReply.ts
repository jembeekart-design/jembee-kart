import { auth } from "@/firebase/config";

interface LikeVideoReplyData { replyId: string; }

export async function likeVideoReply(data: LikeVideoReplyData) {
  const user = auth.currentUser;
  if (!user) return { success: false, message: "Please sign in before liking a reply." };
  try {
    const token = await user.getIdToken();
    const response = await fetch("/api/shorts/comments/replies/like", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ replyId: data.replyId }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success !== true) {
      return { success: false, message: typeof result.message === "string" ? result.message : "Unable to like reply." };
    }
    return { success: true, alreadyLiked: result.alreadyLiked === true };
  } catch (error) {
    console.error("Reply like failed:", error);
    return { success: false, message: "Unable to like reply." };
  }
}
