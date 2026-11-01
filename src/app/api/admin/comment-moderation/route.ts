import { NextResponse } from "next/server";
import { FieldPath, FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

async function verifyAdmin(req: Request) {
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
  return NextResponse.json({ success: false, message: status === 401 ? "Authentication required" : status === 403 ? "Admin access required" : "Comment moderation failed" }, { status });
}

export async function GET(req: Request) {
  try {
    await verifyAdmin(req);
    const cursor = new URL(req.url).searchParams.get("cursor");
    if (cursor && (cursor.length > 1500 || cursor.includes("/"))) return NextResponse.json({ success: false, message: "Invalid cursor" }, { status: 400 });
    let query = getAdminDb().collection("videoCommentReports").where("status", "==", "pending").orderBy(FieldPath.documentId()).limit(101);
    if (cursor) query = query.startAfter(cursor);
    const snap = await query.get();
    const pageDocs = snap.docs.slice(0, 100);
    const reports = pageDocs.map((doc) => {
      const data = doc.data();
      return { id: doc.id, commentId: String(data.commentId || ""), contentId: String(data.contentId || ""), userId: String(data.userId || ""), text: String(data.text || ""), reason: String(data.reason || ""), createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null };
    });
    return NextResponse.json({ success: true, reports, nextCursor: snap.docs.length > 100 ? pageDocs[pageDocs.length - 1]?.id ?? null : null, hasMore: snap.docs.length > 100 });
  } catch (error) { return authError(error); }
}

export async function POST(req: Request) {
  try {
    const adminId = await verifyAdmin(req);
    const raw = await req.text();
    if (new TextEncoder().encode(raw).byteLength > 8192) return NextResponse.json({ success: false, message: "Request body too large" }, { status: 413 });
    const body = JSON.parse(raw);
    const reportId = typeof body.reportId === "string" ? body.reportId.trim() : "";
    const action = body.action;
    if (!reportId || reportId.length > 700 || reportId.includes("/") || (action !== "approve" && action !== "reject")) return NextResponse.json({ success: false, message: "Invalid moderation action" }, { status: 400 });
    const db = getAdminDb();
    const reportRef = db.collection("videoCommentReports").doc(reportId);
    const result = await db.runTransaction(async (tx) => {
      const reportSnap = await tx.get(reportRef);
      if (!reportSnap.exists) return "missing";
      const report = reportSnap.data() || {};
      if (report.status !== "pending" || typeof report.commentId !== "string") return "processed";
      const commentRef = db.collection("comments").doc(report.commentId);
      const commentSnap = await tx.get(commentRef);
      if (!commentSnap.exists || commentSnap.data()?.status !== "pending") return "comment-missing";
      tx.update(commentRef, { status: action === "approve" ? "approved" : "rejected", moderatedBy: adminId, moderatedAt: FieldValue.serverTimestamp() });
      tx.update(reportRef, { status: action === "approve" ? "approved" : "rejected", moderatedBy: adminId, moderatedAt: FieldValue.serverTimestamp() });
      const auditRef = db.collection("commentAuditLogs").doc();
      tx.create(auditRef, { timestamp: FieldValue.serverTimestamp(), adminId, action: action === "approve" ? "approve_comment" : "reject_comment", commentId: report.commentId, contentId: report.contentId || null, reason: report.reason || "pending_review" });
      return "updated";
    });
    if (result === "missing") return NextResponse.json({ success: false, message: "Queue item not found" }, { status: 404 });
    if (result === "comment-missing") return NextResponse.json({ success: false, message: "Comment is missing or no longer pending" }, { status: 409 });
    if (result === "processed") return NextResponse.json({ success: false, message: "Queue item is no longer pending" }, { status: 409 });
    return NextResponse.json({ success: true, status: action === "approve" ? "approved" : "rejected" });
  } catch (error) { return authError(error); }
}
