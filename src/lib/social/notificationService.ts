import { auth } from "@/firebase/config";

export const sendFollowNotification = async (_followerUid: string, targetUid: string) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Please sign in before creating a notification.");
  if (currentUser.uid === targetUid) throw new Error("Cannot notify yourself.");

  const token = await currentUser.getIdToken();
  const response = await fetch("/api/shorts/notifications/follow", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ targetUid }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success !== true) {
    throw new Error(typeof result.message === "string" ? result.message : "Unable to create follow notification.");
  }
};
