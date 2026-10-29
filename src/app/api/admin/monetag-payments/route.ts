import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/firebase/admin";
import { verifyMonetagAdmin } from "@/lib/server/monetagAdminAuth";
import { readBoundedJson } from "@/lib/server/readBoundedJson";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    const adminUid = await verifyMonetagAdmin(req);
    const parsedBody = await readBoundedJson(req, 16 * 1024);
    if (!parsedBody.ok) return NextResponse.json({ success: false, message: parsedBody.message }, { status: parsedBody.status });
    if (!parsedBody.value || typeof parsedBody.value !== "object" || Array.isArray(parsedBody.value)) return NextResponse.json({ success: false, message: "A JSON object is required." }, { status: 400 });
    const body = parsedBody.value as Record<string, unknown>;
    const userId = String(body.userId || "").trim();
    const transactionReference = String(body.transactionReference || "").trim();
    const amountUsd = Number(body.amountUsd);
    const status = String(body.status || "paid");
    if (!userId || !transactionReference || transactionReference.length > 180 || !Number.isFinite(amountUsd) || amountUsd <= 0 || amountUsd > 100000000 || !["paid", "pending", "failed"].includes(status)) {
      return NextResponse.json({ success: false, message: "भुगतान का विवरण अमान्य है।" }, { status: 400 });
    }
    const db = getAdminDb();
    const userDoc = await db.collection("users").doc(userId).get();
    const userQuery = userDoc.exists ? null : await db.collection("users").where("uid", "==", userId).limit(1).get();
    if (!userDoc.exists && (!userQuery || userQuery.empty)) return NextResponse.json({ success: false, message: "यह प्राप्तकर्ता User ID मौजूद नहीं है।" }, { status: 400 });
    const id = createHash("sha256").update(transactionReference).digest("hex");
    const ref = db.collection("monetagPayments").doc(id);
    await db.runTransaction(async tx => {
      const existing = await tx.get(ref);
      if (existing.exists) throw new Error("DUPLICATE");
      if (status === "paid") {
        const [earnings, payments] = await Promise.all([
          tx.get(db.collection("monetagEarnings").where("userId", "==", userId).where("status", "==", "confirmed")),
          tx.get(db.collection("monetagPayments").where("userId", "==", userId).where("status", "==", "paid")),
        ]);
        const earned = earnings.docs.reduce((sum, doc) => sum + Number(doc.data().amountUsd || 0), 0);
        const paid = payments.docs.reduce((sum, doc) => sum + Number(doc.data().amountUsd || 0), 0);
        if (amountUsd > Math.max(0, earned - paid) + 0.000001) throw new Error("EXCEEDS_BALANCE");
      }
      tx.create(ref, { userId, transactionReference, amountUsd, currency: "USD", status, recordedBy: adminUid, createdAt: FieldValue.serverTimestamp(), paidAt: status === "paid" ? FieldValue.serverTimestamp() : null, note: "Admin-entered record; this endpoint does not transfer money." });
    });
    return NextResponse.json({ success: true, message: "भुगतान का रिकॉर्ड सुरक्षित हो गया है। यह रिकॉर्ड अपने-आप पैसे ट्रांसफ़र नहीं करता।" });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : code === "DUPLICATE" || code === "EXCEEDS_BALANCE" ? 409 : 500;
    const message = code === "EXCEEDS_BALANCE" ? "भुगतान राशि उपलब्ध सत्यापित बकाया कमाई से अधिक है।" : status === 401 ? "कृपया लॉगिन करें।" : status === 403 ? "केवल अधिकृत Admin यह कार्य कर सकता है।" : status === 409 ? "यह लेन-देन दोहराया गया है या बकाया कमाई पर्याप्त नहीं है।" : "भुगतान का रिकॉर्ड सुरक्षित नहीं हो सका।";
    return NextResponse.json({ success: false, message }, { status });
  }
}
