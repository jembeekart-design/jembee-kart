import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
  // Configure this shared secret in the Cloudinary webhook caller and server environment.
  // Fail closed: an unsigned request must never be able to change moderation state.
  const expectedSecret = process.env.CLOUDINARY_MODERATION_WEBHOOK_SECRET;
  const suppliedSecret = request.headers.get("x-webhook-secret");
  if (!expectedSecret || !suppliedSecret || suppliedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { public_id, moderation_status, moderation_kind, moderation_details } = body ?? {};
    if (typeof public_id !== "string" || !["approved", "rejected"].includes(moderation_status)) {
      return NextResponse.json({ error: "Invalid moderation payload" }, { status: 400 });
    }
    const adminDb = getAdminDb();
    const snapshot = await adminDb.collection("watchEarnVideos").where("publicId", "==", public_id).limit(1).get();
    if (snapshot.empty) return NextResponse.json({ error: "Video not found" }, { status: 404 });

    const doc = snapshot.docs[0];
    const videoId = doc.id;
    const videoData = doc.data();
    await adminDb.runTransaction(async (transaction) => {
      const fresh = await transaction.get(doc.ref);
      if (!fresh.exists || fresh.data()?.status !== "pending") return;
      const approved = moderation_status === "approved";
      transaction.update(doc.ref, {
        status: approved ? "approved" : "rejected",
        moderation: approved ? "safe" : "rejected",
        moderationCheckedAt: FieldValue.serverTimestamp(),
        moderationResult: {
          provider: "cloudinary",
          category: typeof moderation_kind === "string" ? moderation_kind : null,
          status: moderation_status,
          details: moderation_details ?? null,
        },
        // Video moderation must never mint watch rewards/coins.
        coins: 0,
        pendingCoins: 0,
      });
      if (!approved) {
        const notificationRef = adminDb.collection("notifications").doc();
        transaction.set(notificationRef, {
          type: "content_moderation",
          title: "Video Moderation Alert",
          message: `Video ${videoId} was rejected by AI moderation.`,
          visible: true,
          videoId,
          creatorId: videoData.creatorId ?? null,
          severity: "high",
          read: false,
          createdAt: FieldValue.serverTimestamp(),
        });
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WEBHOOK ERROR", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
