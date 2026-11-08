import { auth } from "@/firebase/config";

interface ReportVideoData {
  videoId: string;
  reason: string;
  message?: string;
}

export async function reportVideo(data: ReportVideoData) {
  try {
    const user = auth.currentUser;

    if (!user) {
      return {
        success: false,
        message: "Authentication required",
      };
    }

    if (
      typeof data.videoId !== "string" ||
      !data.videoId.trim() ||
      typeof data.reason !== "string" ||
      !data.reason.trim()
    ) {
      return {
        success: false,
        message: "Invalid report details",
      };
    }

    const token = await user.getIdToken();

    const response = await fetch("/api/shorts/video-report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        videoId: data.videoId,
        reason: data.reason,
        message: data.message || "",
        token,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        message: result.message || "Failed to submit report",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("REPORT VIDEO ERROR:", error);

    return {
      success: false,
      message: "Unable to submit report",
    };
  }
}
