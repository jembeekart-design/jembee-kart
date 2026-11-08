import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

function safeString(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, 500) : "";
}

export async function GET(req: NextRequest) {
  try {
    const videoId = req.nextUrl.searchParams.get("videoId")?.trim() || "";

    if (!videoId || videoId.length > 150) {
      return NextResponse.json(
        { success: false, error: "Invalid video ID" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const videoSnap = await db.collection("watchEarnVideos").doc(videoId).get();

    if (!videoSnap.exists) {
      return NextResponse.json(
        { success: false, error: "Video not found" },
        { status: 404 }
      );
    }

    const video = videoSnap.data() || {};

    if (
      video.status !== "approved" ||
      video.active !== true ||
      video.moderation !== "safe" ||
      video.videoAccess !== "free"
    ) {
      return NextResponse.json(
        { success: false, error: "Creator profile unavailable" },
        { status: 403 }
      );
    }

    const creatorId = safeString(video.userId) || safeString(video.creatorId);

    if (!creatorId) {
      return NextResponse.json({
        success: true,
        creator: {
          documentId: "",
          displayName: safeString(video.displayName),
          username: safeString(video.username),
          photoURL: safeString(video.photoURL) || safeString(video.photo),
        },
      });
    }

    const userSnap = await db.collection("users").doc(creatorId).get();
    const user = userSnap.exists ? userSnap.data() || {} : {};

    const displayName =
      safeString(user.displayName) ||
      safeString(user.name) ||
      [safeString(user.firstName), safeString(user.lastName)].filter(Boolean).join(" ") ||
      safeString(user.username) ||
      safeString(video.displayName) ||
      safeString(video.username);

    return NextResponse.json(
      {
        success: true,
        creator: {
          documentId: creatorId,
          displayName,
          username: safeString(user.username) || safeString(user.userName) || safeString(video.username),
          photoURL:
            safeString(user.photoURL) ||
            safeString(user.photo) ||
            safeString(user.profilePhoto) ||
            safeString(video.photoURL) ||
            safeString(video.photo),
        },
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("[PublicCreatorProfile] Lookup failed:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load creator profile" },
      { status: 500 }
    );
  }
}
