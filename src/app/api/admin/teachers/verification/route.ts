import { NextResponse } from "next/server";
import { verifyMonetagAdmin } from "@/lib/server/monetagAdminAuth";
import { parseTeacherDecision } from "@/schemas/teachers/application";
import { listPendingTeacherApplications, reviewTeacherApplication } from "@/repositories/teachers/firestoreTeacherVerification.server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };
export async function GET(req: Request) {
  try { await verifyMonetagAdmin(req); return NextResponse.json({ success: true, applications: await listPendingTeacherApplications() }, { headers: noStore }); }
  catch (e) { const code = e instanceof Error ? e.message : ""; return NextResponse.json({ success: false, message: "Admin authorization required" }, { status: code === "UNAUTHORIZED" ? 401 : 403, headers: noStore }); }
}
export async function POST(req: Request) {
  try {
    const reviewerUid = await verifyMonetagAdmin(req);
    const raw = await req.text(); if (Buffer.byteLength(raw, "utf8") > 4096) return NextResponse.json({ success: false }, { status: 413, headers: noStore });
    let body: unknown; try { body = JSON.parse(raw); } catch { return NextResponse.json({ success: false }, { status: 400, headers: noStore }); }
    const input = parseTeacherDecision(body); if (!input) return NextResponse.json({ success: false, message: "Invalid review request" }, { status: 400, headers: noStore });
    const result = await reviewTeacherApplication(input, reviewerUid);
    return NextResponse.json({ success: true, ...result }, { headers: noStore });
  } catch (e) { const code = e instanceof Error ? e.message : ""; const status = code === "UNAUTHORIZED" ? 401 : code === "NOT_FOUND" ? 404 : code === "NOT_PENDING" ? 409 : 403; return NextResponse.json({ success: false, message: "Teacher review failed" }, { status, headers: noStore }); }
}
