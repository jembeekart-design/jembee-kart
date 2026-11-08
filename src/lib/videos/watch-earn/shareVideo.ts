import { auth } from "@/firebase/config";

interface ShareVideoData { videoId: string; userId: string; }

/** Persist a share through the server; client Firestore writes are denied by rules. */
export async function shareVideo({ videoId, userId }: ShareVideoData) {
  try {
    const user = auth.currentUser;
    if (!user || user.uid !== userId) return { success: false, message: "Authentication required" };
    if (!videoId || videoId.includes("/") || videoId.length > 180) return { success: false, message: "Invalid video" };
    const token = await user.getIdToken();
    const response = await fetch("/api/shorts/video-share", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ videoId }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) return { success: false, message: typeof result?.message === "string" ? result.message : "Unable to record share" };
    return result ?? { success: false, message: "Invalid server response" };
  } catch (error) {
    console.error("SHARE VIDEO ERROR:", error);
    return { success: false, message: "Failed to record share" };
  }
}
