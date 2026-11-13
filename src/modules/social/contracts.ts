/** Pure Social-domain contracts. Keep Firestore and framework dependencies out of this file. */
export type SocialAction = "like" | "unlike";

export function validateFollowPair(followerUid: unknown, targetUid: unknown): string | null {
  if (typeof followerUid !== "string" || !followerUid.trim()) return "Follower user ID is missing";
  if (typeof targetUid !== "string" || !targetUid.trim()) return "Target user ID is missing";
  if (followerUid.trim() === targetUid.trim()) return "Cannot follow yourself";
  if (followerUid.length > 128 || targetUid.length > 128) return "Invalid user ID";
  return null;
}

export function validateCommentLikeInput(commentId: unknown, action: unknown): { commentId: string; action: SocialAction } | null {
  if (typeof commentId !== "string") return null;
  const normalizedId = commentId.trim();
  if (!normalizedId || normalizedId.length > 500) return null;
  if (action !== "like" && action !== "unlike") return null;
  return { commentId: normalizedId, action };
}

export function buildFollowNotification(recipientUid: string, senderUid: string, senderName: string) {
  const safeName = senderName.trim().slice(0, 100) || "Someone";
  return {
    recipientUid,
    senderUid,
    type: "follow" as const,
    message: `${safeName} started following you.`,
    read: false,
  };
}
