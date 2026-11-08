import { auth } from "@/firebase/config";

interface LikeVideoData {
  videoId: string;
  userId: string;
}

export async function likeVideo({ videoId, userId }: LikeVideoData) {
  try {
    const user = auth.currentUser;

    if (!user) {
      return { success: false, message: "Authentication required" };
    }

    if (!videoId || user.uid !== userId) {
      return { success: false, message: "Invalid user or video" };
    }

    const token = await user.getIdToken();

    const response = await fetch("/api/shorts/video-like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, action: "like", token }),
    });

    return await response.json();
  } catch (error) {
    console.error("LIKE VIDEO ERROR:", error);
    return { success: false, message: "Failed to like the video" };
  }
}
