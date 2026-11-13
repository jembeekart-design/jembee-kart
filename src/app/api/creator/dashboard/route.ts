import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { getTeacherApplication } from "@/repositories/teachers/firestoreTeacherVerification.server";
import { projectCreatorDashboard, projectTeacherDashboard } from "@/modules/creators/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };

async function authenticatedUid(req: Request) {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const token = header.slice(7).trim();
  if (!token || token.length > 8192) throw new Error("UNAUTHORIZED");
  try { return (await getAdminAuth().verifyIdToken(token, true)).uid; }
  catch { throw new Error("UNAUTHORIZED"); }
}

export async function GET(req: Request) {
  try {
    const uid = await authenticatedUid(req);
    const db = getAdminDb();
    // Existing upload paths have used both userId and creatorId; read both without changing stored documents.
    const [userVideos, creatorVideos] = await Promise.all([
      db.collection("watchEarnVideos").where("userId", "==", uid).limit(100).get(),
      db.collection("watchEarnVideos").where("creatorId", "==", uid).limit(100).get(),
    ]);
    const unique = new Map<string, { id: string; status?: unknown; moderationStatus?: unknown; visibility?: unknown; createdAt?: unknown }>();
    for (const doc of [...userVideos.docs, ...creatorVideos.docs]) unique.set(doc.id, { id: doc.id, ...doc.data() });
    const videos = [...unique.values()].slice(0, 100);
    const teacherApplication = await getTeacherApplication(uid);
    return NextResponse.json({
      success: true,
      creator: projectCreatorDashboard(videos),
      teacher: projectTeacherDashboard(teacherApplication),
    }, { headers: noStore });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "UNAUTHORIZED";
    return NextResponse.json({ success: false, message: unauthorized ? "Unauthorized" : "Unable to load creator dashboard" }, {
      status: unauthorized ? 401 : 500,
      headers: noStore,
    });
  }
}
