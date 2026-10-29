import { readBoundedJson } from "@/lib/server/readBoundedJson";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

async function verifyAdmin(req: Request): Promise<string> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");

  const token = header.slice("Bearer ".length).trim();
  if (!token) throw new Error("UNAUTHORIZED");

  const decoded = await getAdminAuth().verifyIdToken(token);
  const users = getAdminDb().collection("users");
  const direct = await users.doc(decoded.uid).get();
  let userData = direct.exists ? direct.data() : undefined;

  if (userData?.role !== "admin" && userData?.role !== "super_admin") {
    const fallback = await users.where("uid", "==", decoded.uid).limit(1).get();
    userData = fallback.docs[0]?.data();
  }

  if (userData?.role !== "admin" && userData?.role !== "super_admin") {
    throw new Error("FORBIDDEN");
  }
  return decoded.uid;
}

function authError(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  if (code === "UNAUTHORIZED") {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }
  if (code === "FORBIDDEN") {
    return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
  }
  console.error("Shorts reports admin API error:", error);
  return NextResponse.json({ success: false, message: "Unable to process reports request" }, { status: 500 });
}

export async function GET(req: Request) {
  try {
    await verifyAdmin(req);
    const snapshot = await getAdminDb()
      .collection("videoReports")
      .where("status", "==", "pending")
      .limit(100)
      .get();

    const reports = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        videoId: typeof data.videoId === "string" ? data.videoId : "",
        userId: typeof data.userId === "string" ? data.userId : "",
        reason: typeof data.reason === "string" ? data.reason : "other",
        message: typeof data.message === "string" ? data.message : "",
        status: typeof data.status === "string" ? data.status : "pending",
        createdAt: typeof data.createdAt === "number" ? data.createdAt : null,
      };
    });

    reports.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return NextResponse.json({ success: true, reports });
  } catch (error) {
    return authError(error);
  }
}

export async function POST(req: Request) {
  try {
    const adminId = await verifyAdmin(req);
    let body: unknown;
    const parsedBody = await readBoundedJson(req, 8192);
  if (!parsedBody.ok) {
    return NextResponse.json({ success: false, message: parsedBody.message }, { status: parsedBody.status });
  }
  if (!parsedBody.value || typeof parsedBody.value !== "object" || Array.isArray(parsedBody.value)) {
    return NextResponse.json({ success: false, message: "Request body must be a JSON object" }, { status: 400 });
  }
  body = parsedBody.value as typeof body;

    const input = body as { reportId?: unknown; action?: unknown } | null;
    const reportId = typeof input?.reportId === "string" ? input.reportId.trim() : "";
    const action = typeof input?.action === "string" ? input.action.trim().toLowerCase() : "";

    if (!reportId || reportId.length > 700 || reportId.includes("/")) {
      return NextResponse.json({ success: false, message: "Invalid report ID" }, { status: 400 });
    }
    if (action !== "reviewed" && action !== "dismissed") {
      return NextResponse.json({ success: false, message: "Action must be reviewed or dismissed" }, { status: 400 });
    }

    const ref = getAdminDb().collection("videoReports").doc(reportId);
    const result = await getAdminDb().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return "missing";
      if (snap.data()?.status !== "pending") return "already-processed";

      tx.update(ref, {
        status: action,
        moderatedBy: adminId,
        moderatedAt: FieldValue.serverTimestamp(),
      });
      return "updated";
    });

    if (result === "missing") {
      return NextResponse.json({ success: false, message: "Report not found" }, { status: 404 });
    }
    if (result === "already-processed") {
      return NextResponse.json({ success: false, message: "Report is no longer pending" }, { status: 409 });
    }
    return NextResponse.json({ success: true, status: action });
  } catch (error) {
    return authError(error);
  }
}
