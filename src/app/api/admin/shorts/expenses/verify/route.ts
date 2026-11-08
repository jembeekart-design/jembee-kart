import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb, getAdminStorage } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const reply = (error: string, status: number) => NextResponse.json({ success: false, error }, { status, headers: { "Cache-Control": "no-store" } });

async function requireSuperAdmin(req: Request) {
  const header = req.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const decoded = await getAdminAuth().verifyIdToken(header.slice(7).trim(), true);
  const db = getAdminDb();
  let user = (await db.collection("users").doc(decoded.uid).get()).data();
  if (user?.role !== "super_admin") user = (await db.collection("users").where("uid", "==", decoded.uid).limit(1).get()).docs[0]?.data();
  if (user?.role !== "super_admin") throw new Error("FORBIDDEN");
  return decoded.uid;
}


export async function GET(req: NextRequest) {
  try {
    await requireSuperAdmin(req);
    const db = getAdminDb();
    const snapshot = await db.collection("shortsVerifiedExpenses").where("status", "==", "pending_review").limit(50).get();
    const expenses = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();
      const evidencePath = typeof data.evidencePath === "string" ? data.evidencePath : "";
      let evidencePreviewUrl: string | null = null;
      if (evidencePath.startsWith(`shorts-expense-evidence/${data.orderId}/`)) {
        const [url] = await getAdminStorage().bucket().file(evidencePath).getSignedUrl({ action: "read", expires: Date.now() + 5 * 60 * 1000 });
        evidencePreviewUrl = url;
      }
      return { expenseId: doc.id, orderId: data.orderId, invoiceNumber: data.invoiceNumber, amountPaise: data.amountPaise, currency: data.currency, description: data.description, evidencePath, evidencePreviewUrl, createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null };
    }));
    return NextResponse.json({ success: true, expenses }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500;
    return reply(status === 401 ? "Authentication required" : status === 403 ? "Super Admin access required" : "Could not load pending expenses", status);
  }
}

export async function POST(req: NextRequest) {
  try {
    const verifierUid = await requireSuperAdmin(req);
    const body = await req.json().catch(() => null);
    const expenseId = typeof body?.expenseId === "string" ? body.expenseId.trim() : "";
    if (!/^[a-f0-9]{64}$/.test(expenseId)) return reply("Invalid expense ID", 400);
    const db = getAdminDb();
    const expenseRef = db.collection("shortsVerifiedExpenses").doc(expenseId);
    const snap = await expenseRef.get();
    if (!snap.exists) return reply("Expense not found", 404);
    const expense = snap.data() || {};
    if (expense.status === "verified") return NextResponse.json({ success: true, alreadyVerified: true }, { headers: { "Cache-Control": "no-store" } });
    if (expense.status !== "pending_review" || typeof expense.evidencePath !== "string" || !expense.evidencePath.startsWith(`shorts-expense-evidence/${expense.orderId}/`)) return reply("Expense is not eligible for verification", 409);
    const bucket = getAdminStorage().bucket();
    const file = bucket.file(expense.evidencePath);
    const [exists] = await file.exists();
    if (!exists) return reply("Invoice evidence file is missing", 422);
    const [metadata] = await file.getMetadata();
    const size = Number(metadata.size || 0);
    const contentType = String(metadata.contentType || "").toLowerCase();
    const custom = metadata.metadata || {};
    if (!Number.isSafeInteger(size) || size < 1 || size > 10 * 1024 * 1024 ||
        !["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(contentType) ||
        custom.orderId !== expense.orderId || custom.invoiceNumber !== expense.invoiceNumber || custom.uploadedByUid !== expense.createdByUid) return reply("Invoice evidence metadata is invalid", 422);
    const evidenceRef = `gs://${bucket.name}/${expense.evidencePath}`;
    await db.runTransaction(async (tx) => {
      const fresh = await tx.get(expenseRef);
      const data = fresh.data() || {};
      if (!fresh.exists || data.status !== "pending_review" || data.evidencePath !== expense.evidencePath || data.amountPaise !== expense.amountPaise) throw new Error("EXPENSE_CHANGED");
      tx.update(expenseRef, { status: "verified", evidenceRef, evidenceContentType: contentType, evidenceSizeBytes: size, verifiedByUid: verifierUid, verifiedAt: FieldValue.serverTimestamp() });
    });
    return NextResponse.json({ success: true, expenseId, status: "verified" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : code === "EXPENSE_CHANGED" ? 409 : 500;
    return reply(status === 401 ? "Authentication required" : status === 403 ? "Super Admin access required" : status === 409 ? "Expense changed during verification" : "Could not verify expense", status);
  }
}
