import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";
import { confirmCashfreePayment, getCashfreeConfig, verifyCashfreeWebhookSignature } from "@/lib/payments/cashfree";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 131072) return NextResponse.json({ success: false }, { status: 413 });
    const rawBody = await req.text();
    if (Buffer.byteLength(rawBody, "utf8") > 131072) return NextResponse.json({ success: false }, { status: 413 });

    const signature = req.headers.get("x-webhook-signature") || "";
    const timestamp = req.headers.get("x-webhook-timestamp") || "";
    const config = await getCashfreeConfig({ requireEnabled: false });
    if (!verifyCashfreeWebhookSignature(rawBody, timestamp, signature, config.webhookSecret)) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    let payload: Record<string, any>;
    try {
      const parsed: unknown = JSON.parse(rawBody);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("INVALID_PAYLOAD");
      payload = parsed as Record<string, any>;
    } catch {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const providerOrderId = typeof payload.data?.order?.order_id === "string" ? payload.data.order.order_id : "";
    const payment = payload.data?.payment;
    const paymentId = payment?.cf_payment_id;
    if (!providerOrderId || !payment || (typeof paymentId !== "string" && typeof paymentId !== "number")) {
      // Validly signed non-payment or incomplete event: acknowledge to prevent endless retries.
      return NextResponse.json({ success: true, ignored: true });
    }

    // Cashfree's order_id is a provider identifier, not necessarily the
    // Firestore document ID. Resolve it through the persisted mapping first.
    // More than one match is ambiguous and must never credit an arbitrary order.
    const db = getAdminDb();
    const matchingOrders = await db.collection("orders")
      .where("cashfreeOrderId", "==", providerOrderId)
      .limit(2)
      .get();
    if (matchingOrders.size > 1) {
      console.error("Cashfree webhook provider order ID maps to multiple JembeeKart orders");
      return NextResponse.json({ success: false }, { status: 409 });
    }

    let internalOrderId = matchingOrders.docs[0]?.id || "";
    // Compatibility for older orders created before cashfreeOrderId was stored.
    if (!internalOrderId) {
      const legacyOrder = await db.collection("orders").doc(providerOrderId).get();
      if (legacyOrder.exists && legacyOrder.data()?.cashfreeOrderId === providerOrderId) {
        internalOrderId = legacyOrder.id;
      }
    }
    if (!internalOrderId) return NextResponse.json({ success: false }, { status: 404 });

    const result = await confirmCashfreePayment(internalOrderId, providerOrderId, payment as Record<string, unknown>);
    if (result === "order_not_found") return NextResponse.json({ success: false }, { status: 404 });
    if (result === "order_mismatch" || result === "amount_mismatch") {
      console.error("Cashfree webhook rejected by order/amount reconciliation:", result);
      return NextResponse.json({ success: false }, { status: 409 });
    }
    if (result === "duplicate_payment_review" || result === "late_payment_after_cancel_review") {
      console.error("Cashfree payment requires manual review:", providerOrderId, result);
    }
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Cashfree webhook processing error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ success: false }, { status: 503 });
  }
}
