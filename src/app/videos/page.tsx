"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ArrowLeft, PlaySquare, Eye } from "lucide-react";
import FullscreenVideoFeed from "./components/FullscreenVideoFeed";
import { usePublicWatchVideos } from "@/hooks/usePublicWatchVideos";
import { MonetagPlacement } from "@/components/ads/MonetagPlacement";
import { formatVideoDuration, publicCreatorName, publicVideoAge, publicVideoThumbnail } from "@/lib/videos/publicVideoPresentation";
import type { WatchVideo } from "@/lib/videos/watch-earn/fetchWatchVideos";

function LongVideoCard({ video }: { video: WatchVideo }) {
  return (
    <article className="min-w-0">
      <Link href={`/videos?v=${encodeURIComponent(video.id)}`} className="group block overflow-hidden rounded-2xl bg-slate-900">
        <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-black">
          <img src={publicVideoThumbnail(video)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }}/>
          <span className="absolute bottom-2 right-2 rounded bg-black/85 px-2 py-1 text-[11px] font-semibold text-white">{formatVideoDuration(video.durationSeconds) || "Watch video"}</span>
        </div>
      </Link>
      <div className="mt-3 flex gap-3">
        <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-sm font-black text-slate-950">
          <span>{publicCreatorName(video).replace(/^@/, "").slice(0, 1).toUpperCase()}</span>
          {video.photoURL?.startsWith("https://") ? <img src={video.photoURL} alt="" className="absolute inset-0 h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }}/> : null}
        </div>
        <div className="min-w-0 flex-1">
          <Link href={`/videos?v=${encodeURIComponent(video.id)}`} className="line-clamp-2 text-sm font-bold leading-5">{video.caption || "Untitled video"}</Link>
          <p className="mt-1 truncate text-xs text-slate-400">{publicCreatorName(video)}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400"><Eye size={13}/>{Number(video.views || 0).toLocaleString("en-IN")} views · {publicVideoAge(video.createdAt)}</p>
        </div>
      </div>
    </article>
  );
}

function LongVideoWatch({ video }: { video: WatchVideo }) {
  return (
    <main className="min-h-screen bg-[#080d18] pb-12 text-white">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-[#080d18]/95 px-4 py-3 backdrop-blur">
        <Link href="/videos" className="rounded-full bg-white/10 p-2" aria-label="Back to videos"><ArrowLeft size={19}/></Link>
        <Link href="/" className="text-lg font-black">JEMBEE <span className="text-cyan-300">PLAY</span></Link>
      </header>
      <section className="mx-auto max-w-5xl px-3 py-4 sm:px-5">
        <div className="overflow-hidden rounded-xl bg-black">
          <video src={video.video} poster={publicVideoThumbnail(video)} controls playsInline preload="none" className="block aspect-video w-full bg-black" aria-label={video.caption || "JEMBEE PLAY long video"}/>
        </div>
        <h1 className="mt-4 text-xl font-black sm:text-2xl">{video.caption || "Untitled video"}</h1>
        <div className="mt-3 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 font-black text-slate-950">{video.photoURL?.startsWith("https://") ? <img src={video.photoURL} alt="" className="h-full w-full object-cover"/> : publicCreatorName(video).replace(/^@/, "").slice(0, 1).toUpperCase()}</div>
          <div><p className="text-sm font-bold">{publicCreatorName(video)}</p><p className="text-xs text-slate-400">{Number(video.views || 0).toLocaleString("en-IN")} views · {publicVideoAge(video.createdAt)}</p></div>
        </div>
        {video.hashtags.length ? <div className="mt-3 flex flex-wrap gap-2">{video.hashtags.map((tag) => <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs text-cyan-200">#{tag.replace(/^#/, "")}</span>)}</div> : null}
      </section>
    </main>
  );
}

function VideosPageContent() {
  const searchParams = useSearchParams();
  const requestedVideoId = searchParams.get("v");
  const { videos, loading, error } = usePublicWatchVideos();
  const [search, setSearch] = useState("");
  const longVideos = useMemo(() => videos.filter((video) => video.videoFormat === "long"), [videos]);
  const filtered = useMemo(() => longVideos.filter((video) => {
    const value = `${video.caption} ${video.displayName || ""} ${video.username} ${video.music} ${(video.hashtags || []).join(" ")}`.toLowerCase();
    return value.includes(search.toLowerCase().trim());
  }), [longVideos, search]);

  if (requestedVideoId && /^[^/]{1,200}$/.test(requestedVideoId)) {
    if (loading) return <main className="flex min-h-screen items-center justify-center bg-black text-white">Video loading…</main>;
    const selected = videos.find((video) => video.id === requestedVideoId);
    if (selected?.videoFormat === "long") return <LongVideoWatch video={selected}/>;
    return <main className="relative h-[100dvh] min-h-[100svh] w-full overflow-hidden bg-black text-white" aria-label="JEMBEE PLAY Shorts player">
      <div className="absolute left-3 top-3 z-[60]"><Link href="/" className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 text-sm font-semibold text-white backdrop-blur"><ArrowLeft size={16}/> Home</Link></div>
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
      <section className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-7">
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Video library</p>
        <h1 className="mt-1 text-3xl font-black">Long Videos</h1>
        <p className="mt-2 text-sm text-slate-400">Landscape videos approved for public viewing on JEMBEE PLAY.</p>
        <label className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><Search size={18} className="text-slate-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search videos, creators and topics" className="w-full bg-transparent text-sm outline-none"/></label>
        {loading ? <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="aspect-video animate-pulse rounded-xl bg-white/5"/>)}</div> : error ? (
          <p role="status" className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 text-sm text-amber-100">{error}</p>
        ) : filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-10 text-center">
            <p className="font-semibold">अभी कोई approved Long Video उपलब्ध नहीं है।</p>
            <p className="mt-2 text-sm text-slate-400">Upload में Long Video चुनें। Admin approval के बाद यह library में दिखाई देगा।</p>
            <Link href="/videos/upload" className="mt-4 inline-flex rounded-full bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950">Upload Long Video</Link>
          </div>
        ) : <div className="mt-6 grid gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((video) => <LongVideoCard key={video.id} video={video}/>)}</div>}
        <MonetagPlacement placement="videos-after-feed"/>
      </section>
    </main>
  );
}

export default function VideosHomePage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#080d18] p-6 text-white">Loading videos…</main>}><VideosPageContent/></Suspense>;
}
