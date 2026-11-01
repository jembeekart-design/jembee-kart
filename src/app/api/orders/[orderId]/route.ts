import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function safeString(value: unknown, maxLength: number, fallback = "") {
  return typeof value === "string" ? value.slice(0, maxLength) : fallback;
}

function safeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function safeAddress(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const address = value as Record<string, unknown>;
  return {
    fullName: safeString(address.fullName, 120),
    address: safeString(address.address, 500),
    city: safeString(address.city, 100),
    state: safeString(address.state, 100),
    pincode: safeString(address.pincode, 20),
    mobile: safeString(address.mobile, 30),
  };
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

    const placedAt = order.placedAt;
    const placedAtSeconds =
      placedAt && typeof placedAt.seconds === "number"
        ? placedAt.seconds
        : placedAt instanceof Date
          ? Math.floor(placedAt.getTime() / 1000)
          : null;

    // Explicit customer-facing projection: never serialize internal payment,
    // fraud, provider, moderation, or administrative metadata.
    const customerOrder = {
      id: snap.id,
      orderNumber: safeString(order.orderNumber, 100),
      placedAt: placedAtSeconds === null ? null : { seconds: placedAtSeconds },
      finalAmount: safeNumber(order.finalAmount),
      status: safeString(order.status, 40, "placed"),
      paymentMethod: safeString(order.paymentMethod, 40, "unknown"),
      productImage: safeString(order.productImage, 2048, "/placeholder.png"),
      productTitle: safeString(order.productTitle, 200, "Product"),
      quantity: safeNumber(order.quantity),
      productPrice: safeNumber(order.productPrice),
      discount: safeNumber(order.discount),
      shippingAddress: safeAddress(order.shippingAddress),
      exchangeEligible: order.exchangeEligible === true,
      inventoryRestockStatus: safeString(order.inventoryRestockStatus, 40),
    };

    return NextResponse.json(
      { success: true, order: customerOrder },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Customer order detail API error:", error instanceof Error ? error.message : "unknown");
    return fail("Unable to retrieve order details", 500);
  }
}
