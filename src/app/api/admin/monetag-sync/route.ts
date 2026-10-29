import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/firebase/admin";
import { verifyMonetagAdmin } from "@/lib/server/monetagAdminAuth";
import { readBoundedJson } from "@/lib/server/readBoundedJson";

export const runtime = "nodejs";
const API = "https://api.monetag.com/v5";
const DEFAULT_SITE = "jembee-kart.vercel.app";
const numeric = (v: unknown) => { const n = Number(v ?? 0); return Number.isFinite(n) ? n : 0; };

// Pulls official aggregate statistics. Aggregate stats cannot safely identify individual uploader/sharer earnings.
export async function POST(req: Request) {
  try {
    const adminUid = await verifyMonetagAdmin(req);
    const token = process.env.MONETAG_API_TOKEN;
    if (!token) return NextResponse.json({ success: false, message: "MONETAG_API_TOKEN server environment में सेट नहीं है।" }, { status: 503 });
    const parsed = await readBoundedJson(req, 16 * 1024);
    if (!parsed.ok) return NextResponse.json({ success: false, message: parsed.message }, { status: parsed.status });
    if (!parsed.value || typeof parsed.value !== "object" || Array.isArray(parsed.value)) return NextResponse.json({ success: false, message: "Request body must be an object." }, { status: 400 });
    const body = parsed.value as Record<string, unknown>;
    const dateFrom = typeof body.date_from === "string" ? body.date_from.trim() : "";
    const dateTo = typeof body.date_to === "string" ? body.date_to.trim() : "";
    const validDate = (value: string) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
      const parsedDate = new Date(`${value}T00:00:00.000Z`);
      return Number.isFinite(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === value;
    };
    if (!validDate(dateFrom) || !validDate(dateTo) || dateFrom > dateTo) return NextResponse.json({ success: false, message: "date_from और date_to वैध YYYY-MM-DD तारीखें होनी चाहिए।" }, { status: 400 });
    const dayCount = (Date.parse(`${dateTo}T00:00:00.000Z`) - Date.parse(`${dateFrom}T00:00:00.000Z`)) / 86400000 + 1;
    if (dayCount > 366) return NextResponse.json({ success: false, message: "एक बार में अधिकतम 366 दिनों की रिपोर्ट माँग सकते हैं।" }, { status: 400 });
    const pageSize = Math.min(100, Math.max(1, Math.trunc(numeric(body.page_size) || 100)));
    const siteUrl = String(process.env.MONETAG_SITE_URL || DEFAULT_SITE).trim();
    const headers = { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json", "X-Request-Id": randomUUID() };
    const sitesRes = await fetch(`${API}/pub/sites`, { headers: { Authorization: headers.Authorization, Accept: "application/json", "X-Request-Id": headers["X-Request-Id"] }, cache: "no-store" });
    if (!sitesRes.ok) return NextResponse.json({ success: false, message: `Monetag sites API ने HTTP ${sitesRes.status} दिया। Token/permission जाँचें।` }, { status: sitesRes.status === 401 ? 401 : 502 });
    const sitesData = await sitesRes.json();
    const sites = Array.isArray(sitesData?.sites) ? sitesData.sites : [];
    const site = sites.find((s: { id?: string | number; url?: string }) => String(s?.url || "").replace(/^https?:\/\//, "").replace(/\/$/, "") === siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, ""));
    if (!site?.id) return NextResponse.json({ success: false, message: `Monetag account में ${siteUrl} नाम की site नहीं मिली। MONETAG_SITE_URL जाँचें।` }, { status: 404 });
    const siteId = Number(site.id);
    if (!Number.isSafeInteger(siteId) || siteId <= 0) {
      return NextResponse.json({ success: false, message: "Monetag site ID मान्य नहीं है।" }, { status: 502 });
    }
    const statsRes = await fetch(`${API}/pub/statistics`, { method: "POST", headers, cache: "no-store", body: JSON.stringify({
      date_from: dateFrom,
      date_to: dateTo,
      site_ids: [siteId],
      group_by: ["zone_id"],
      zone_ids: [12065645, 12065644, 12065643, 12065642, 12064903, 12064902, 12064901, 12064900],
      page: 1,
      page_size: pageSize
    }) });
    const statsData = await statsRes.json().catch(() => ({}));
    if (!statsRes.ok) return NextResponse.json({ success: false, message: `Monetag statistics API ने HTTP ${statsRes.status} दिया। Token, permission या रिपोर्ट अवधि जाँचें।` }, { status: statsRes.status === 401 ? 401 : statsRes.status === 429 ? 429 : 502 });
    const allRows: Array<Record<string, unknown>> = Array.isArray(statsData?.result) ? statsData.result : [];
    const rowFieldNames = allRows[0] ? Object.keys(allRows[0]) : [];
    const allowedZoneIds = new Set([
      12065645, 12065644, 12065643, 12065642,
      12064903, 12064902, 12064901, 12064900
    ]);
    const rows = allRows.filter((row) => {
      const rowZoneId = row.zone_id ?? row.zoneId ?? row.zone;
      if (rowZoneId === undefined || rowZoneId === null || rowZoneId === "") {
        return false;
      }
      const zoneId = typeof rowZoneId === "object"
        ? Number((rowZoneId as Record<string, unknown>).id)
        : Number(rowZoneId);
      return Number.isInteger(zoneId) && allowedZoneIds.has(zoneId);
    });
    const totals = rows.reduce((acc: Record<string, number>, row: Record<string, unknown>) => {
      for (const key of ["prerequests", "requests", "impressions", "clicks", "conversions", "subscriptions", "money"]) acc[key] = (acc[key] || 0) + numeric(row[key]);
      return acc;
    }, {});
    const fingerprint = createHash("sha256").update(`${site.id}|${dateFrom}|${dateTo}|${JSON.stringify(rows)}`).digest("hex");
    const db = getAdminDb();
    await db.collection("monetagApiSyncs").doc(fingerprint).set({ provider: "monetag", siteId: String(site.id), siteUrl: String(site.url || siteUrl), dateFrom, dateTo, fetchedAt: FieldValue.serverTimestamp(), fetchedBy: adminUid, rowCount: rows.length, totals, rows, attributionStatus: "aggregate_only_unallocated", note: "Monetag aggregate statistics do not establish per-uploader/per-sharer revenue attribution. No user earnings were generated by this sync." }, { merge: true });
    return NextResponse.json({ success: true, site: { id: String(site.id), url: site.url }, period: { dateFrom, dateTo }, rowCount: rows.length, responseRowCount: allRows.length, responseFields: rowFieldNames, totals, attributionStatus: "aggregate_only_unallocated", message: "Monetag statistics sync सफल हुआ। Aggregate revenue सुरक्षित है; individual user earnings बिना verified attribution के नहीं बाँटी गईं।" });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, message: status === 401 ? "कृपया Admin में लॉगिन करें।" : status === 403 ? "केवल Admin यह कार्य कर सकता है।" : "Monetag sync पूरा नहीं हो सका।" }, { status });
  }
}

export async function GET(req: Request) {
  try {
    await verifyMonetagAdmin(req);
    const snap = await getAdminDb().collection("monetagApiSyncs").orderBy("fetchedAt", "desc").limit(20).get();
    return NextResponse.json({ success: true, syncs: snap.docs.map(d => ({ id: d.id, ...d.data(), fetchedAt: d.data().fetchedAt?.toDate?.()?.toISOString?.() ?? null })) });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, message: status === 401 ? "कृपया लॉगिन करें।" : status === 403 ? "केवल Admin यह कार्य कर सकता है।" : "Sync history लोड नहीं हुई।" }, { status });
  }
}
