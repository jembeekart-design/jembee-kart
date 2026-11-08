import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { cashfreeRequest, deterministicUuid, getCashfreeConfig, getPublicAppUrl } from "@/lib/payments/cashfree";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CashfreeOrder = {
  order_id?: string;
  order_amount?: number;
  order_currency?: string;
  payment_session_id?: string;
  order_expiry_time?: string;
};

const fail = (error: string, status: number) =>
  NextResponse.json({ success: false, error }, { status, headers: { "Cache-Control": "no-store" } });

function amountPaise(value: unknown): number | null {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isSafeInteger(Math.round(amount * 100)) ||
      Math.abs(amount * 100 - Math.round(amount * 100)) > 1e-7) return null;
  return Math.round(amount * 100);
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return fail("Authentication required", 401);
    let uid = "";
    try { uid = (await getAdminAuth().verifyIdToken(authHeader.slice(7).trim(), true)).uid; }
    catch { return fail("Session is invalid. Please sign in again.", 401); }

    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf8") > 4096) return fail("Request too large", 413);
    let body: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
      body = parsed as Record<string, unknown>;
    } catch { return fail("Invalid request", 400); }

    const videoId = typeof body.videoId === "string" ? body.videoId.trim() : "";
    const mobile = typeof body.mobileNumber === "string" ? body.mobileNumber.replace(/\D/g, "") : "";
    const shareId = typeof body.shareId === "string" ? body.shareId.trim() : "";
    if (!/^[A-Za-z0-9_-]{3,50}$/.test(videoId)) return fail("Invalid video", 400);
    if (!/^\d{10}$/.test(mobile)) return fail("A valid 10-digit mobile number is required", 400);

    const db = getAdminDb();
    const videoRef = db.collection("watchEarnVideos").doc(videoId);
    const videoSnap = await videoRef.get();
    if (!videoSnap.exists) return fail("Video not found", 404);
    const video = videoSnap.data() || {};
    if (video.status !== "approved" || video.active !== true || video.moderation !== "safe" ||
        video.videoAccess !== "paid" || video.paidVideoStatus !== "enabled" ||
        video.paidCheckoutEnabled !== true || typeof video.creatorId !== "string" ||
        !video.creatorId.trim()) return fail("This paid video is not available for purchase", 409);
    if (video.creatorId === uid) return fail("Creators cannot purchase their own video", 403);

    const pricePaise = amountPaise(video.videoPrice);
    if (pricePaise === null || pricePaise < 100 || pricePaise > 10_000_000) return fail("Video price is invalid", 409);

    const purchaseRef = db.collection("watchVideoPurchases").doc(`${videoId}_${uid}`);
    const purchaseSnap = await purchaseRef.get();
    if (purchaseSnap.exists && purchaseSnap.data()?.status === "paid" && purchaseSnap.data()?.accessRevoked !== true) {
      return NextResponse.json({ success: true, alreadyPurchased: true }, { headers: { "Cache-Control": "no-store" } });
    }

    const config = await getCashfreeConfig();
    const profileSnap = await db.collection("users").doc(uid).get();
    const profile = profileSnap.data() || {};
    const email = typeof profile.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) ? profile.email : undefined;
    // A stable 15-minute idempotency window prevents rapid repeat taps from
    // creating multiple payable Cashfree orders for the same buyer/video.
    const orderId = `jpv_${deterministicUuid(`shorts:${uid}:${videoId}:${Math.floor(Date.now() / 900000)}`).replace(/-/g, "")}`;
    const cashfreeOrderId = orderId;
    const orderRef = db.collection("watchVideoPaymentOrders").doc(orderId);
    const existingOrderSnap = await orderRef.get();
    if (existingOrderSnap.exists) {
      const existing = existingOrderSnap.data() || {};
      const expiry = typeof existing.expiresAt === "string" ? Date.parse(existing.expiresAt) : 0;
      if (existing.userId === uid && existing.videoId === videoId && existing.status === "pending" &&
          typeof existing.paymentSessionId === "string" && expiry > Date.now() + 60000) {
        return NextResponse.json({ success: true, orderId, paymentSessionId: existing.paymentSessionId,
          environment: config.sandboxMode ? "sandbox" : "production" }, { headers: { "Cache-Control": "no-store" } });
      }
      if (existing.status === "paid") return fail("This video has already been purchased", 409);
      return fail("An earlier checkout attempt needs to expire before retrying", 409);
    }
    const appUrl = getPublicAppUrl();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    // A share reference is accepted only when this authenticated buyer previously
    // claimed the same server-created share link for this exact video.
    let sharerId: string | null = null;
    if (shareId) {
      if (!/^[A-Za-z0-9_-]{24,80}$/.test(shareId)) return fail("Invalid share reference", 400);
      const claimSnap = await db.collection("monetagShareClaims").doc(`${shareId}_${uid}`).get();
      const claim = claimSnap.data() || {};
      if (claimSnap.exists && claim.status === "claimed" && claim.shareId === shareId &&
          claim.videoId === videoId && claim.buyerUid === uid &&
          typeof claim.sharerUid === "string" && claim.sharerUid !== uid &&
          claim.sharerUid !== video.creatorId && claim.creatorUid === video.creatorId) {
        sharerId = claim.sharerUid;
      }
    }

    // Referral mapping is read from the canonical teacher attribution record.
    const referralSnap = await db.collection("teacherReferralAttributions").doc(video.creatorId).get();
    const referral = referralSnap.data() || {};
    const teacherUid = referral.status === "verified" && referral.teacherUid === video.creatorId
      ? video.creatorId : null;

    const provider = await cashfreeRequest<CashfreeOrder>(config, "/orders", {
      method: "POST",
      idempotencyKey: deterministicUuid(`jembeeshorts-paid-video:${orderId}`),
      body: {
        order_id: cashfreeOrderId,
        order_amount: pricePaise / 100,
        order_currency: "INR",
        customer_details: {
          customer_id: uid.slice(0, 50),
          customer_name: typeof profile.displayName === "string" ? profile.displayName.slice(0, 100) : "JEMBEE PLAY User",
          customer_phone: mobile,
          ...(email ? { customer_email: email } : {}),
        },
        order_meta: {
          return_url: `${appUrl}/shorts/payment-return?order_id=${encodeURIComponent(orderId)}`,
          notify_url: `${appUrl}/api/payments/cashfree/webhook`,
        },
        order_expiry_time: expiresAt,
        order_note: `JEMBEE PLAY paid video ${videoId}`.slice(0, 250),
      },
    });

    if (provider.order_id !== cashfreeOrderId || typeof provider.payment_session_id !== "string" ||
        !provider.payment_session_id || amountPaise(provider.order_amount) !== pricePaise ||
        String(provider.order_currency || "").toUpperCase() !== "INR") {
      throw new Error("CASHFREE_INVALID_CREATE_ORDER_RESPONSE");
    }

    await db.runTransaction(async (tx) => {
      const freshVideo = await tx.get(videoRef);
      const fresh = freshVideo.data() || {};
      if (!freshVideo.exists || fresh.status !== "approved" || fresh.active !== true ||
          fresh.moderation !== "safe" || fresh.videoAccess !== "paid" ||
          fresh.paidVideoStatus !== "enabled" || fresh.paidCheckoutEnabled !== true ||
          fresh.creatorId !== video.creatorId || amountPaise(fresh.videoPrice) !== pricePaise) {
        throw new Error("VIDEO_CHANGED_DURING_CHECKOUT");
      }
      tx.create(orderRef, {
        userId: uid, videoId, creatorId: String(fresh.creatorId),
        teacherUid, amount: pricePaise / 100, amountPaise: pricePaise, currency: "INR",
        status: "pending", paymentProvider: "cashfree", cashfreeOrderId,
        paymentSessionId: provider.payment_session_id,
        cashfreeOrderExpiryTime: provider.order_expiry_time || expiresAt,
        mobileNumber: mobile, shareId: sharerId ? shareId : null, sharerId, sharerAttributionVerified: Boolean(sharerId),
        createdAt: FieldValue.serverTimestamp(), expiresAt,
      });
    });

    return NextResponse.json({
      success: true, orderId, paymentSessionId: provider.payment_session_id,
      environment: config.sandboxMode ? "sandbox" : "production",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    console.error("Paid-video Cashfree order creation failed", code);
    const status = code === "VIDEO_CHANGED_DURING_CHECKOUT" ? 409 :
      code === "CASHFREE_DISABLED" || code === "CASHFREE_NOT_CONFIGURED" ? 503 : 502;
    return fail(status === 409 ? "Video changed during checkout; please retry" :
      "Paid-video checkout is temporarily unavailable", status);
  }
}
