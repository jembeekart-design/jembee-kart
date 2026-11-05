import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { getAdminDb } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
  const apiSecret = process.env.CLOUDINARY_WEBHOOK_API_SECRET || process.env.CLOUDINARY_API_SECRET;
  const signature = request.headers.get("x-cld-signature") || "";
  const timestampHeader = request.headers.get("x-cld-timestamp") || "";
  if (!apiSecret || !/^\d{10}$/.test(timestampHeader) || !/^[a-f0-9]{40}$|^[a-f0-9]{64}$/i.test(signature)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 65536) return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > 65536) return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    const timestamp = Number(timestampHeader);
    const now = Math.floor(Date.now() / 1000);
    if (timestamp < now - 7200 || timestamp > now + 300) return NextResponse.json({ error: "Expired webhook signature" }, { status: 401 });
    const algorithm = signature.length === 64 ? "sha256" : "sha1";
    const expected = createHash(algorithm).update(`${rawBody}${timestampHeader}${apiSecret}`).digest();
    const supplied = Buffer.from(signature, "hex");
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = JSON.parse(rawBody);
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
