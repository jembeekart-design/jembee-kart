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

export async function GET(_req: NextRequest) {
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

    // Bounded response; the customer UI labels this as the latest 100 orders.
    const snapshot = await getAdminDb()
      .collection("orders")
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const orders = snapshot.docs.map((doc) => {
      const order = doc.data();
      const placedAt = order.placedAt ?? order.createdAt;
      const placedAtSeconds =
        placedAt && typeof placedAt.seconds === "number"
          ? placedAt.seconds
          : placedAt instanceof Date
            ? Math.floor(placedAt.getTime() / 1000)
            : null;
      return {
        id: doc.id,
        orderNumber: safeString(order.orderNumber, 100),
        placedAt: placedAtSeconds === null ? null : { seconds: placedAtSeconds },
        finalAmount: safeNumber(order.finalAmount),
        status: safeString(order.status, 40, "placed"),
        productImage: safeString(order.productImage, 2048, "/placeholder.png"),
        productTitle: safeString(order.productTitle, 200, "Product"),
        quantity: safeNumber(order.quantity, 1),
      };
    });

    return NextResponse.json(
      { success: true, orders, limit: 100 },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Customer order list API error:", error instanceof Error ? error.message : "unknown");
    return fail("Unable to retrieve your orders", 500);
  }
}
