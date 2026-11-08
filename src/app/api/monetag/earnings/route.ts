import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";
import { verifyMonetagUser } from "@/lib/server/monetagAdminAuth";
export const runtime = "nodejs";
export async function GET(req: Request) {
  try {
    const uid = await verifyMonetagUser(req);
    const db = getAdminDb();
    const [earningsSnap, paymentsSnap, settingsSnap] = await Promise.all([
      db.collection("monetagEarnings").where("userId", "==", uid).limit(200).get(),
      db.collection("monetagPayments").where("userId", "==", uid).limit(200).get(),
      db.collection("payment_settings").doc("monetagRevenueShare").get(),
    ]);
    const settings = settingsSnap.data() || {};
    const revenueShare = {
      uploaderPercent: Number(settings.uploaderPercent ?? 30),
      sharerPercent: Number(settings.sharerPercent ?? 20),
    };
    const serialize = (doc: FirebaseFirestore.QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate?.()?.toISOString?.() ?? null, paidAt: doc.data().paidAt?.toDate?.()?.toISOString?.() ?? null });
    return NextResponse.json({ success: true, earnings: earningsSnap.docs.map(serialize), payments: paymentsSnap.docs.map(serialize), revenueShare });
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ success: false, message: status === 401 ? "कृपया लॉगिन करें।" : "कमाई और भुगतान का इतिहास लोड नहीं हो सका।" }, { status });
  }
}
