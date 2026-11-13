import { NextResponse } from "next/server";
import { verifyMonetagAdmin } from "@/lib/server/monetagAdminAuth";
import { parseSchoolReview } from "@/schemas/education/school";
import { reviewSchool } from "@/modules/education/schools";
import { firestoreSchoolCatalog } from "@/repositories/education/firestoreSchoolCatalog.server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  try {
    const adminUid = await verifyMonetagAdmin(req);
    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf8") > 4096) return NextResponse.json({ success: false }, { status: 413 });
    let value: unknown;
    try { value = JSON.parse(raw); } catch { return NextResponse.json({ success: false }, { status: 400 }); }
    const input = parseSchoolReview(value);
    if (!input) return NextResponse.json({ success: false, message: "Invalid review request" }, { status: 400 });
    const result = await reviewSchool(firestoreSchoolCatalog, input, adminUid);
    return NextResponse.json({ success: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : code === "NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ success: false, message: status === 404 ? "School not found" : "School review failed" }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
