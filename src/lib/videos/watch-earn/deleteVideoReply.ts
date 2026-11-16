import { auth } from "@/firebase/config";

interface DeleteVideoReplyData {
  replyId: string;
}

export async function deleteVideoReply(data: DeleteVideoReplyData) {
  const user = auth.currentUser;
  if (!user) return { success: false, message: "Please sign in before deleting a reply." };
  try {
    const token = await user.getIdToken();
    const response = await fetch("/api/shorts/comments/replies/delete", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ replyId: data.replyId }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success !== true) {
      return { success: false, message: typeof result.message === "string" ? result.message : "Unable to delete reply." };
    }
    return { success: true };
  } catch (cause) {
    console.error("Reply deletion failed:", cause);
    return { success: false, message: "Unable to delete reply." };
  }
}
