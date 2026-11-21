import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value: unknown, max = 160): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function GET(request: Request) {
  const queryText = clean(new URL(request.url).searchParams.get("q"), 80).toLocaleLowerCase();
  if (queryText.length < 2) {
    return NextResponse.json({ success: true, creators: [], videos: [] }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const db = getAdminDb();
    const [usersSnapshot, videosSnapshot] = await Promise.all([
      db.collection("users").limit(150).get(),
      db.collection("watchEarnVideos")
        .where("status", "==", "approved")
        .where("active", "==", true)
        .where("moderation", "==", "safe")
        .where("videoAccess", "==", "free")
        .orderBy("createdAt", "desc")
        .limit(80)
        .get(),
    ]);

    const creators = usersSnapshot.docs.flatMap((doc) => {
      const data = doc.data();
      const name = clean(data.displayName || data.name || data.fullName);
      const username = clean(data.username || data.userName || data.handle).replace(/^@/, "");
      if (!`${name} ${username}`.toLocaleLowerCase().includes(queryText)) return [];
      return [{
        id: doc.id,
        name: name || username || "Creator",
        username,
        photoURL: clean(data.photoURL || data.photoUrl || data.avatarUrl || data.profileImage, 2048),
      }];
    }).slice(0, 20);

    const videos = videosSnapshot.docs.flatMap((doc) => {
      const data = doc.data();
      const caption = clean(data.caption, 500);
      const hashtags = Array.isArray(data.hashtags) ? data.hashtags.filter((tag): tag is string => typeof tag === "string").slice(0, 12) : [];
      if (!`${caption} ${hashtags.join(" ")}`.toLocaleLowerCase().includes(queryText)) return [];
      return [{
        id: doc.id,
        caption,
        thumbnail: `/api/shorts/video-thumbnail/${encodeURIComponent(doc.id)}`,
        videoFormat: data.videoFormat === "long" ? "long" : "short",
      }];
    }).slice(0, 30);

    return NextResponse.json({ success: true, creators, videos }, {
      headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
    });
  } catch (error) {
    console.error("[AppSearch] Search failed:", error);
    return NextResponse.json({ success: false, message: "Search is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
