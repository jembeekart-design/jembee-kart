import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

const ALLOWED_REASONS = [
  "spam",
  "violence",
  "harassment",
  "misinformation",
  "inappropriate",
  "copyright",
  "other",
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { videoId, reason, message, token } = body ?? {};

    if (
      typeof videoId !== "string" ||
      !videoId.trim() ||
      videoId.length > 500 ||
      typeof reason !== "string" ||
      !ALLOWED_REASONS.includes(reason) ||
      (message !== undefined &&
        (typeof message !== "string" || message.length > 1000)) ||
      typeof token !== "string" ||
      !token
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid report details" },
        { status: 400 }
      );
    }

    const decoded = await getAdminAuth().verifyIdToken(token);
    const uid = decoded.uid;
    const db = getAdminDb();

    const videoRef = db.collection("watchEarnVideos").doc(videoId);
    const reportRef = db
      .collection("videoReports")
      .doc(`${videoId}_${uid}`);

    const result = await db.runTransaction(async (transaction) => {
      const videoSnap = await transaction.get(videoRef);
      const reportSnap = await transaction.get(reportRef);

      if (!videoSnap.exists) {
        return {
          success: false,
          message: "Video not found",
          status: 404,
        };
      }

      if (reportSnap.exists) {
        return {
          success: false,
          message: "Already reported",
          status: 409,
        };
      }

      transaction.create(reportRef, {
        userId: uid,
        videoId,
        reason,
        message: message?.trim() || "",
        status: "pending",
        createdAt: Date.now(),
      });

      return { success: true, status: 201 };
    });

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("Shorts video report API error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to submit report" },
      { status: 500 }
    );
  }
}
