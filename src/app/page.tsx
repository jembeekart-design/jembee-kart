"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Search, Menu, Home, Compass, PlaySquare, History, GraduationCap,
  PlusSquare, Bell, UserCircle, ThumbsUp, BookOpen, ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { usePublicWatchVideos } from "@/hooks/usePublicWatchVideos";
import { MonetagPlacement } from "@/components/ads/MonetagPlacement";

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

function videoThumbnail(videoId: string, thumbnail?: string) {
  const candidate = typeof thumbnail === "string" ? thumbnail.trim() : "";
  return candidate.startsWith("https://")
    ? candidate
    : `/api/shorts/video-thumbnail/${encodeURIComponent(videoId)}`;
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

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-white/10 bg-[#0b0b0b]/95 px-4 backdrop-blur">
        <button type="button" aria-label="Toggle menu" onClick={() => setSidebar((value) => !value)} className="rounded-full p-2 hover:bg-white/10"><Menu size={23}/></button>
        <Link href="/" className="flex min-w-fit items-center gap-1 text-xl font-black tracking-tight">JEMBEE <span className="text-cyan-400">PLAY</span><PlaySquare size={19} className="ml-1 text-cyan-400"/></Link>
        <div className="mx-auto flex w-full max-w-2xl items-center">
          <div className="flex w-full overflow-hidden rounded-full border border-white/20 bg-[#121212]">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search videos, teachers and topics" className="w-full bg-transparent px-5 py-2.5 text-sm outline-none"/>
            <button type="button" aria-label="Search" className="border-l border-white/15 bg-white/5 px-5"><Search size={19}/></button>
          </div>
        </div>
        <Link href="/videos/upload" className="hidden items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold sm:flex"><PlusSquare size={18}/> Create</Link>
        <Link href="/videos/notifications" aria-label="Notifications" className="rounded-full p-2 hover:bg-white/10"><Bell size={21}/></Link>
        <Link href="/account" aria-label="Profile"><UserCircle size={27}/></Link>
      </header>

      <div className="flex">
        {sidebar && <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 overflow-y-auto border-r border-white/10 p-3 md:block">
          {desktopNavigation.map(({ icon: Icon, label, href }) => <Link key={label} href={href} className="flex items-center gap-5 rounded-xl px-4 py-3 text-sm hover:bg-white/10"><Icon size={21}/>{label}</Link>)}
          <div className="my-3 border-t border-white/10"/>
          <p className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">Learning</p>
          <Link href="/learn/school" className="flex items-center gap-5 rounded-xl px-4 py-3 text-sm hover:bg-white/10"><BookOpen size={21}/>Boards & Books</Link>
          <p className="mt-8 px-4 text-xs text-slate-500">JEMBEE PLAY · Watch • Learn • Create • Share</p>
        </aside>}

        <section className="min-w-0 flex-1 px-4 pb-24 pt-4 md:px-6">
          <div className="sticky top-16 z-30 -mx-4 mb-5 flex gap-3 overflow-x-auto bg-[#0b0b0b] px-4 py-2 [scrollbar-width:none] md:-mx-6 md:px-6">
            {chips.map((chip) => <button type="button" key={chip} onClick={() => setActive(chip)} className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-semibold ${active === chip ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"}`}>{chip}</button>)}
          </div>

          <div className="mb-5 rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-950/70 to-violet-950/50 p-5 sm:flex sm:items-center sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Jembee Play Learning</p><h1 className="mt-1 text-2xl font-black">अपनी किताब का हर सवाल सीखें</h1><p className="mt-1 text-sm text-slate-300">Board → School → Book → Chapter → Question → Video Answer</p></div>
            <Link href="/learn/school" className="mt-4 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 sm:mt-0">Find your school <ChevronRight size={17}/></Link>
          </div>

          <MonetagPlacement placement="home-after-learning-banner" />

          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Latest approved videos</h2>
            <Link href="/videos" className="text-sm font-semibold text-cyan-300 hover:underline">View all videos</Link>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="aspect-video animate-pulse rounded-xl bg-white/5" />)}</div>
          ) : error ? (
            <div role="status" className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6 text-sm text-amber-100">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
              <p className="font-semibold">{videos.length === 0 ? "अभी कोई approved free video उपलब्ध नहीं है।" : "इस search से कोई video नहीं मिला।"}</p>
              <p className="mt-2 text-sm text-slate-400">नया approved video आने पर वह यहाँ दिखाई देगा।</p>
              <Link href="/videos/upload" className="mt-4 inline-flex rounded-full bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950">Create video</Link>
            </div>
          ) : (
            <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((video) => (
                <article key={video.id} className="min-w-0">
                  <Link href={`/videos?v=${encodeURIComponent(video.id)}`} className="group relative block overflow-hidden rounded-xl bg-[#202020]">
                    <img src={videoThumbnail(video.id, video.thumbnail)} alt="" loading="lazy" className="aspect-video w-full object-cover transition group-hover:scale-[1.02]" onError={(event) => { event.currentTarget.src = "/file.svg"; }}/>
                    <span className="absolute bottom-2 right-2 rounded bg-black/85 px-1.5 py-0.5 text-xs font-semibold">Watch video</span>
                  </Link>
                  <div className="mt-3 flex gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 font-black text-slate-950">J</div>
                    <div className="min-w-0">
                      <Link href={`/videos?v=${encodeURIComponent(video.id)}`} className="line-clamp-2 text-sm font-bold leading-5">{video.caption || "Untitled video"}</Link>
                      <p className="mt-1 text-xs text-slate-400">{video.displayName || video.username || "JEMBEE PLAY Creator"}</p>
                      <p className="text-xs text-slate-400">{Number(video.views || 0).toLocaleString("en-IN")} views</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <MonetagPlacement placement="home-after-video-grid" />
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-white/10 bg-[#0b0b0b]/95 px-2 py-2 backdrop-blur md:hidden">
        {mobileNavigation.map(({ icon: Icon, label, href }) => <Link key={label} href={href} className="flex flex-col items-center gap-1 px-2 py-1 text-[10px] text-slate-300"><Icon size={21}/>{label}</Link>)}
      </nav>
    </main>
  );
}
