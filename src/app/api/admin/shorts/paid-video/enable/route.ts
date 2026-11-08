import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { getCashfreeConfig } from "@/lib/payments/cashfree";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const reply = (error: string, status: number) =>
  NextResponse.json({ success: false, error }, { status, headers: { "Cache-Control": "no-store" } });

async function requireAdmin(req: Request): Promise<string> {
  const header = req.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const decoded = await getAdminAuth().verifyIdToken(header.slice(7).trim(), true);
  const db = getAdminDb();
  let user = (await db.collection("users").doc(decoded.uid).get()).data();
  if (user?.role !== "admin" && user?.role !== "super_admin") {
    const fallback = await db.collection("users").where("uid", "==", decoded.uid).limit(1).get();
    user = fallback.docs[0]?.data();
  }
  if (user?.role !== "admin" && user?.role !== "super_admin") throw new Error("FORBIDDEN");
  return decoded.uid;
}

export async function POST(req: NextRequest) {
  try {
    const adminUid = await requireAdmin(req);
    if (process.env.SHORTS_PAID_VIDEO_CHECKOUT_ENABLED !== "true") {
      return reply("Paid-video checkout feature flag is disabled", 503);
    }
    await getCashfreeConfig();
    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf8") > 2048) return reply("Request too large", 413);
    let body: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
      body = parsed as Record<string, unknown>;
    } catch { return reply("Invalid request", 400); }
    const videoId = typeof body.videoId === "string" ? body.videoId.trim() : "";
    if (!/^[A-Za-z0-9_-]{3,50}$/.test(videoId)) return reply("Invalid video ID", 400);

    const db = getAdminDb();
    const ref = db.collection("watchEarnVideos").doc(videoId);
    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const video = snap.data() || {};
      const amount = Number(video.videoPrice);
      const paise = Math.round(amount * 100);
      if (!snap.exists || video.status !== "approved" || video.moderation !== "safe" ||
          video.videoAccess !== "paid" || typeof video.creatorId !== "string" || !video.creatorId.trim() ||
          !Number.isFinite(amount) || amount < 1 || amount > 100000 || !Number.isSafeInteger(paise) ||
          Math.abs(amount * 100 - paise) > 1e-7) throw new Error("VIDEO_NOT_READY_FOR_PAID_CHECKOUT");
      if (video.paidCheckoutEnabled === true && video.paidVideoStatus === "enabled" && video.active === true) {
        return { alreadyEnabled: true };
      }
      tx.update(ref, {
        active: true,
        paidVideoStatus: "enabled",
        paidCheckoutEnabled: true,
        paidCheckoutEnabledAt: FieldValue.serverTimestamp(),
        paidCheckoutEnabledBy: adminUid,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { alreadyEnabled: false };
    });
    return NextResponse.json({ success: true, videoId, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 :
      code === "VIDEO_NOT_READY_FOR_PAID_CHECKOUT" ? 409 :
      code.startsWith("CASHFREE_") ? 503 : 500;
    return reply(status === 401 ? "Authentication required" : status === 403 ? "Admin access required" :
      status === 409 ? "Video is not approved and ready for paid checkout" :
      "Paid-video activation unavailable", status);
  }
}
