import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function readVideoId(value: unknown): string | null {
  return typeof value === "string" && /^[A-Za-z0-9_-]{1,160}$/.test(value) ? value : null;
}

async function authenticatedUid(req: NextRequest): Promise<string | null> {
  const authorization = req.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice(7).trim();
  if (!token || token.length > 8192) return null;
  const decoded = await getAdminAuth().verifyIdToken(token, true);
  return decoded.uid;
}

function safeVideo(id: string, data: FirebaseFirestore.DocumentData) {
  return {
    id,
    title: typeof data.title === "string" ? data.title.slice(0, 300) : "",
    caption: typeof data.caption === "string" ? data.caption.slice(0, 500) : "",
    thumbnail: typeof data.thumbnail === "string" ? data.thumbnail : "",
    creatorId: typeof data.creatorId === "string" ? data.creatorId : "",
    displayName: typeof data.displayName === "string" ? data.displayName.slice(0, 120) : "",
    username: typeof data.username === "string" ? data.username.slice(0, 80) : "",
    views: Number.isFinite(Number(data.views)) ? Math.max(0, Number(data.views)) : 0,
    createdAt: data.createdAt ?? null,
    videoAccess: "free",
  };
}

export async function GET(req: NextRequest) {
  try {
    const uid = await authenticatedUid(req);
    if (!uid) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const db = getAdminDb();
    const saved = await db.collection("savedWatchVideos").where("userId", "==", uid).limit(200).get();
    const ids = [...new Set(saved.docs.map((doc) => doc.data().videoId).filter((id): id is string => typeof id === "string" && /^[A-Za-z0-9_-]{1,160}$/.test(id)))];
    const videos = await Promise.all(ids.map(async (id) => {
      const snap = await db.collection("watchEarnVideos").doc(id).get();
      if (!snap.exists) return null;
      const data = snap.data();
      if (!data || data.status !== "approved" || data.active !== true || data.moderation !== "safe" || data.videoAccess === "paid") return null;
      return safeVideo(snap.id, data);
    }));
    return NextResponse.json({ success: true, videos: videos.filter(Boolean) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Mobile saved videos load failed:", error);
    return NextResponse.json({ success: false, message: "Saved videos could not be loaded" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const uid = await authenticatedUid(req);
    if (!uid) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const body: unknown = await req.json();
    const videoId = readVideoId((body as { videoId?: unknown } | null)?.videoId);
    if (!videoId) return NextResponse.json({ success: false, message: "Invalid videoId" }, { status: 400 });

    const db = getAdminDb();
    const video = await db.collection("watchEarnVideos").doc(videoId).get();
    const data = video.data();
    if (!video.exists || !data || data.status !== "approved" || data.active !== true || data.moderation !== "safe" || data.videoAccess === "paid") {
      return NextResponse.json({ success: false, message: "Video is unavailable for saving" }, { status: 404 });
    }
    const saveId = `${videoId}_${uid}`;
    await db.collection("savedWatchVideos").doc(saveId).set({
      videoId,
      userId: uid,
      createdAt: Date.now(),
    }, { merge: true });
    return NextResponse.json({ success: true, saved: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Mobile save video failed:", error);
    return NextResponse.json({ success: false, message: "Video could not be saved" }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const uid = await authenticatedUid(req);
    if (!uid) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const videoId = readVideoId(new URL(req.url).searchParams.get("videoId"));
    if (!videoId) return NextResponse.json({ success: false, message: "Invalid videoId" }, { status: 400 });
    const db = getAdminDb();
    const ref = db.collection("savedWatchVideos").doc(`${videoId}_${uid}`);
    const snap = await ref.get();
    if (snap.exists && snap.data()?.userId === uid) await ref.delete();
    return NextResponse.json({ success: true, saved: false }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Mobile unsave video failed:", error);
    return NextResponse.json({ success: false, message: "Video could not be removed" }, { status: 401 });
  }
}
