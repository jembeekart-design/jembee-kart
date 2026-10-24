import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function verifyAdmin(req: Request): Promise<string> {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const token = authHeader.slice(7).trim();
  if (!token) throw new Error("UNAUTHORIZED");
  const decoded = await getAdminAuth().verifyIdToken(token);
  const db = getAdminDb();
  const direct = await db.collection("users").doc(decoded.uid).get();
  let data = direct.exists ? direct.data() : undefined;
  if (data?.role !== "admin" && data?.role !== "super_admin") {
    const fallback = await db.collection("users").where("uid", "==", decoded.uid).limit(1).get();
    data = fallback.docs[0]?.data();
  }
  if (data?.role !== "admin" && data?.role !== "super_admin") throw new Error("FORBIDDEN");
  return decoded.uid;
}

function parseDate(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : value;
}

function splitRevenue(revenue: number) {
  // Round the sharer and uploader pools to paise; platform receives the remainder
  // so the three amounts always add up exactly to the imported net revenue.
  const sharer = Math.round(revenue * 20) / 100;
  const uploader = Math.round(revenue * 30) / 100;
  const platform = Math.round((revenue - sharer - uploader) * 100) / 100;
  return { sharerPool: sharer, uploaderPool: uploader, platformPool: platform };
}

export async function GET(req: Request) {
  try {
    await verifyAdmin(req);
    const url = new URL(req.url);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 30)));
    const snap = await getAdminDb().collection("monetagRevenueReports").orderBy("reportDate", "desc").limit(limit).get();
    return NextResponse.json({ success: true, reports: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, message: status === 401 ? "Unauthorized" : status === 403 ? "Admin access required" : "Unable to load Monetag revenue reports" }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const adminId = await verifyAdmin(req);
    const body = await req.json();
    const reportDate = parseDate(body?.reportDate);
    const revenue = Number(body?.netRevenueInr);
    const sourceReportId = typeof body?.sourceReportId === "string" ? body.sourceReportId.trim() : "";
    const siteId = typeof body?.siteId === "string" ? body.siteId.trim() : "jembeevideo";

    if (!reportDate) return NextResponse.json({ success: false, message: "reportDate must be YYYY-MM-DD" }, { status: 400 });
    if (!Number.isFinite(revenue) || revenue < 0 || revenue > 1000000000) return NextResponse.json({ success: false, message: "netRevenueInr must be a valid non-negative INR amount" }, { status: 400 });
    if (!siteId || siteId.length > 100 || !/^[a-zA-Z0-9_-]+$/.test(siteId)) return NextResponse.json({ success: false, message: "Invalid siteId" }, { status: 400 });
    if (sourceReportId.length > 180) return NextResponse.json({ success: false, message: "sourceReportId is too long" }, { status: 400 });

    const db = getAdminDb();
    const reportId = `${siteId}_${reportDate}`;
    const ref = db.collection("monetagRevenueReports").doc(reportId);
    const pools = splitRevenue(Math.round(revenue * 100) / 100);
    const payload = {
      provider: "monetag",
      source: "admin_dashboard_import",
      siteId,
      reportDate,
      currency: "INR",
      netRevenueInr: Math.round(revenue * 100) / 100,
      splitPercent: { sharer: 20, uploader: 30, platform: 50 },
      ...pools,
      sourceReportId: sourceReportId || null,
      status: "reported_total_not_user_attributed",
      importedBy: adminId,
      importedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await db.runTransaction(async (tx) => {
      const existing = await tx.get(ref);
      if (existing.exists && existing.get("sourceReportId") && sourceReportId && existing.get("sourceReportId") !== sourceReportId) {
        throw new Error("REPORT_CONFLICT");
      }
      tx.set(ref, payload, { merge: true });
    });
    return NextResponse.json({ success: true, reportId, reportDate, netRevenueInr: payload.netRevenueInr, ...pools, splitPercent: payload.splitPercent, status: payload.status, note: "This stores the actual site-level report total and the three pools. It does not claim per-user attribution; individual payouts require verified attribution rules and must be reconciled against this report." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (message === "FORBIDDEN") return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
    if (message === "REPORT_CONFLICT") return NextResponse.json({ success: false, message: "A different source report is already recorded for this site and date. Review it before replacing the record." }, { status: 409 });
    console.error("Monetag revenue import failed", error);
    return NextResponse.json({ success: false, message: "Unable to save Monetag revenue report" }, { status: 500 });
  }
}
