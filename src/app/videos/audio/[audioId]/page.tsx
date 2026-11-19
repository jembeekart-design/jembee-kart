"use client";

import { useMemo } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Eye, Heart, Music, Play } from "lucide-react";
import { usePublicWatchVideos } from "@/hooks/usePublicWatchVideos";
import { publicCreatorName, publicVideoAge, publicVideoThumbnail } from "@/lib/videos/publicVideoPresentation";

export default function AudioPage() {
  const params = useParams<{ audioId: string }>();
  const audioId = typeof params.audioId === "string" ? params.audioId : "";
  const { videos, loading, error } = usePublicWatchVideos();
  const audioVideos = useMemo(
    () => videos.filter((video) => video.music === audioId),
    [videos, audioId],
  );
  const totalPlays = audioVideos.reduce((sum, video) => sum + Math.max(0, Number(video.views) || 0), 0);
  const totalLikes = audioVideos.reduce((sum, video) => sum + Math.max(0, Number(video.likes) || 0), 0);
  const firstVideo = audioVideos[0];

  return (
    <main className="min-h-screen bg-[#080d18] p-4 pb-12 text-white sm:p-6">
      <div className="mx-auto max-w-5xl">
        <Link href="/shorts" className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16}/> Back to Shorts</Link>
        <section className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-5">
          <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-fuchsia-500/30 to-cyan-400/20">
            {firstVideo ? <img src={publicVideoThumbnail(firstVideo)} alt="" className="h-full w-full object-cover"/> : <Music size={34} className="text-cyan-200"/>}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Audio collection</p>
            <h1 className="mt-1 break-all text-xl font-black">{audioId.startsWith("original-") ? "Original Audio" : audioId || "Audio"}</h1>
            <p className="mt-1 text-sm text-slate-400">Latest public feed videos using this audio on JEMBEE PLAY</p>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-3 gap-2">
          <Stat icon={<Play size={17}/>} label="Feed videos" value={loading ? "—" : audioVideos.length.toLocaleString("en-IN")}/>
          <Stat icon={<Eye size={17}/>} label="Plays (sample)" value={loading ? "—" : totalPlays.toLocaleString("en-IN")}/>
          <Stat icon={<Heart size={17}/>} label="Likes (sample)" value={loading ? "—" : totalLikes.toLocaleString("en-IN")}/>
        </section>

        <div className="mt-7 flex items-center justify-between gap-3"><h2 className="text-lg font-bold">Videos using this audio</h2><span className="text-xs text-slate-500">Latest 50-item public feed sample</span></div>
        {loading ? <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="aspect-[9/16] animate-pulse rounded-xl bg-white/5"/>)}</div>
          : error ? <p role="alert" className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">{error}</p>
          : audioVideos.length === 0 ? <div className="mt-4 rounded-2xl border border-dashed border-white/15 p-10 text-center"><Music className="mx-auto text-slate-500" size={34}/><p className="mt-3 font-semibold">इस audio पर अभी कोई approved public video नहीं है।</p><p className="mt-2 text-sm text-slate-400">नए videos approval के बाद यहाँ दिखाई देंगे।</p></div>
          : <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{audioVideos.map((video) => <Link key={video.id} href={`/videos?v=${encodeURIComponent(video.id)}`} className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]"><div className="relative aspect-[9/16] bg-black"><img src={publicVideoThumbnail(video)} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-[1.02]"/><span className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-1 text-[10px]">{Number(video.views || 0).toLocaleString("en-IN")} views</span></div><div className="p-3"><p className="line-clamp-2 text-sm font-semibold">{video.caption || "Untitled video"}</p><p className="mt-1 truncate text-xs text-slate-400">{publicCreatorName(video)} · {publicVideoAge(video.createdAt)}</p></div></Link>)}</div>}
      </div>
    </main>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3"><div className="flex items-center gap-2 text-xs text-slate-400">{icon}{label}</div><p className="mt-2 text-lg font-black tabular-nums">{value}</p></div>;
}
