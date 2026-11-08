import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const reply = (error: string, status: number) => NextResponse.json({ success: false, error }, { status, headers: { "Cache-Control": "no-store" } });

async function requireAdmin(req: Request) {
  const header = req.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const decoded = await getAdminAuth().verifyIdToken(header.slice(7).trim(), true);
  const db = getAdminDb();
  let user = (await db.collection("users").doc(decoded.uid).get()).data();
  if (user?.role !== "admin" && user?.role !== "super_admin") user = (await db.collection("users").where("uid", "==", decoded.uid).limit(1).get()).docs[0]?.data();
  if (user?.role !== "admin" && user?.role !== "super_admin") throw new Error("FORBIDDEN");
  return decoded.uid;
}

export async function POST(req: NextRequest) {
  try {
    const adminUid = await requireAdmin(req);
    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf8") > 4096) return reply("Request too large", 413);
    let body: Record<string, unknown>;
    try { const value: unknown = JSON.parse(raw); if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(); body = value as Record<string, unknown>; }
    catch { return reply("Invalid request", 400); }
    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
    const invoiceNumber = typeof body.invoiceNumber === "string" ? body.invoiceNumber.trim() : "";
    const evidencePath = typeof body.evidencePath === "string" ? body.evidencePath.trim() : "";
    const amountPaise = Number(body.amountPaise);
    const description = typeof body.description === "string" ? body.description.trim().slice(0, 300) : "";
    if (!/^[A-Za-z0-9_-]{3,50}$/.test(orderId) || !/^[A-Za-z0-9/_.-]{8,240}$/.test(evidencePath) || evidencePath.includes("..") ||
        !evidencePath.startsWith(`shorts-expense-evidence/${orderId}/`) || !invoiceNumber || invoiceNumber.length > 80 ||
        !Number.isSafeInteger(amountPaise) || amountPaise <= 0 || amountPaise > 100_000_000 || !description) return reply("Invalid expense details", 400);
    const db = getAdminDb();
    const orderRef = db.collection("watchVideoPaymentOrders").doc(orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists || orderSnap.data()?.status !== "paid") return reply("Verified paid-video order required", 409);
    const expenseId = createHash("sha256").update(`${orderId}:${invoiceNumber}`).digest("hex");
    const expenseRef = db.collection("shortsVerifiedExpenses").doc(expenseId);
    await db.runTransaction(async (tx) => {
      const existing = await tx.get(expenseRef);
      if (existing.exists) {
        const data = existing.data() || {};
        if (data.orderId !== orderId || data.invoiceNumber !== invoiceNumber || data.amountPaise !== amountPaise || data.evidencePath !== evidencePath) throw new Error("EXPENSE_CONFLICT");
        return;
      }
      tx.create(expenseRef, { expenseId, orderId, invoiceNumber, evidencePath, evidenceRef: null, amountPaise, currency: "INR", description, status: "pending_review", createdByUid: adminUid, createdAt: FieldValue.serverTimestamp() });
    });
    return NextResponse.json({ success: true, expenseId, status: "pending_review" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : code === "EXPENSE_CONFLICT" ? 409 : 500;
    return reply(status === 401 ? "Authentication required" : status === 403 ? "Admin access required" : status === 409 ? "Expense record conflicts with an existing invoice" : "Could not record expense", status);
  }
}
