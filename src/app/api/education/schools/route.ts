import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";
import { verifyMonetagAdmin } from "@/lib/server/monetagAdminAuth";
import { parseCreateSchool, SCHOOL_BOARDS } from "@/schemas/education/school";
import { submitSchool } from "@/modules/education/schools";
import { firestoreSchoolCatalog } from "@/repositories/education/firestoreSchoolCatalog.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };
const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
const errorResponse = (error: unknown) => {
  const code = error instanceof Error ? error.message : "UNKNOWN";
  const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500;
  return NextResponse.json({ success: false, message: status === 401 ? "कृपया Admin के रूप में लॉगिन करें।" : status === 403 ? "इस कार्य के लिए Admin अनुमति आवश्यक है।" : "School catalog उपलब्ध नहीं है।" }, { status, headers: noStore });
};

// Public clients receive approved schools only. Draft and rejected records never leak.
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const board = clean(url.searchParams.get("board"), 32);
    if (board && !SCHOOL_BOARDS.includes(board as (typeof SCHOOL_BOARDS)[number])) return NextResponse.json({ success: false, message: "Invalid board" }, { status: 400, headers: noStore });
    const header = req.headers.get("authorization");
    const isAdmin = header?.startsWith("Bearer ") ? (await verifyMonetagAdmin(req), true) : false;
    const db = getAdminDb();
    const snapshot = await db.collection("educationSchools").limit(500).get();
    const schools: Array<{ id: string; status?: unknown; board?: unknown; name?: unknown }> = snapshot.docs.map<{ id: string; status?: unknown; board?: unknown; name?: unknown }>((item) => ({ id: item.id, ...item.data() }))
      .filter((item) => (isAdmin || item.status === "approved") && (!board || item.board === board))
      .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
    return NextResponse.json({ success: true, schools }, { headers: noStore });
  } catch (error) { return errorResponse(error); }
}

export async function POST(req: Request) {
  try {
    const adminUid = await verifyMonetagAdmin(req);
    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf8") > 8192) return NextResponse.json({ success: false, message: "Request too large" }, { status: 413, headers: noStore });
    let value: unknown;
    try { value = JSON.parse(raw); } catch { return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400, headers: noStore }); }
    const input = parseCreateSchool(value);
    if (!input) return NextResponse.json({ success: false, message: "School name, valid board, city and state are required." }, { status: 400, headers: noStore });
    const result = await submitSchool(firestoreSchoolCatalog, input, adminUid);
    if (!result.created) return NextResponse.json({ success: false, duplicate: true, message: "यह School पहले से मौजूद है।" }, { status: 409, headers: noStore });
    return NextResponse.json({ success: true, id: result.id, status: "pending", message: "School request सुरक्षित रूप से दर्ज हुई। Approval के बाद यह public catalog में दिखेगी।" }, { status: 201, headers: noStore });
  } catch (error) { return errorResponse(error); }
}
