import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";
import { verifyMonetagAdmin } from "@/lib/server/monetagAdminAuth";
import { readBoundedJson } from "@/lib/server/readBoundedJson";

export const runtime = "nodejs";
const DEFAULTS = { uploaderPercent: 30, sharerPercent: 20, updatedAt: null as unknown };

export async function GET(req: Request) {
  try {
    await verifyMonetagAdmin(req);
    const snap = await getAdminDb().collection("payment_settings").doc("monetagRevenueShare").get();
    const data = snap.exists ? snap.data()! : DEFAULTS;
    return NextResponse.json({ success: true, settings: { uploaderPercent: Number(data.uploaderPercent ?? 30), sharerPercent: Number(data.sharerPercent ?? 20), updatedAt: data.updatedAt ?? null } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, message: status === 401 ? "कृपया लॉगिन करें।" : status === 403 ? "इस सेटिंग को बदलने की अनुमति नहीं है।" : "सेटिंग लोड नहीं हो सकी।" }, { status });
  }
}

export async function PUT(req: Request) {
  try {
    const uid = await verifyMonetagAdmin(req);
    const parsedBody = await readBoundedJson(req, 16 * 1024);
    if (!parsedBody.ok) return NextResponse.json({ success: false, message: parsedBody.message }, { status: parsedBody.status });
    if (!parsedBody.value || typeof parsedBody.value !== "object" || Array.isArray(parsedBody.value)) return NextResponse.json({ success: false, message: "A JSON object is required." }, { status: 400 });
    const body = parsedBody.value as Record<string, unknown>;
    const uploaderPercent = Number(body.uploaderPercent);
    const sharerPercent = Number(body.sharerPercent);
    if (!Number.isFinite(uploaderPercent) || !Number.isFinite(sharerPercent) || uploaderPercent < 0 || sharerPercent < 0 || uploaderPercent > 100 || sharerPercent > 100 || uploaderPercent + sharerPercent > 100) {
      return NextResponse.json({ success: false, message: "दोनों प्रतिशत 0 से 100 के बीच हों और उनका कुल योग 100% से अधिक न हो।" }, { status: 400 });
    }
    await getAdminDb().collection("payment_settings").doc("monetagRevenueShare").set({ uploaderPercent, sharerPercent, updatedAt: new Date(), updatedBy: uid }, { merge: true });
    return NextResponse.json({ success: true, settings: { uploaderPercent, sharerPercent } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, message: status === 401 ? "कृपया लॉगिन करें।" : status === 403 ? "इस सेटिंग को बदलने की अनुमति नहीं है।" : "सेटिंग सुरक्षित नहीं हो सकी।" }, { status });
  }
}
