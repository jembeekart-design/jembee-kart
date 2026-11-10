"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ArrowLeft, PlaySquare } from "lucide-react";
import FullscreenVideoFeed from "./components/FullscreenVideoFeed";
import { usePublicWatchVideos } from "@/hooks/usePublicWatchVideos";
import { MonetagPlacement } from "@/components/ads/MonetagPlacement";

function videoThumbnail(videoId: string, thumbnail?: string) {
  const candidate = typeof thumbnail === "string" ? thumbnail.trim() : "";
  return candidate.startsWith("https://") ? candidate : `/api/shorts/video-thumbnail/${encodeURIComponent(videoId)}`;
}

function VideosPageContent() {
  const searchParams = useSearchParams();
  const requestedVideoId = searchParams.get("v");
  const { videos, loading, error } = usePublicWatchVideos();
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => videos.filter((video) => {
    const value = `${video.caption} ${video.displayName || ""} ${video.username} ${video.music} ${(video.hashtags || []).join(" ")}`.toLowerCase();
    return value.includes(search.toLowerCase().trim());
  }), [videos, search]);

  if (requestedVideoId && /^[^/]{1,200}$/.test(requestedVideoId)) {
    return <main className="relative h-[100dvh] min-h-[100svh] w-full overflow-hidden bg-black text-white" aria-label="JEMBEE PLAY video player">
      <div className="absolute left-3 top-3 z-[60]"><Link href="/videos" className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 text-sm font-semibold text-white backdrop-blur"><ArrowLeft size={16}/> All videos</Link></div>
      <FullscreenVideoFeed activeTab="foryou" />
    </main>;
  }

  return (
    <main className="min-h-screen bg-[#080d18] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#080d18]/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link href="/" className="text-lg font-black">JEMBEE <span className="text-cyan-300">PLAY</span></Link>
          <Link href="/shorts" className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950"><PlaySquare size={16}/> Shorts</Link>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-4 py-7">
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Video library</p>
        <h1 className="mt-1 text-3xl font-black">Videos</h1>
        <p className="mt-2 text-sm text-slate-400">Approved, safe and free videos from JEMBEE PLAY creators.</p>
        <label className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><Search size={18} className="text-slate-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search videos, creators and topics" className="w-full bg-transparent text-sm outline-none"/></label>
        {loading ? <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="aspect-video animate-pulse rounded-xl bg-white/5"/>)}</div> : error ? (
          <p role="status" className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 text-sm text-amber-100">{error}</p>
        ) : filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-10 text-center">
            <p className="font-semibold">{videos.length === 0 ? "अभी कोई approved free video उपलब्ध नहीं है।" : "कोई matching video नहीं मिला।"}</p>
            <p className="mt-2 text-sm text-slate-400">Approved video publish होने पर वह इस library में दिखाई देगा।</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((video) => <article key={video.id} className="min-w-0">
              <Link href={`/videos?v=${encodeURIComponent(video.id)}`} className="block overflow-hidden rounded-xl bg-[#151d2a]">
                <img src={videoThumbnail(video.id, video.thumbnail)} alt="" loading="lazy" className="aspect-video w-full object-cover" onError={(event) => { event.currentTarget.src = "/file.svg"; }}/>
              </Link>
              <Link href={`/videos?v=${encodeURIComponent(video.id)}`} className="mt-3 block line-clamp-2 text-sm font-bold">{video.caption || "Untitled video"}</Link>
              <p className="mt-1 text-xs text-slate-400">{video.displayName || video.username || "JEMBEE PLAY Creator"} · {Number(video.views || 0).toLocaleString("en-IN")} views</p>
            </article>)}
          </div>
        )}
        <MonetagPlacement placement="videos-after-feed" />
      </section>
    </main>
  );
}

export default function VideosHomePage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#080d18] p-6 text-white">Loading videos…</main>}><VideosPageContent/></Suspense>;
}
