import { NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("CLOUDINARY MODERATION WEBHOOK RECEIVED:", JSON.stringify(body));

    const { public_id, moderation_status, moderation_kind, moderation_details } = body;

    // Find the video document
    const videosRef = adminDb.collection("watchEarnVideos");
    const snapshot = await videosRef.where("publicId", "==", public_id).get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const doc = snapshot.docs[0];
    const videoId = doc.id;
    const videoData = doc.data();

    // Idempotency check: if already moderated, do nothing
    if (videoData.status !== "pending") {
      return NextResponse.json({ message: "Already processed" });
    }

    let newStatus = "pending";
    let newModeration = "pending";
    let newCoins = 0;
    let newPendingCoins = 0;

    if (moderation_status === "approved") {
      newStatus = "approved";
      newModeration = "safe";
      newCoins = videoData.pendingCoins || 0;
      newPendingCoins = 0;
    } else if (moderation_status === "rejected") {
      newStatus = "rejected";
      newModeration = "rejected";
      newCoins = 0;
      newPendingCoins = 0;
    }

    // Use a transaction for atomicity
    await adminDb.runTransaction(async (transaction) => {
      transaction.update(doc.ref, {
        status: newStatus,
        moderation: newModeration,
        moderationCheckedAt: FieldValue.serverTimestamp(),
        moderationResult: {
          provider: "cloudinary",
          category: moderation_kind,
          status: moderation_status,
          details: moderation_details,
        },
        coins: newCoins,
        pendingCoins: newPendingCoins,
      });

      // Create Admin Notification if flagged/rejected
      if (newStatus === "rejected") {
        const notificationRef = adminDb.collection("notifications").doc();
        transaction.set(notificationRef, {
          type: "content_moderation",
          title: "Video Moderation Alert",
          message: `Video ${videoId} was rejected by AI moderation.`,
          visible: true, // For existing UI compatibility
          videoId: videoId,
          creatorId: videoData.creatorId,
          severity: "high",
          read: false,
          createdAt: FieldValue.serverTimestamp(),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WEBHOOK ERROR:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
