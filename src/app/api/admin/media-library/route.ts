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
      .limit(250)
      .get();

    const videos = snapshot.docs.map((doc) => {
      const data = doc.data();
      const rawSize = data.sizeBytes ?? data.fileSizeBytes ?? data.fileSize;
      const createdAtValue = data.createdAt;
      const createdAtDate = createdAtValue && typeof createdAtValue.toDate === "function"
        ? createdAtValue.toDate()
        : typeof createdAtValue === "number" && Number.isFinite(createdAtValue)
          ? new Date(createdAtValue)
          : typeof createdAtValue === "string" || createdAtValue instanceof Date
            ? new Date(createdAtValue)
            : null;
      const createdAt = createdAtDate && Number.isFinite(createdAtDate.getTime())
        ? createdAtDate.toISOString()
        : null;
      const driveFileId = typeof data.driveFileId === "string" ? data.driveFileId.trim() : "";
      const publicId = typeof data.publicId === "string" ? data.publicId.trim() : "";
      return {
        id: doc.id,
        title: typeof data.title === "string" && data.title.trim() ? data.title.trim() : "Untitled video",
        status: typeof data.status === "string" ? data.status : "unknown",
        active: data.active === true,
        moderation: typeof data.moderation === "string" ? data.moderation : "unknown",
        videoAccess: typeof data.videoAccess === "string" ? data.videoAccess : "free",
        driveFileId,\n        storageProvider: driveFileId ? "google_drive" : publicId ? "cloudinary" : "unknown",\n        hasStorageAsset: Boolean(driveFileId || publicId),\n        canPreview: Boolean(driveFileId) && data.videoAccess !== "paid",
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
