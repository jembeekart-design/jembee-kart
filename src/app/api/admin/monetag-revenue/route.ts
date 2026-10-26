import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/firebase/admin";
import { verifyMonetagAdmin } from "@/lib/server/monetagAdminAuth";

export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    const adminUid = await verifyMonetagAdmin(req);
    const body = await req.json();
    const externalRecordId = String(body.externalRecordId || "").trim();
    const uploaderUserId = String(body.uploaderUserId || "").trim();
    const sharerUserId = String(body.sharerUserId || "").trim();
    const grossRevenueUsd = Number(body.grossRevenueUsd);
    const period = String(body.period || "").trim();
    if (!externalRecordId || externalRecordId.length > 180 || !period || period.length > 80 || !Number.isFinite(grossRevenueUsd) || grossRevenueUsd <= 0 || grossRevenueUsd > 100000000 || (!uploaderUserId && !sharerUserId)) {
      return NextResponse.json({ success: false, message: "सत्यापित रिपोर्ट की जानकारी अधूरी या अमान्य है।" }, { status: 400 });
    }
    const db = getAdminDb();
    const settingsSnap = await db.collection("payment_settings").doc("monetagRevenueShare").get();
    const settings = settingsSnap.data() || {};
    const uploaderPercent = Number(settings.uploaderPercent ?? 30);
    const sharerPercent = Number(settings.sharerPercent ?? 20);
    if (uploaderPercent + sharerPercent > 100) return NextResponse.json({ success: false, message: "कमाई के प्रतिशत की सेटिंग सही नहीं है।" }, { status: 409 });
    const key = createHash("sha256").update(externalRecordId).digest("hex");
    const revenueRef = db.collection("monetagRevenueImports").doc(key);
    const result = await db.runTransaction(async (tx) => {
      const existing = await tx.get(revenueRef);
      if (existing.exists) return { duplicate: true };
      const uploaderShareUsd = uploaderUserId ? Number((grossRevenueUsd * uploaderPercent / 100).toFixed(6)) : 0;
      const sharerShareUsd = sharerUserId ? Number((grossRevenueUsd * sharerPercent / 100).toFixed(6)) : 0;
      tx.create(revenueRef, { externalRecordId, period, grossRevenueUsd, uploaderUserId: uploaderUserId || null, sharerUserId: sharerUserId || null, uploaderPercent, sharerPercent, uploaderShareUsd, sharerShareUsd, currency: "USD", status: "verified", importedBy: adminUid, createdAt: FieldValue.serverTimestamp() });
      if (uploaderUserId && uploaderShareUsd > 0) {
        const ref = db.collection("monetagEarnings").doc(`${key}_uploader`);
        tx.create(ref, { userId: uploaderUserId, role: "uploader", externalRecordId, period, grossRevenueUsd, sharePercent: uploaderPercent, amountUsd: uploaderShareUsd, currency: "USD", status: "confirmed", createdAt: FieldValue.serverTimestamp() });
      }
      if (sharerUserId && sharerShareUsd > 0) {
        const ref = db.collection("monetagEarnings").doc(`${key}_sharer`);
        tx.create(ref, { userId: sharerUserId, role: "sharer", externalRecordId, period, grossRevenueUsd, sharePercent: sharerPercent, amountUsd: sharerShareUsd, currency: "USD", status: "confirmed", createdAt: FieldValue.serverTimestamp() });
      }
      return { duplicate: false, uploaderShareUsd, sharerShareUsd, uploaderPercent, sharerPercent };
    });
    if (result.duplicate) return NextResponse.json({ success: false, duplicate: true, message: "यह रिपोर्ट रिकॉर्ड पहले ही दर्ज किया जा चुका है।" }, { status: 409 });
    return NextResponse.json({ success: true, result, message: "सत्यापित रिपोर्ट दर्ज हो गई है।" });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, message: status === 401 ? "कृपया लॉगिन करें।" : status === 403 ? "केवल अधिकृत Admin यह कार्य कर सकता है।" : "रिपोर्ट दर्ज नहीं हो सकी।" }, { status });
  }
}
