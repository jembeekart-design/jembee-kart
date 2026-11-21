import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 40;

function safeString(value: unknown, max = 500): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function safeCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : 0;
}

function safeTags(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((tag): tag is string => typeof tag === "string").slice(0, 12).map((tag) => tag.trim().slice(0, 40)).filter(Boolean)
    : [];
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const requestedLimit = Number(url.searchParams.get("limit") || PAGE_SIZE);
    const pageSize = Number.isInteger(requestedLimit)
      ? Math.min(MAX_PAGE_SIZE, Math.max(1, requestedLimit))
      : PAGE_SIZE;
    const cursor = safeString(url.searchParams.get("cursor"), 200);

    const db = getAdminDb();
    let videosQuery = db.collection("watchEarnVideos")
      .where("status", "==", "approved")
      .where("active", "==", true)
      .where("moderation", "==", "safe")
      .where("videoAccess", "==", "free")
      .orderBy("createdAt", "desc")
      .limit(pageSize + 1);

    if (cursor) {
      const cursorSnapshot = await db.collection("watchEarnVideos").doc(cursor).get();
      if (!cursorSnapshot.exists) {
        return NextResponse.json({ success: false, error: "INVALID_CURSOR" }, { status: 400 });
      }
      const cursorData = cursorSnapshot.data() || {};
      if (cursorData.status !== "approved" || cursorData.active !== true || cursorData.moderation !== "safe" || cursorData.videoAccess !== "free") {
        return NextResponse.json({ success: false, error: "INVALID_CURSOR" }, { status: 400 });
      }
      videosQuery = videosQuery.startAfter(cursorSnapshot);
    }

    const snapshot = await videosQuery.get();
    const hasMore = snapshot.docs.length > pageSize;
    const pageDocs = snapshot.docs.slice(0, pageSize);
    const creatorIds = [...new Set(pageDocs.map((item) => safeString(item.data().userId || item.data().creatorId, 160)).filter(Boolean))];
    const creatorProfiles = new Map<string, Record<string, unknown>>();
    await Promise.all(creatorIds.map(async (uid) => {
      try {
        const profile = await db.collection("users").doc(uid).get();
        if (profile.exists) creatorProfiles.set(uid, profile.data() || {});
      } catch {
        // Keep public video metadata as a safe fallback when a profile is unavailable.
      }
    }));
    const videos = pageDocs.map((doc) => {
      const data = doc.data();
      const creatorId = safeString(data.userId || data.creatorId, 160);
      const profile = creatorProfiles.get(creatorId) || {};
      const rawUsername = safeString(data.username || profile.username || profile.userName || profile.handle, 80);
      const username = rawUsername.includes("@") ? "" : rawUsername;
      const rawDisplayName = safeString(data.displayName || profile.displayName || profile.name || profile.fullName, 120);
      const displayName = rawDisplayName.includes("@")
        ? (username || "JEMBEE PLAY Creator")
        : (rawDisplayName || username || "JEMBEE PLAY Creator");
      const photoURL = safeString(data.photoURL || data.photo || profile.photoURL || profile.photoUrl || profile.photo || profile.avatarUrl || profile.profileImage, 2048);
      return {
        id: doc.id,
        creatorId,
        username,
        displayName,
        photoURL,
        caption: safeString(data.caption),
        hashtags: safeTags(data.hashtags),
        music: safeString(data.music, 160),
        verified: data.verified === true,
        thumbnailUrl: `/api/shorts/video-thumbnail/${encodeURIComponent(doc.id)}`,
        playbackUrl: `/api/shorts/video-stream/${encodeURIComponent(doc.id)}`,
        likes: safeCount(data.likes),
        comments: safeCount(data.comments),
        shares: safeCount(data.shares),
        views: safeCount(data.views),
        sponsor: data.sponsor === true,
        videoAccess: "free" as const,
        videoFormat: data.videoFormat === "long" ? "long" as const : "short" as const,
        durationSeconds: typeof data.durationSeconds === "number" && Number.isFinite(data.durationSeconds) && data.durationSeconds > 0 ? data.durationSeconds : null,
        createdAt: safeCount(data.createdAt),
      };
    });

    return NextResponse.json({
      success: true,
      videos,
      page: {
        limit: pageSize,
        hasMore,
        nextCursor: hasMore ? pageDocs[pageDocs.length - 1]?.id || null : null,
      },
    }, {
      headers: {
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Public video catalog failed:", error instanceof Error ? error.message : "UNKNOWN");
    return NextResponse.json(
      { success: false, error: "VIDEO_CATALOG_UNAVAILABLE" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
