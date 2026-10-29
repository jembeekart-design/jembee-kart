import { readBoundedJson } from "@/lib/server/readBoundedJson";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/firebase/admin";
import { verifyMonetagAdmin } from "@/lib/server/monetagAdminAuth";

export const runtime = "nodejs";

async function userExists(db: ReturnType<typeof getAdminDb>, uid: string): Promise<boolean> {
  if (!uid) return false;
  const direct = await db.collection("users").doc(uid).get();
  if (direct.exists) return true;
  const byUid = await db.collection("users").where("uid", "==", uid).limit(1).get();
  return !byUid.empty;
}

// Dashboard summary is based only on imported, verified records; it is not a live Monetag API sync.
export async function GET(req: Request) {
  try {
    await verifyMonetagAdmin(req);
    const db = getAdminDb();
    const [importsSnap, earningsSnap, paymentsSnap, sharesSnap, syncsSnap] = await Promise.all([
      db.collection("monetagRevenueImports").orderBy("createdAt", "desc").limit(200).get(),
      db.collection("monetagEarnings").limit(1000).get(),
      db.collection("monetagPayments").limit(1000).get(),
      db.collection("monetagShareAttributions").orderBy("createdAt", "desc").limit(100).get(),
      db.collection("monetagApiSyncs").orderBy("fetchedAt", "desc").limit(10).get(),
    ]);
    const imports = importsSnap.docs.map((doc) => {
      const data = doc.data();
      return { id: doc.id, ...data, createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null };
    });
    const shareAttributions = sharesSnap.docs.map((doc) => { const data = doc.data(); return { id: doc.id, ...data, createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null, lastLandingAt: data.lastLandingAt?.toDate?.()?.toISOString?.() ?? null }; });
    const apiSyncs = syncsSnap.docs.map((doc) => { const data = doc.data(); return { id: doc.id, ...data, fetchedAt: data.fetchedAt?.toDate?.()?.toISOString?.() ?? null }; });
    const earnings = earningsSnap.docs.map((doc) => doc.data());
    const payments = paymentsSnap.docs.map((doc) => doc.data());
    const sum = (items: Array<Record<string, unknown>>, predicate: (item: Record<string, unknown>) => boolean, field: string) =>
      items.reduce((total, item) => predicate(item) ? total + Number(item[field] || 0) : total, 0);
    const grossRevenueUsd = sum(imports, (item) => ["verified", "unallocated"].includes(String(item.status)), "grossRevenueUsd");
    const uploaderEarningsUsd = sum(earnings, (item) => item.role === "uploader" && item.status === "confirmed", "amountUsd");
    const sharerEarningsUsd = sum(earnings, (item) => item.role === "sharer" && item.status === "confirmed", "amountUsd");
    const paidOutUsd = sum(payments, (item) => item.status === "paid", "amountUsd");
    const unallocatedRevenueUsd = sum(imports, (item) => ["verified", "unallocated"].includes(String(item.status)), "unallocatedRevenueUsd");
    const platformRetainedUsd = sum(imports, (item) => ["verified", "unallocated"].includes(String(item.status)), "platformRetainedUsd");
    return NextResponse.json({ success: true, summary: { grossRevenueUsd, uploaderEarningsUsd, sharerEarningsUsd, platformRetainedUsd, unallocatedRevenueUsd, paidOutUsd, importedRecords: importsSnap.size, shareAttributionRecords: sharesSnap.size }, imports, shareAttributions, apiSyncs });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, message: status === 401 ? "कृपया लॉगिन करें।" : status === 403 ? "केवल अधिकृत Admin यह कार्य कर सकता है।" : "Monetag डैशबोर्ड लोड नहीं हो सका।" }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const adminUid = await verifyMonetagAdmin(req);
    const parsedBody = await readBoundedJson(req, 16384);
    if (!parsedBody.ok) {
      return NextResponse.json({ success: false, message: parsedBody.message }, { status: parsedBody.status });
    }
    if (!parsedBody.value || typeof parsedBody.value !== "object" || Array.isArray(parsedBody.value)) {
      return NextResponse.json({ success: false, message: "Request body must be a JSON object" }, { status: 400 });
    }
    const body = parsedBody.value as Record<string, unknown>;
    const externalRecordId = String(body.externalRecordId || "").trim();
    const uploaderUserId = String(body.uploaderUserId || "").trim();
    const sharerUserId = String(body.sharerUserId || "").trim();
    const grossRevenueUsd = Number(body.grossRevenueUsd);
    const period = String(body.period || "").trim();
    if (!externalRecordId || externalRecordId.length > 180 || !period || period.length > 80 || !Number.isFinite(grossRevenueUsd) || grossRevenueUsd <= 0 || grossRevenueUsd > 100000000 || (!uploaderUserId && !sharerUserId) || (uploaderUserId && uploaderUserId === sharerUserId)) {
      return NextResponse.json({ success: false, message: "सत्यापित रिपोर्ट की जानकारी अधूरी या अमान्य है।" }, { status: 400 });
    }
    const db = getAdminDb();
    const [settingsSnap, uploaderExists, sharerExists] = await Promise.all([
      db.collection("payment_settings").doc("monetagRevenueShare").get(),
      uploaderUserId ? userExists(db, uploaderUserId) : Promise.resolve(true),
      sharerUserId ? userExists(db, sharerUserId) : Promise.resolve(true),
    ]);
    if (!uploaderExists || !sharerExists) return NextResponse.json({ success: false, message: "अपलोडर या शेयर करने वाले का User ID मौजूद नहीं है।" }, { status: 400 });
    const settings = settingsSnap.data() || {};
    const uploaderPercent = Number(settings.uploaderPercent ?? 30);
    const sharerPercent = Number(settings.sharerPercent ?? 20);
    if (!Number.isFinite(uploaderPercent) || !Number.isFinite(sharerPercent) || uploaderPercent < 0 || sharerPercent < 0 || uploaderPercent + sharerPercent > 100) return NextResponse.json({ success: false, message: "कमाई के प्रतिशत की सेटिंग सही नहीं है।" }, { status: 409 });
    const key = createHash("sha256").update(externalRecordId).digest("hex");
    const revenueRef = db.collection("monetagRevenueImports").doc(key);
    const result = await db.runTransaction(async (tx) => {
      const existing = await tx.get(revenueRef);
      if (existing.exists) return { duplicate: true as const };
      const uploaderShareUsd = uploaderUserId ? Number((grossRevenueUsd * uploaderPercent / 100).toFixed(6)) : 0;
      const sharerShareUsd = sharerUserId ? Number((grossRevenueUsd * sharerPercent / 100).toFixed(6)) : 0;
      const unallocatedRevenueUsd = Number(((uploaderUserId ? 0 : grossRevenueUsd * uploaderPercent / 100) + (sharerUserId ? 0 : grossRevenueUsd * sharerPercent / 100)).toFixed(6));
      tx.create(revenueRef, { externalRecordId, period, grossRevenueUsd, uploaderUserId: uploaderUserId || null, sharerUserId: sharerUserId || null, uploaderPercent, sharerPercent, uploaderShareUsd, sharerShareUsd, platformRetainedUsd: Number((grossRevenueUsd * Math.max(0, 100 - uploaderPercent - sharerPercent) / 100).toFixed(6)), unallocatedRevenueUsd, currency: "USD", status: "verified", attributionStatus: uploaderUserId && sharerUserId ? "admin_attested" : "partial", importedBy: adminUid, createdAt: FieldValue.serverTimestamp() });
      if (uploaderUserId && uploaderShareUsd > 0) {
        const ref = db.collection("monetagEarnings").doc(`${key}_uploader`);
        tx.create(ref, { userId: uploaderUserId, role: "uploader", externalRecordId, period, grossRevenueUsd, sharePercent: uploaderPercent, amountUsd: uploaderShareUsd, currency: "USD", status: "confirmed", createdAt: FieldValue.serverTimestamp() });
      }
      if (sharerUserId && sharerShareUsd > 0) {
        const ref = db.collection("monetagEarnings").doc(`${key}_sharer`);
        tx.create(ref, { userId: sharerUserId, role: "sharer", externalRecordId, period, grossRevenueUsd, sharePercent: sharerPercent, amountUsd: sharerShareUsd, currency: "USD", status: "confirmed", createdAt: FieldValue.serverTimestamp() });
      }
      return { duplicate: false as const, uploaderShareUsd, sharerShareUsd, platformRetainedUsd: Number((grossRevenueUsd * Math.max(0, 100 - uploaderPercent - sharerPercent) / 100).toFixed(6)), unallocatedRevenueUsd, uploaderPercent, sharerPercent };
    });
    if (result.duplicate) return NextResponse.json({ success: false, duplicate: true, message: "यह रिपोर्ट रिकॉर्ड पहले ही दर्ज किया जा चुका है।" }, { status: 409 });
    return NextResponse.json({ success: true, result, message: "सत्यापित रिपोर्ट दर्ज हो गई है।" });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, message: status === 401 ? "कृपया लॉगिन करें।" : status === 403 ? "केवल अधिकृत Admin यह कार्य कर सकता है।" : "रिपोर्ट दर्ज नहीं हो सकी।" }, { status });
  }
}
