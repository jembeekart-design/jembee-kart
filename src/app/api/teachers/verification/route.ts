import { NextResponse } from "next/server";
import { getAdminAuth } from "@/firebase/admin";
import { parseTeacherApplication } from "@/schemas/teachers/application";
import { getTeacherApplication, submitTeacherApplication } from "@/repositories/teachers/firestoreTeacherVerification.server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };
async function authenticatedUid(req: Request) {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  try { return (await getAdminAuth().verifyIdToken(header.slice(7).trim())).uid; } catch { throw new Error("UNAUTHORIZED"); }
}
export async function GET(req: Request) {
  try { const uid = await authenticatedUid(req); return NextResponse.json({ success: true, application: await getTeacherApplication(uid) }, { headers: noStore }); }
  catch (e) { return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401, headers: noStore }); }
}
export async function POST(req: Request) {
  try {
    const uid = await authenticatedUid(req);
    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf8") > 8192) return NextResponse.json({ success: false, message: "Request too large" }, { status: 413, headers: noStore });
    let body: unknown; try { body = JSON.parse(raw); } catch { return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400, headers: noStore }); }
    const input = parseTeacherApplication(body);
    if (!input) return NextResponse.json({ success: false, message: "Invalid teacher application" }, { status: 400, headers: noStore });
    const result = await submitTeacherApplication(uid, input);
    return NextResponse.json({ success: true, ...result }, { status: 201, headers: noStore });
  } catch (e) { const code = e instanceof Error ? e.message : ""; const status = code === "UNAUTHORIZED" ? 401 : code === "APPLICATION_NOT_ALLOWED" ? 409 : 500; return NextResponse.json({ success: false, message: status === 409 ? "An application is already pending or verified." : status === 401 ? "Unauthorized" : "Unable to submit application" }, { status, headers: noStore }); }
}
