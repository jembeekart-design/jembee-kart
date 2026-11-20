import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeText(value: unknown, max = 160): string {
  return typeof value === "string" ? value.trim().replace(/[\\u0000-\\u001F\\u007F]/g, "").slice(0, max) : "";
}

function safePlaybackUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2048) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    if (!/\\.(m3u8|mpd)$/i.test(url.pathname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const snapshot = await getAdminDb().collection("live_streams").limit(100).get();
    const streams = snapshot.docs.flatMap((document) => {
      const data = document.data();
      const title = safeText(data.title, 120);
      const streamer = safeText(data.streamer, 100);
      const playbackUrl = safePlaybackUrl(data.streamUrl);
      const startTime = safeText(data.startTime, 40);
      if (!title || !streamer || !playbackUrl || !startTime) return [];
      return [{ id: document.id, title, streamer, playbackUrl, startTime }];
    });
    return NextResponse.json({ success: true, streams }, {
      headers: { "Cache-Control": "public, max-age=15, stale-while-revalidate=30", "X-Content-Type-Options": "nosniff" },
    });
  } catch (error) {
    console.error("Public live stream catalogue failed:", error instanceof Error ? error.message : "UNKNOWN");
    return NextResponse.json({ success: false, error: "LIVE_CATALOG_UNAVAILABLE" }, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
