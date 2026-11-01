import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

async function verifyAdmin(req: Request): Promise<string> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const token = header.slice(7).trim();
  if (!token) throw new Error("UNAUTHORIZED");
  let decoded: { uid: string };
  try { decoded = await getAdminAuth().verifyIdToken(token, true); }
  catch { throw new Error("UNAUTHORIZED"); }
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
  if (status === 500) console.error("Refund request API error:", code || "unknown");
  return NextResponse.json(
    { success: false, message: status === 401 ? "Authentication required" : status === 403 ? "Admin access required" : "Refund request operation failed" },
    { status },
  );
}

export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req);
    const snap = await getAdminDb().collection("refund_requests").orderBy("status", "asc").limit(100).get();
    const requests = snap.docs.map((item) => {
      const data = item.data();
      const amount = Number(data.amount);
      return {
        id: item.id,
        userName: typeof data.userName === "string" ? data.userName.slice(0, 120) : "Unknown",
        productName: typeof data.productName === "string" ? data.productName.slice(0, 200) : "Product",
        amount: Number.isFinite(amount) && amount >= 0 ? amount : 0,
        reason: typeof data.reason === "string" ? data.reason.slice(0, 2000) : "",
        status: typeof data.status === "string" ? data.status : "Pending",
        refundExecutionStatus: typeof data.refundExecutionStatus === "string" ? data.refundExecutionStatus : "not_executed",
        providerRefundStatus: typeof data.providerRefundStatus === "string" ? data.providerRefundStatus : null,
        refundArn: typeof data.refundArn === "string" ? data.refundArn : null,
        orderId: typeof data.orderId === "string" ? data.orderId.slice(0, 150) : null,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
      };
    });
    return NextResponse.json({ success: true, requests }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return authError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminId = await verifyAdmin(req);
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 4096) return NextResponse.json({ success: false, message: "Request body too large" }, { status: 413 });
    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf8") > 4096) return NextResponse.json({ success: false, message: "Request body too large" }, { status: 413 });

    let body: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("INVALID_BODY");
      body = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON request" }, { status: 400 });
    }

    const requestId = typeof body.requestId === "string" ? body.requestId.trim() : "";
    const action = body.action;
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    if (!requestId || requestId.length > 700 || requestId.includes("/") || (action !== "approve" && action !== "reject")) {
      return NextResponse.json({ success: false, message: "Invalid refund action" }, { status: 400 });
    }
    if (action === "reject" && reason.length > 500) {
      return NextResponse.json({ success: false, message: "Rejection reason is too long" }, { status: 400 });
    }

    const db = getAdminDb();
    const refundRef = db.collection("refund_requests").doc(requestId);
    const result = await db.runTransaction(async (tx) => {
      const refundSnap = await tx.get(refundRef);
      if (!refundSnap.exists) return "missing";
      const refund = refundSnap.data() || {};
      const currentStatus = String(refund.status || "Pending").toLowerCase();
      if (currentStatus !== "pending" && currentStatus !== "requested") return "processed";
      const amount = Number(refund.amount);
      const amountPaise = Math.round(amount * 100);
      if (
        !Number.isFinite(amount) || amount <= 0 || amount > 10000000 ||
        !Number.isSafeInteger(amountPaise) || Math.abs(amount * 100 - amountPaise) > 1e-7
      ) return "invalid";

      const auditRef = db.collection("refundRequestAuditLogs").doc();
      if (action === "approve") {
        tx.update(refundRef, {
          status: "approved_pending_refund",
          approvedBy: adminId,
          approvedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          refundExecutionStatus: "not_executed",
        });
      } else {
        tx.update(refundRef, {
          status: "Rejected",
          rejectedBy: adminId,
          rejectionReason: reason || "Rejected by admin",
          rejectedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      tx.create(auditRef, {
        refundRequestId: requestId,
        userId: typeof refund.userId === "string" ? refund.userId : null,
        amount,
        action,
        adminId,
        reason: action === "reject" ? (reason || "Rejected by admin") : null,
        createdAt: FieldValue.serverTimestamp(),
      });
      return "updated";
    });

    if (result === "missing") return NextResponse.json({ success: false, message: "Refund request not found" }, { status: 404 });
    if (result === "processed") return NextResponse.json({ success: false, message: "Refund request is no longer pending" }, { status: 409 });
    if (result !== "updated") return NextResponse.json({ success: false, message: "Refund amount is invalid" }, { status: 409 });
    return NextResponse.json({
      success: true,
      status: action === "approve" ? "approved_pending_refund" : "Rejected",
      message: action === "approve" ? "Approved for refund processing. No money has been transferred yet." : "Refund request rejected.",
    });
  } catch (error) {
    return authError(error);
  }
}
