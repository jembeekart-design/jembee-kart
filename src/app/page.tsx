"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, Menu, Home, Compass, PlaySquare, History, GraduationCap, PlusSquare, Bell, UserCircle, ThumbsUp, BookOpen, ChevronRight, Eye, type LucideIcon } from "lucide-react";
import { usePublicWatchVideos } from "@/hooks/usePublicWatchVideos";
import { MonetagPlacement } from "@/components/ads/MonetagPlacement";
import { formatVideoDuration, publicCreatorName, publicVideoAge, publicVideoThumbnail } from "@/lib/videos/publicVideoPresentation";
import type { WatchVideo } from "@/lib/videos/watch-earn/fetchWatchVideos";
import "./home.css";

const chips = ["All", "Education", "Music", "Science", "Technology", "Gaming", "Learning", "Travel"];
type NavigationItem = { icon: LucideIcon; label: string; href: string };
const desktopNavigation: NavigationItem[] = [
  { icon: Home, label: "Home", href: "/" },
  { icon: PlaySquare, label: "Shorts", href: "/shorts" },
  { icon: Compass, label: "Explore", href: "/explore" },
  { icon: GraduationCap, label: "School Learning", href: "/learn/school" },
  { icon: History, label: "History", href: "/account" },
  { icon: ThumbsUp, label: "Liked videos", href: "/account" },
];
const mobileNavigation: NavigationItem[] = [
  { icon: Home, label: "Home", href: "/" },
  { icon: PlaySquare, label: "Shorts", href: "/shorts" },
  { icon: PlusSquare, label: "Create", href: "/videos/upload" },
  { icon: GraduationCap, label: "Learn", href: "/learn/school" },
  { icon: UserCircle, label: "You", href: "/account" },
];

function CreatorAvatar({ video }: { video: WatchVideo }) {
  const name = publicCreatorName(video);
  return (
    <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-sm font-black text-slate-950">
      <span>{name.replace(/^@/, "").slice(0, 1).toUpperCase()}</span>
      {video.photoURL?.startsWith("https://") ? <img src={video.photoURL} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : null}
    </div>
  );
}

function Thumbnail({ video, ratio, eager = false }: { video: WatchVideo; ratio: "short" | "landscape"; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-black ${ratio === "short" ? "aspect-[9/16]" : "aspect-video"}`}>
      {!failed ? (
        <img src={publicVideoThumbnail(video)} alt="" loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} decoding="async" className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/60"><PlaySquare size={35}/><span className="text-xs font-semibold">Thumbnail unavailable</span></div>
      )}
      {ratio === "landscape" ? <span className="absolute bottom-2 right-2 rounded-md bg-black/85 px-2 py-1 text-[11px] font-semibold text-white">{formatVideoDuration(video.durationSeconds) || "Watch video"}</span> : null}
    </div>
  );
}

function ShortsGrid({ videos }: { videos: WatchVideo[] }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setNow(Date.now()));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!videos.length) return <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-slate-400">अभी कोई approved Short उपलब्ध नहीं है। नया approved Short आने पर वह यहाँ दिखेगा।</div>;
  return (
    <div className="grid grid-cols-2 gap-3">
      {videos.slice(0, 4).map((video, index) => (
        <Link key={video.id} href={`/shorts?v=${encodeURIComponent(video.id)}`} className="group relative min-w-0 overflow-hidden rounded-2xl bg-slate-900">
          <Thumbnail video={video} ratio="short" eager={index < 4}/>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent p-3 pt-12 text-white">
            {now !== null && video.createdAt && now - video.createdAt <= 7 * 24 * 60 * 60 * 1000 ? <span className="mb-1 inline-flex rounded bg-white px-2 py-0.5 text-[10px] font-bold text-slate-950">New</span> : null}
            <p className="line-clamp-2 text-xs font-bold leading-4 sm:text-sm">{video.caption || "Untitled Short"}</p>
            <p className="mt-1 truncate text-[10px] text-white/70">{publicCreatorName(video)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function LongVideoCard({ video, eager = false }: { video: WatchVideo; eager?: boolean }) {
  return (
    <article className="min-w-0">
      <Link href={`/videos?v=${encodeURIComponent(video.id)}`} className="group block overflow-hidden rounded-2xl bg-[#202020]">
        <Thumbnail video={video} ratio="landscape" eager={eager}/>
      </Link>
      <div className="mt-3 flex gap-3">
        <CreatorAvatar video={video}/>
        <div className="min-w-0 flex-1">
          <Link href={`/videos?v=${encodeURIComponent(video.id)}`} className="line-clamp-2 text-sm font-bold leading-5 sm:text-base">{video.caption || "Untitled video"}</Link>
          <p className="mt-1 truncate text-xs text-slate-400">{publicCreatorName(video)}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400"><Eye size={13}/>{Number(video.views || 0).toLocaleString("en-IN")} views <span>·</span>{publicVideoAge(video.createdAt)}</p>
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("All");
  const [sidebar, setSidebar] = useState(true);
  const { videos, loading, error } = usePublicWatchVideos();

  const filtered = useMemo(() => videos.filter((video) => {
    const searchable = `${video.caption} ${video.displayName || ""} ${video.username} ${video.music} ${(video.hashtags || []).join(" ")}`.toLowerCase();
    const categoryMatch = active === "All" || searchable.includes(active.toLowerCase());
    return categoryMatch && searchable.includes(search.toLowerCase().trim());
  }), [videos, active, search]);
  const shorts = filtered.filter((video) => video.videoFormat !== "long");
  const longVideos = filtered.filter((video) => video.videoFormat === "long");

  return (
    <main className="jp-home-light min-h-screen bg-[#0b0b0b] text-white">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-white/10 bg-[#0b0b0b]/95 px-3 backdrop-blur sm:px-4">
        <button type="button" aria-label="Toggle menu" onClick={() => setSidebar((value) => !value)} className="rounded-full p-2 hover:bg-white/10"><Menu size={23}/></button>
        <Link href="/" className="flex min-w-fit items-center gap-1 text-lg font-black tracking-tight sm:text-xl">JEMBEE <span className="text-cyan-400">PLAY</span><PlaySquare size={19} className="ml-1 text-cyan-400"/></Link>
        <div className="mx-auto flex min-w-0 flex-1 max-w-2xl">
          <div className="flex w-full overflow-hidden rounded-full border border-white/20 bg-[#121212]">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search videos, teachers and topics" aria-label="Search videos" className="w-full min-w-0 bg-transparent px-3 py-2.5 text-sm outline-none sm:px-5"/>
            <button type="button" aria-label="Search" className="border-l border-white/15 bg-white/5 px-3 sm:px-5"><Search size={19}/></button>
          </div>
        </div>
        <Link href="/videos/upload" className="hidden items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold sm:flex"><PlusSquare size={18}/> Create</Link>
        <Link href="/videos/notifications" aria-label="Notifications" className="rounded-full p-2 hover:bg-white/10"><Bell size={21}/></Link>
        <Link href="/account" aria-label="Profile"><UserCircle size={25}/></Link>
      </header>

      <div className="flex">
        {sidebar && <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 overflow-y-auto border-r border-white/10 p-3 md:block">
          {desktopNavigation.map(({ icon: Icon, label, href }) => <Link key={label} href={href} className="flex items-center gap-5 rounded-xl px-4 py-3 text-sm hover:bg-white/10"><Icon size={21}/>{label}</Link>)}
          <div className="my-3 border-t border-white/10"/>
          <p className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">Learning</p>
          <Link href="/learn/school" className="flex items-center gap-5 rounded-xl px-4 py-3 text-sm hover:bg-white/10"><BookOpen size={21}/>Boards & Books</Link>
          <p className="mt-8 px-4 text-xs text-slate-500">JEMBEE PLAY · Watch • Learn • Create • Share</p>
        </aside>}

        <section className="min-w-0 flex-1 px-3 pb-28 pt-3 sm:px-4 sm:pt-4 md:px-6">
          <div className="sticky top-16 z-30 -mx-3 mb-4 flex gap-3 overflow-x-auto bg-[#0b0b0b] px-3 py-2 [scrollbar-width:none] sm:-mx-4 sm:px-4 md:-mx-6 md:px-6">
            {chips.map((chip) => <button type="button" key={chip} onClick={() => setActive(chip)} className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold ${active === chip ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"}`}>{chip}</button>)}
          </div>

          <div className="mb-5 rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-950/70 to-violet-950/50 p-5 sm:flex sm:items-center sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Jembee Play Learning</p><h1 className="mt-1 text-2xl font-black">अपनी किताब का हर सवाल सीखें</h1><p className="mt-1 text-sm text-slate-300">Board → School → Book → Chapter → Question → Video Answer</p></div>
            <Link href="/learn/school" className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 sm:mt-0">Find your school <ChevronRight size={17}/></Link>
          </div>

          <MonetagPlacement placement="home-after-learning-banner" />

          <section className="mb-7" aria-labelledby="shorts-heading">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="shorts-heading" className="flex items-center gap-2 text-lg font-bold sm:text-xl"><PlaySquare className="text-rose-500" size={23}/> Shorts</h2>
              <Link href="/shorts" className="shrink-0 text-sm font-semibold text-cyan-300 hover:underline">View all Shorts</Link>
            </div>
            {loading ? <div className="grid grid-cols-2 gap-3">{Array.from({ length: 4 }, (_, index) => <div key={index} className="aspect-[9/16] animate-pulse rounded-2xl bg-white/5"/>)}</div> : error ? <p role="status" className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-100">{error}</p> : <ShortsGrid videos={shorts}/>}
          </section>

          <MonetagPlacement placement="home-after-shorts" />

          <section className="mb-7" aria-labelledby="long-videos-heading">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="long-videos-heading" className="text-lg font-bold sm:text-xl">Latest Long Videos</h2>
              <Link href="/videos" className="shrink-0 text-sm font-semibold text-cyan-300 hover:underline">View all videos</Link>
            </div>
            {loading ? (
              <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="aspect-video animate-pulse rounded-xl bg-white/5" />)}</div>
            ) : error ? null : longVideos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 p-7 text-center">
                <p className="font-semibold">अभी कोई approved Long Video उपलब्ध नहीं है।</p>
                <p className="mt-2 text-sm text-slate-400">Upload में Long Video चुनकर वीडियो भेजें। Admin approval के बाद वह यहाँ दिखाई देगा।</p>
                <Link href="/videos/upload" className="mt-4 inline-flex rounded-full bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950">Upload Long Video</Link>
              </div>
            ) : (
              <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">{longVideos.slice(0, 12).map((video, index) => <LongVideoCard key={video.id} video={video} eager={index < 3}/>)}</div>
            )}
          </section>

          <MonetagPlacement placement="home-after-video-grid" />
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-white/10 bg-[#0b0b0b]/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
        {mobileNavigation.map(({ icon: Icon, label, href }) => <Link key={label} href={href} className={`flex min-w-0 flex-col items-center gap-1 px-2 py-1 text-[10px] ${label === "Home" ? "text-cyan-300" : "text-slate-300"}`}><Icon size={21}/>{label}</Link>)}
      </nav>
    </main>
  );
}
