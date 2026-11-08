import { auth } from "@/firebase/config";

interface LikeVideoCommentData {
  commentId: string;
  userId: string;
}

async function updateCommentLike(data: LikeVideoCommentData, action: "like" | "unlike") {
  const user = auth.currentUser;
  if (!user || user.uid !== data.userId) {
    return { success: false, message: "Please sign in again." };
  }

  try {
    const token = await user.getIdToken();
    const response = await fetch("/api/shorts/comment-like", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ commentId: data.commentId, action }),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success !== true) {
      return {
        success: false,
        message: typeof result.message === "string" ? result.message : "Unable to update like.",
      };
    }
    return { success: true };
  } catch (error) {
    console.error("Comment like request failed:", error);
    return { success: false, message: "Unable to update like." };
  }
}

export function likeVideoComment(data: LikeVideoCommentData) {
  return updateCommentLike(data, "like");
}

export function unlikeVideoComment(data: LikeVideoCommentData) {
  return updateCommentLike(data, "unlike");
}
