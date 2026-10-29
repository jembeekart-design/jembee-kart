import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { readBoundedJson } from "@/lib/server/readBoundedJson";

const ALLOWED_REASONS = [
  "spam",
  "misleading",
  "hate",
  "nudity",
  "violence",
  "copyright",
  "other",
  "harassment",
  "misinformation",
  "inappropriate",
];

export async function POST(req: Request) {
  try {
    const parsedBody = await readBoundedJson(req, 8 * 1024);
    if (!parsedBody.ok) return NextResponse.json({ success: false, message: parsedBody.message }, { status: parsedBody.status });
    if (!parsedBody.value || typeof parsedBody.value !== "object" || Array.isArray(parsedBody.value)) return NextResponse.json({ success: false, message: "A JSON object is required." }, { status: 400 });
    const body = parsedBody.value as Record<string, unknown>;
    const { videoId, reason: rawReason, message, token } = body ?? {};
    const reason =
      typeof rawReason === "string" ? rawReason.trim().toLowerCase() : rawReason;

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
