import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";
import {
  isPublicCreatorVideo,
  projectPublicCreatorProfile,
} from "@/modules/creators/profile";

export const runtime = "nodejs";

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
    const videoSnap = await db
      .collection("watchEarnVideos")
      .doc(videoId)
      .get();

    if (!videoSnap.exists) {
      return NextResponse.json(
        { success: false, error: "Video not found" },
        { status: 404 }
      );
    }

    const video = videoSnap.data() || {};

    if (!isPublicCreatorVideo(video)) {
      return NextResponse.json(
        { success: false, error: "Creator profile unavailable" },
        { status: 403 }
      );
    }

    const creatorId =
      typeof video.userId === "string" && video.userId.trim()
        ? video.userId.trim()
        : typeof video.creatorId === "string"
          ? video.creatorId.trim()
          : "";

    if (!creatorId) {
      return NextResponse.json({
        success: true,
        creator: projectPublicCreatorProfile("", {}, video),
      });
    }

    const userSnap = await db.collection("users").doc(creatorId).get();
    const user = userSnap.exists ? userSnap.data() || {} : {};

    return NextResponse.json(
      {
        success: true,
        creator: projectPublicCreatorProfile(creatorId, user, video),
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
