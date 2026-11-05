import { NextRequest, NextResponse } from "next/server";
import { FieldPath, FieldValue, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

async function adminUid(req: Request) {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const decoded = await getAdminAuth().verifyIdToken(header.slice(7).trim(), true);
  const db = getAdminDb();
  const direct = await db.collection("users").doc(decoded.uid).get();
  let role = direct.data()?.role;
  if (role !== "admin" && role !== "super_admin") {
    const fallback = await db.collection("users").where("uid", "==", decoded.uid).limit(1).get();
    role = fallback.docs[0]?.data()?.role;
  }
  if (role !== "admin" && role !== "super_admin") throw new Error("FORBIDDEN");
  return decoded.uid;
}

function authError(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500;
  return NextResponse.json({ success: false, message: status === 401 ? "Authentication required" : status === 403 ? "Admin access required" : "Withdrawal request operation failed" }, { status });
}

export async function GET(req: NextRequest) {
  try {
    await adminUid(req);
    const cursor = req.nextUrl.searchParams.get("cursor");
    if (cursor && (cursor.length > 1500 || cursor.includes("/"))) return NextResponse.json({ success: false, message: "Invalid cursor" }, { status: 400 });
    let query = getAdminDb().collection("withdraws").where("status", "==", "pending").orderBy(FieldPath.documentId()).limit(101);
    if (cursor) query = query.startAfter(cursor);
    const snap = await query.get();
    const docs = snap.docs.slice(0, 100);
    const requests = docs.map((doc) => {
      const data = doc.data();
      return { id: doc.id, userId: String(data.userId || ""), userName: String(data.userName || "Unknown"), amount: Number(data.amount || 0), fee: Number(data.fee || 0), payoutAmount: Number(data.payoutAmount ?? data.amount ?? 0), method: String(data.type || data.method || "upi"), account: String(data.upi || data.account || ""), status: String(data.status || "pending"), createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null };
    });
    return NextResponse.json({ success: true, requests, nextCursor: snap.docs.length > 100 ? docs[docs.length - 1]?.id ?? null : null, hasMore: snap.docs.length > 100 });
  } catch (error) { return authError(error); }
}

export async function POST(req: NextRequest) {
  try {
    const adminId = await adminUid(req);
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 8192) return NextResponse.json({ success: false, message: "Request body too large" }, { status: 413 });
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 8192) return NextResponse.json({ success: false, message: "Request body too large" }, { status: 413 });
    let body: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("INVALID_BODY");
      body = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON request" }, { status: 400 });
    }
    const withdrawId = typeof body.withdrawId === "string" ? body.withdrawId.trim() : "";
    const action = body.action;
    const payoutReference = typeof body.payoutReference === "string" ? body.payoutReference.trim() : "";
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    if (!withdrawId || withdrawId.length > 700 || withdrawId.includes("/") || (action !== "approve" && action !== "reject")) return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
    if (action === "approve" && (payoutReference.length < 6 || payoutReference.length > 100)) return NextResponse.json({ success: false, message: "Enter the verified bank/UPI payout reference before approving." }, { status: 400 });
    if (action === "reject" && (reason.length < 3 || reason.length > 500)) return NextResponse.json({ success: false, message: "A rejection reason is required." }, { status: 400 });

    const db = getAdminDb();
    const withdrawRef = db.collection("withdraws").doc(withdrawId);
    const result = await db.runTransaction(async (tx) => {
      const withdrawalSnap = await tx.get(withdrawRef);
      if (!withdrawalSnap.exists) return "missing";
      const withdrawal = withdrawalSnap.data() || {};
      if (withdrawal.status !== "pending") return "processed";
      const uid = typeof withdrawal.userId === "string" ? withdrawal.userId : "";
      const amount = Number(withdrawal.amount);
      if (!uid || !Number.isFinite(amount) || amount <= 0) return "invalid";
      const userRef = db.collection("users").doc(uid);
      const ledgerByWithdrawId = db.collection("user_transactions").where("withdrawId", "==", withdrawId).limit(2);
      const ledgerByReferenceId = db.collection("user_transactions").where("referenceId", "==", withdrawId).limit(2);
      const [userSnap, byWithdrawIdSnap, byReferenceIdSnap] = await Promise.all([tx.get(userRef), tx.get(ledgerByWithdrawId), tx.get(ledgerByReferenceId)]);
      const ledgerDocs = new Map<string, QueryDocumentSnapshot>();
      [...byWithdrawIdSnap.docs, ...byReferenceIdSnap.docs].forEach((doc) => ledgerDocs.set(doc.id, doc));
      if (!userSnap.exists || ledgerDocs.size !== 1) return "ledger-mismatch";
      const ledgerDoc = [...ledgerDocs.values()][0];
      const ledger = ledgerDoc.data();
      const ledgerAmount = Number(ledger.amount);
      if (
        ledger.type !== "withdraw_request" ||
        ledger.status !== "pending" ||
        ledger.userId !== uid ||
        ledger.withdrawId !== withdrawId ||
        ledger.referenceId !== withdrawId ||
        !Number.isFinite(ledgerAmount) ||
        Math.round(ledgerAmount * 100) !== Math.round(amount * 100)
      ) return "ledger-mismatch";
      const user = userSnap.data() || {};
      const balance = Number(user.walletBalance || 0);
      const pending = Number(user.pendingWithdrawal || 0);
      if (!Number.isFinite(balance) || !Number.isFinite(pending) || pending < amount) return "wallet-mismatch";
      const ledgerRef = ledgerDoc.ref;
      const auditRef = db.collection("withdrawalAuditLogs").doc();
      if (action === "approve") {
        tx.update(withdrawRef, { status: "approved", payoutReference, approvedBy: adminId, approvedAt: FieldValue.serverTimestamp(), processedAt: FieldValue.serverTimestamp() });
        tx.update(ledgerRef, { status: "completed", payoutReference, processedBy: adminId, processedAt: FieldValue.serverTimestamp() });
        tx.update(userRef, { pendingWithdrawal: pending - amount, updatedAt: FieldValue.serverTimestamp() });
      } else {
        tx.update(withdrawRef, { status: "rejected", rejectionReason: reason, rejectedBy: adminId, rejectedAt: FieldValue.serverTimestamp() });
        tx.update(ledgerRef, { status: "rejected", rejectionReason: reason, processedBy: adminId, processedAt: FieldValue.serverTimestamp() });
        tx.update(userRef, { walletBalance: balance + amount, pendingWithdrawal: pending - amount, updatedAt: FieldValue.serverTimestamp() });
      }
      tx.create(auditRef, { withdrawId, userId: uid, amount, action, adminId, payoutReference: action === "approve" ? payoutReference : null, reason: action === "reject" ? reason : null, createdAt: FieldValue.serverTimestamp() });
      return "updated";
    });
    if (result === "missing") return NextResponse.json({ success: false, message: "Withdrawal not found" }, { status: 404 });
    if (result === "processed") return NextResponse.json({ success: false, message: "Withdrawal is no longer pending" }, { status: 409 });
    if (result !== "updated") return NextResponse.json({ success: false, message: "Wallet or ledger consistency check failed; no changes were made." }, { status: 409 });
    return NextResponse.json({ success: true, status: action === "approve" ? "approved" : "rejected" });
  } catch (error) { return authError(error); }
}
