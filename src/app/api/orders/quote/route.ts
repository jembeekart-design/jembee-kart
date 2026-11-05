import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { calculateInvoice, paiseToRupees } from "@/lib/commerce/invoice";

export const runtime = "nodejs";

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  try {
    const header = req.headers.get("authorization") || "";
    if (!header.startsWith("Bearer ")) return fail("Please log in to view your invoice.", 401);
    let uid: string;
    try { uid = (await getAdminAuth().verifyIdToken(header.slice(7).trim(), true)).uid; }
    catch { return fail("Your session is invalid. Please sign in again.", 401); }

    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf8") > 4096) return fail("Request body too large.", 413);
    let body: unknown;
    try { body = JSON.parse(raw); } catch { return fail("Invalid JSON request.", 400); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return fail("Invalid request.", 400);
    const input = body as Record<string, unknown>;
    const productId = typeof input.productId === "string" ? input.productId.trim() : "";
    const quantity = Number(input.quantity ?? 1);
    if (!productId || productId.length > 200 || !/^[A-Za-z0-9_-]+$/.test(productId)) return fail("Invalid product.", 400);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return fail("Invalid quantity.", 400);

    const db = getAdminDb();
    const [productSnap, shippingSnap] = await Promise.all([
      db.collection("products").doc(productId).get(),
      db.collection("settings").doc("shipping").get(),
    ]);
    if (!productSnap.exists || productSnap.data()?.visible !== true) return fail("This product is unavailable.", 404);
    if (!shippingSnap.exists || shippingSnap.data()?.shippingConfigured !== true) {
      return fail("Shipping policy is not configured yet. Please try again later.", 503);
    }
    const invoice = calculateInvoice(productSnap.data() || {}, shippingSnap.data() || {}, quantity);
    return NextResponse.json({
      success: true,
      invoice: {
        ...invoice,
        subtotal: paiseToRupees(invoice.subtotalPaise),
        discount: paiseToRupees(invoice.discountPaise),
        itemTotal: paiseToRupees(invoice.itemTotalPaise),
        shippingCharge: paiseToRupees(invoice.shippingPaise),
        total: paiseToRupees(invoice.totalPaise),
      },
      quoteVersion: 1,
      quotedAt: new Date().toISOString(),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "SHIPPING_NOT_CONFIGURED") return fail("Shipping policy is not configured yet.", 503);
    if (code === "INVALID_PRODUCT_PRICE" || code === "INVALID_PRODUCT_DISCOUNT" ||
        code === "INVALID_SHIPPING_SETTINGS" || code === "INVALID_INVOICE_AMOUNT") {
      return fail("Unable to calculate this order total. Please contact support.", 409);
    }
    console.error("Order quote API failed:", code || "unknown");
    return fail("Unable to calculate invoice.", 500);
  }
}
