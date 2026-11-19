import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";
import { requireAdmin, isAdminIdentity } from "@/lib/server/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const identity = await requireAdmin(req);
  if (!isAdminIdentity(identity)) return identity;

  try {
    const adminDb = getAdminDb();
    const snapshot = await adminDb.collection("watchEarnVideos")
      .orderBy("createdAt", "desc")
      .limit(250)
      .get();

    const videos = snapshot.docs.map((doc) => {
      const data = doc.data();
      const rawSize = data.sizeBytes ?? data.fileSizeBytes ?? data.fileSize;
      const createdAt = data.createdAt && typeof data.createdAt.toDate === "function"
        ? data.createdAt.toDate().toISOString()
        : null;
      return {
        id: doc.id,
        title: typeof data.title === "string" && data.title.trim() ? data.title.trim() : "Untitled video",
        status: typeof data.status === "string" ? data.status : "unknown",
        active: data.active === true,
        moderation: typeof data.moderation === "string" ? data.moderation : "unknown",
        videoAccess: typeof data.videoAccess === "string" ? data.videoAccess : "free",
        driveFileId: typeof data.driveFileId === "string" ? data.driveFileId : "",
        thumbnailUrl: typeof data.thumbnailUrl === "string" ? data.thumbnailUrl : typeof data.thumbnail === "string" ? data.thumbnail : "",
        sizeBytes: typeof rawSize === "number" && Number.isSafeInteger(rawSize) && rawSize >= 0 ? rawSize : null,
        createdAt,
      };
    });

    return NextResponse.json({ videos }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin media inventory failed:", error);
    return NextResponse.json({ message: "Unable to load media inventory" }, { status: 500 });
  }
}
