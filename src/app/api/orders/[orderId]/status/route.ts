import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    const authorization = req.headers.get("authorization") || "";
    if (!authorization.startsWith("Bearer ")) return fail("Authentication required", 401);
    const token = authorization.slice(7).trim();
    if (!token) return fail("Authentication required", 401);

    let uid: string;
    try {
      const decoded = await getAdminAuth().verifyIdToken(token, true);
      uid = decoded.uid;
    } catch {
      return fail("Session is invalid. Please sign in again.", 401);
    }

    const { orderId } = await context.params;
    if (!orderId || orderId.length > 200 || !/^[A-Za-z0-9_-]+$/.test(orderId)) {
      return fail("Invalid order ID", 400);
    }

    const snap = await getAdminDb().collection("orders").doc(orderId).get();
    if (!snap.exists) return fail("Order not found", 404);
    const order = snap.data() || {};
    if (order.userId !== uid) return fail("Order not found", 404);

    return NextResponse.json({
      success: true,
      order: {
        id: snap.id,
        orderNumber: typeof order.orderNumber === "string" ? order.orderNumber : "",
        status: typeof order.status === "string" ? order.status : "placed",
        paymentMethod: typeof order.paymentMethod === "string" ? order.paymentMethod : "unknown",
        paymentStatus: typeof order.paymentStatus === "string" ? order.paymentStatus : "not_required",
        manualReviewRequired: order.paymentAfterCancellationReviewRequired === true || order.duplicatePaymentReviewRequired === true,
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Order status API error:", error instanceof Error ? error.message : "unknown");
    return fail("Unable to retrieve order status", 500);
  }
}
