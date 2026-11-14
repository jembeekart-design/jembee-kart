import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store, max-age=0", Vary: "Authorization" };

export async function GET(req: Request) {
  const authorization = req.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return NextResponse.json({ success: false, message: "कृपया लॉगिन करें।" }, { status: 401, headers });
  }

  let uid: string;
  try {
    const token = authorization.slice(7).trim();
    if (!token || token.length > 8192) throw new Error("INVALID_TOKEN");
    uid = (await getAdminAuth().verifyIdToken(token, true)).uid;
  } catch {
    return NextResponse.json({ success: false, message: "लॉगिन समाप्त हो गया। दोबारा लॉगिन करें।" }, { status: 401, headers });
  }

  try {
    const snapshot = await getAdminDb()
      .collection("shortsSettlementLedger")
      .where("beneficiaryUid", "==", uid)
      .limit(200)
      .get();

    const serialize = (doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      const data = doc.data();
      return {
        id: doc.id,
        orderId: typeof data.orderId === "string" ? data.orderId : null,
        videoId: typeof data.videoId === "string" ? data.videoId : null,
        entryType: data.entryType,
        amountPaise: Number.isSafeInteger(data.amountPaise) ? data.amountPaise : 0,
        basisAmountPaise: Number.isSafeInteger(data.basisAmountPaise) ? data.basisAmountPaise : 0,
        currency: data.currency === "INR" ? "INR" : null,
        status: typeof data.status === "string" ? data.status : "unknown",
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
      };
    };

    const documents = snapshot.docs.map(serialize).sort((a, b) =>
      String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    // The commission is assigned to beneficiaryUid (the teacher's verified referrer),
    // not to teacherUid. The current commission row is mutable; adjustment rows are
    // audit history and must not be added again to the current total.
    const earnings = documents.filter((item) => item.entryType === "teacher_referral_commission");
    const adjustments = documents.filter((item) => item.entryType === "teacher_referral_commission_adjustment");
    const reconciledCommissionPaise = earnings.reduce((sum, item) =>
      item.status === "pending_settlement" && item.amountPaise > 0 ? sum + item.amountPaise : sum, 0);

    return NextResponse.json({ success: true, earnings, adjustments, reconciledCommissionPaise }, { headers });
  } catch {
    return NextResponse.json({ success: false, message: "Teacher कमाई का रिकॉर्ड अभी लोड नहीं हो सका।" }, { status: 500, headers });
  }
}
