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
    const userId = String(body.userId || "").trim();
    const transactionReference = String(body.transactionReference || "").trim();
    const amountUsd = Number(body.amountUsd);
    const status = String(body.status || "paid");
    if (!userId || !transactionReference || transactionReference.length > 180 || !Number.isFinite(amountUsd) || amountUsd <= 0 || amountUsd > 100000000 || !["paid", "pending", "failed"].includes(status)) {
      return NextResponse.json({ success: false, message: "भुगतान का विवरण अमान्य है।" }, { status: 400 });
    }
    const id = createHash("sha256").update(transactionReference).digest("hex");
    const ref = getAdminDb().collection("monetagPayments").doc(id);
    await getAdminDb().runTransaction(async tx => {
      const existing = await tx.get(ref);
      if (existing.exists) throw new Error("DUPLICATE");
      tx.create(ref, { userId, transactionReference, amountUsd, currency: "USD", status, recordedBy: adminUid, createdAt: FieldValue.serverTimestamp(), paidAt: status === "paid" ? FieldValue.serverTimestamp() : null });
    });
    return NextResponse.json({ success: true, message: "भुगतान का रिकॉर्ड सुरक्षित हो गया है।" });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : code === "DUPLICATE" ? 409 : 500;
    return NextResponse.json({ success: false, message: status === 401 ? "कृपया लॉगिन करें।" : status === 403 ? "केवल अधिकृत Admin यह कार्य कर सकता है।" : status === 409 ? "यह लेन-देन संदर्भ पहले दर्ज हो चुका है।" : "भुगतान का रिकॉर्ड सुरक्षित नहीं हो सका।" }, { status });
  }
}
