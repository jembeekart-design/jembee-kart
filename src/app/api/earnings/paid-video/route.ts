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
      .limit(500)
      .get();
    const rows = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        orderId: typeof data.orderId === "string" ? data.orderId : null,
        videoId: typeof data.videoId === "string" ? data.videoId : null,
        entryType: data.entryType,
        amountPaise: Number.isSafeInteger(data.amountPaise) ? data.amountPaise : 0,
        status: typeof data.status === "string" ? data.status : "unknown",
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
      };
    }).sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

    const creatorEarnings = rows.filter((row) => row.entryType === "creator_share" || row.entryType === "creator_share_reversal");
    const sharerEarnings = rows.filter((row) => row.entryType === "sharer_share" || row.entryType === "sharer_share_reversal");
    const sum = (items: typeof rows) => items.reduce((total, item) => total + item.amountPaise, 0);

    return NextResponse.json({
      success: true,
      creatorEarnings,
      sharerEarnings,
      creatorNetPaise: sum(creatorEarnings),
      sharerNetPaise: sum(sharerEarnings),
    }, { headers });
  } catch {
    return NextResponse.json({ success: false, message: "Paid-video earnings अभी लोड नहीं हो सकीं।" }, { status: 500, headers });
  }
}
