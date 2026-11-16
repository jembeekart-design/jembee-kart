import { auth } from "@/firebase/config";

async function followRequest(targetUid: string, action: "follow" | "unfollow") {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Please sign in before changing follow status.");
  if (!targetUid || targetUid.length > 128 || /[\\/]/.test(targetUid)) {
    throw new Error("Invalid target user ID.");
  }
  if (currentUser.uid === targetUid) throw new Error("Cannot follow yourself.");

  const token = await currentUser.getIdToken();
  const response = await fetch("/api/social/follow", {
    method: action === "follow" ? "POST" : "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ targetUid }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success !== true) {
    throw new Error(typeof result.message === "string" ? result.message : "Unable to update follow status.");
  }
  return { success: true as const, alreadyFollowing: result.alreadyFollowing === true };
}

export const followUser = async (
  _followerUid: string,
  targetUid: string,
  _followerName: string
) => followRequest(targetUid, "follow");

export const unfollowUser = async (followerUid: string, targetUid: string) => {
  if (auth.currentUser?.uid !== followerUid) throw new Error("Authenticated user mismatch.");
  return followRequest(targetUid, "unfollow");
};

export const isFollowing = async (
  followerUid: string,
  targetUid: string
): Promise<boolean> => {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== followerUid || !targetUid || followerUid === targetUid) return false;
  const token = await currentUser.getIdToken();
  const response = await fetch(`/api/social/follow?targetUid=${encodeURIComponent(targetUid)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Unable to check follow status.");
  const result = await response.json();
  return result.following === true;
};
