import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FORMATS = new Set(["short", "long"]);

function safeText(value: unknown, max = 500): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * Public native-app catalogue. Only approved, active, moderation-safe FREE
 * videos are listed. Paid playback remains on the existing entitlement-gated
 * web endpoint and is deliberately not exposed by this catalogue.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const requestedFormat = url.searchParams.get("format") ?? "short";
    if (!FORMATS.has(requestedFormat)) {
      return NextResponse.json({ success: false, error: "Invalid video format" }, { status: 400 });
    }

    const snapshot = await getAdminDb()
      .collection("watchEarnVideos")
      .where("status", "==", "approved")
      .where("active", "==", true)
      .where("moderation", "==", "safe")
      .orderBy("createdAt", "desc")
      // Fetch across both formats before filtering; a 50-document pre-filter
      // could hide every Short/Long item when the newest uploads are the other format.
      .limit(250)
      .get();

    const videos = snapshot.docs.flatMap((document) => {
      const data = document.data();
      if (typeof data.driveFileId !== "string" || !data.driveFileId.trim()) return [];
      // The stream route treats records without videoAccess as legacy-free.
      // Keep those visible, but never list explicitly paid content in this public feed.
      if (data.videoAccess === "paid") return [];
      if (data.videoAccess !== undefined && data.videoAccess !== "free") return [];
      const format = data.videoFormat === "long" ? "long" : "short";
      if (format !== requestedFormat) return [];
      const id = document.id;
      return [{
        id,
        format,
        caption: safeText(data.caption),
        creatorId: safeText(data.userId || data.creatorId, 160),
        username: safeText(data.username, 80),
        displayName: safeText(data.displayName, 120),
        photoURL: safeText(data.photoURL, 1000),
        hashtags: Array.isArray(data.hashtags) ? data.hashtags.filter((tag): tag is string => typeof tag === "string").slice(0, 20) : [],
        durationSeconds: typeof data.durationSeconds === "number" && Number.isFinite(data.durationSeconds) ? data.durationSeconds : null,
        createdAt: typeof data.createdAt === "number" ? data.createdAt : null,
        likes: typeof data.likes === "number" ? data.likes : 0,
        comments: typeof data.comments === "number" ? data.comments : 0,
        views: typeof data.views === "number" ? data.views : 0,
        thumbnailUrl: `/api/shorts/video-thumbnail/${encodeURIComponent(id)}`,
        streamUrl: `/api/shorts/video-stream/${encodeURIComponent(id)}`,
      }];
    }).slice(0, 50);

    return NextResponse.json(
      { success: true, format: requestedFormat, count: videos.length, videos },
      { headers: { "Cache-Control": "private, max-age=15, stale-while-revalidate=30" } }
    );
  } catch (error) {
    console.error("Native app video catalogue failed:", error);
    return NextResponse.json(
      { success: false, error: "Video catalogue temporarily unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
