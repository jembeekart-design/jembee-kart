"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Search, Menu, X, Home, Compass, PlaySquare, History, GraduationCap, PlusSquare, Bell, UserCircle, ThumbsUp, BookOpen, ChevronRight, Eye, Share2, Video, Wallet, type LucideIcon } from "lucide-react";
import { usePublicWatchVideos } from "@/hooks/usePublicWatchVideos";
import { MonetagPlacement } from "@/components/ads/MonetagPlacement";
import { formatVideoDuration, publicCreatorName, publicVideoAge, publicVideoThumbnail } from "@/lib/videos/publicVideoPresentation";
import type { WatchVideo } from "@/lib/videos/watch-earn/fetchWatchVideos";

type HomeCategory = { id: string; label: string; filter: string; enabled: boolean };
type FeaturedCreator = { creatorId: string; label: string; enabled: boolean };
type FeaturedPlaylist = { id: string; title: string; description: string; videoIds: string[]; enabled: boolean };
type FeaturedVideo = { videoId: string; label: string; startsAt: string; endsAt: string; enabled: boolean };
type NavigationKey = "home" | "shorts" | "explore" | "learning" | "history" | "liked";
const DEFAULT_HOME_CATEGORIES: HomeCategory[] = [
  { id: "education", label: "Education", filter: "education", enabled: true },
  { id: "music", label: "Music", filter: "music", enabled: true },
  { id: "science", label: "Science", filter: "science", enabled: true },
  { id: "technology", label: "Technology", filter: "technology", enabled: true },
  { id: "gaming", label: "Gaming", filter: "gaming", enabled: true },
  { id: "travel", label: "Travel", filter: "travel", enabled: true },
];
const DEFAULT_NAVIGATION_LABELS: Record<NavigationKey, string> = { home: "Home", shorts: "Shorts", explore: "Explore", learning: "School Learning", history: "History", liked: "Liked videos" };

type SiteExperience = {
  siteName: string; tagline: string; heroTitle: string; heroSubtitle: string;
  primaryColor: string; accentColor: string; pageColor: string; surfaceColor: string;
  announcementEnabled: boolean; announcementText: string; showLearningBanner: boolean;
  showShorts: boolean; showLongVideos: boolean; showHomeAds: boolean; compactCards: boolean; sectionOrder: ("learning" | "shorts" | "longVideos")[]; homeCategories: HomeCategory[]; navigationLabels: Record<NavigationKey, string>; featuredCreators: FeaturedCreator[]; featuredPlaylists: FeaturedPlaylist[]; featuredVideos: FeaturedVideo[];
};
const DEFAULT_SITE_EXPERIENCE: SiteExperience = {
  siteName: "JEMBEE PLAY", tagline: "Watch • Learn • Create • Share",
  heroTitle: "अपनी किताब का हर सवाल सीखें",
  heroSubtitle: "अपनी class, book और chapter चुनें और सही video answer खोजें।",
  primaryColor: "#ec4899", accentColor: "#8b5cf6", pageColor: "#090d16", surfaceColor: "#111827",
  announcementEnabled: false, announcementText: "", showLearningBanner: true,
  showShorts: true, showLongVideos: true, showHomeAds: true, compactCards: false, sectionOrder: ["learning", "shorts", "longVideos"], homeCategories: DEFAULT_HOME_CATEGORIES, navigationLabels: DEFAULT_NAVIGATION_LABELS, featuredCreators: [], featuredPlaylists: [], featuredVideos: [],
};
type NavigationItem = { icon: LucideIcon; label: string; href: string; key?: NavigationKey };
const earningsNavigation: NavigationItem[] = [
  { icon: Share2, label: "Sharer की कमाई", href: "/earnings/sharer" },
  { icon: Video, label: "Creator की कमाई", href: "/earnings/creator" },
  { icon: GraduationCap, label: "Teacher Referral Commission", href: "/earnings/teacher" },
];
const desktopNavigation: NavigationItem[] = [
  { icon: Home, key: "home", label: "Home", href: "/" },
  { icon: PlaySquare, key: "shorts", label: "Shorts", href: "/shorts" },
  { icon: Compass, key: "explore", label: "Explore", href: "/explore" },
  { icon: GraduationCap, key: "learning", label: "School Learning", href: "/learn/school" },
  { icon: History, key: "history", label: "History", href: "/account" },
  { icon: ThumbsUp, key: "liked", label: "Liked videos", href: "/account" },
];
const mobileNavigation: NavigationItem[] = [
  { icon: Home, key: "home", label: "Home", href: "/" },
  { icon: PlaySquare, key: "shorts", label: "Shorts", href: "/shorts" },
  { icon: GraduationCap, key: "learning", label: "Learning", href: "/learn/school" },
  { icon: Wallet, label: "Earn", href: "/earnings/creator" },
  { icon: BookOpen, label: "Library", href: "/learn/school" },
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
  const sidebar = true;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { videos, loading, error } = usePublicWatchVideos();
  const [siteExperience, setSiteExperience] = useState<SiteExperience>(DEFAULT_SITE_EXPERIENCE);
  const [clientNow, setClientNow] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/public/site-experience", { cache: "no-store" })
      .then((response) => response.ok ? response.json() as Promise<Partial<SiteExperience>> : null)
      .then((settings) => {
        if (!active || !settings) return;
        const next = { ...DEFAULT_SITE_EXPERIENCE, ...settings };
        setSiteExperience(next);
        const root = document.documentElement;
        root.style.setProperty("--primary-color", next.primaryColor);
        root.style.setProperty("--secondary-color", next.accentColor);
        root.style.setProperty("--background-color", next.pageColor);
        root.style.setProperty("--card-color", next.surfaceColor);
        root.style.setProperty("--color-primary-button", next.primaryColor);
        root.style.setProperty("--color-secondary-button", next.accentColor);
        root.style.setProperty("--color-page-background", next.pageColor);
        root.style.setProperty("--color-card-background", next.surfaceColor);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => setClientNow(Date.now()), 0);
    const interval = window.setInterval(() => setClientNow(Date.now()), 30_000);
    return () => { window.clearTimeout(initial); window.clearInterval(interval); };
  }, []);

  const visibleChips = siteExperience.homeCategories.filter((item) => item.enabled);
  const filtered = useMemo(() => videos.filter((video) => {
    const searchable = `${video.caption} ${video.displayName || ""} ${video.username} ${video.music} ${(video.hashtags || []).join(" ")}`.toLowerCase();
    const categoryMatch = active === "All" || searchable.includes(active.toLowerCase());
    return categoryMatch && searchable.includes(search.toLowerCase().trim());
  }), [videos, active, search]);
  const shorts = filtered.filter((video) => video.videoFormat !== "long");
  const longVideos = filtered.filter((video) => video.videoFormat === "long");
  const featuredCreators = siteExperience.featuredCreators.filter((creator) => creator.enabled).map((creator) => ({ ...creator, videos: videos.filter((video) => video.creatorId === creator.creatorId).slice(0, 4) })).filter((creator) => creator.videos.length > 0);
  const featuredPlaylists = siteExperience.featuredPlaylists.filter((playlist) => playlist.enabled).map((playlist) => ({ ...playlist, videos: playlist.videoIds.map((id) => videos.find((video) => video.id === id)).filter((video): video is WatchVideo => !!video) })).filter((playlist) => playlist.videos.length > 0);
  const featuredVideos = clientNow === null ? [] : siteExperience.featuredVideos.filter((item) => item.enabled && (!item.startsAt || Date.parse(item.startsAt) <= clientNow) && (!item.endsAt || Date.parse(item.endsAt) > clientNow)).map((item) => ({ ...item, video: videos.find((video) => video.id === item.videoId) })).filter((item): item is FeaturedVideo & { video: WatchVideo } => !!item.video && item.video.videoFormat === "long");

  return (
    <main className="min-h-screen bg-[var(--color-page-background)] text-white">
      {siteExperience.announcementEnabled && siteExperience.announcementText ? <div className="px-4 py-2 text-center text-xs font-bold text-slate-950 sm:text-sm" style={{ backgroundColor: siteExperience.primaryColor }}>{siteExperience.announcementText}</div> : null}
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-white/10 bg-[var(--color-page-background)]/95 px-3 backdrop-blur sm:px-4">
        <button type="button" aria-label="Toggle menu" aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation-drawer" onClick={() => setMobileMenuOpen((value) => !value)} className="rounded-full p-2 hover:bg-white/10"><Menu size={23}/></button>
        <Link href="/" className="flex min-w-fit items-center gap-1 text-lg font-black tracking-tight sm:text-xl">{siteExperience.siteName}<PlaySquare size={19} className="ml-1 text-pink-400"/></Link>
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

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-[70] md:hidden" role="presentation">
          <button type="button" aria-label="Close menu overlay" onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-black/70"/>
          <aside id="mobile-navigation-drawer" role="dialog" aria-modal="true" aria-label="Main navigation" className="absolute inset-y-0 left-0 flex w-[min(86vw,340px)] flex-col overflow-y-auto border-r border-white/10 bg-[#101014] p-4 pt-[calc(env(safe-area-inset-top)+1rem)] shadow-2xl">
            <div className="mb-4 flex items-center justify-between"><Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-lg font-black">{siteExperience.siteName}</Link><button type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="rounded-full p-2 hover:bg-white/10"><X size={22}/></button></div>
            <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">Discover</p>
            {desktopNavigation.map(({ icon: Icon, label, href, key }) => <Link key={key || label} href={href} onClick={() => setMobileMenuOpen(false)} className="flex min-h-12 items-center gap-4 rounded-xl px-3 py-3 text-sm hover:bg-white/10"><Icon size={20}/>{key ? siteExperience.navigationLabels[key] || label : label}</Link>)}
            <div className="my-3 border-t border-white/10"/>
            <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">Earnings · अलग-अलग कमाई</p>
            {earningsNavigation.map(({ icon: Icon, label, href }) => <Link key={label} href={href} onClick={() => setMobileMenuOpen(false)} className="flex min-h-12 items-center gap-4 rounded-xl px-3 py-3 text-sm hover:bg-white/10"><Icon size={20} className="text-pink-300"/>{label}<ChevronRight size={16} className="ml-auto text-slate-500"/></Link>)}
            <div className="my-3 border-t border-white/10"/>
            <Link href="/videos/share" onClick={() => setMobileMenuOpen(false)} className="flex min-h-12 items-center gap-4 rounded-xl px-3 py-3 text-sm hover:bg-white/10"><Wallet size={20}/>Share Income (पुराना लिंक)</Link>
            <p className="mt-auto px-3 pt-6 text-xs text-slate-500">{siteExperience.tagline}</p>
          </aside>
        </div>
      ) : null}

      <div className="flex">
        {sidebar && <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 overflow-y-auto border-r border-white/10 p-3 md:block">
          {desktopNavigation.map(({ icon: Icon, label, href, key }) => <Link key={key || label} href={href} className="flex items-center gap-5 rounded-xl px-4 py-3 text-sm hover:bg-white/10"><Icon size={21}/>{key ? siteExperience.navigationLabels[key] || label : label}</Link>)}
          <div className="my-3 border-t border-white/10"/>
          <p className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">Learning</p>
          <Link href="/learn/school" className="flex items-center gap-5 rounded-xl px-4 py-3 text-sm hover:bg-white/10"><BookOpen size={21}/>Boards & Books</Link>
          <div className="my-3 border-t border-white/10"/>
          <p className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">Earnings</p>
          {earningsNavigation.map(({ icon: Icon, label, href }) => <Link key={label} href={href} className="flex items-center gap-5 rounded-xl px-4 py-3 text-sm hover:bg-white/10"><Icon size={21}/>{label}</Link>)}
          <p className="mt-8 px-4 text-xs text-slate-500">{siteExperience.siteName} · {siteExperience.tagline}</p>
        </aside>}

        <section className="min-w-0 flex-1 px-3 pb-28 pt-3 sm:px-4 sm:pt-4 md:px-6">
          <div className="sticky top-16 z-30 -mx-3 mb-4 flex gap-3 overflow-x-auto bg-[var(--color-page-background)] px-3 py-2 [scrollbar-width:none] sm:-mx-4 sm:px-4 md:-mx-6 md:px-6">
            {[{ id: "all", label: "All", filter: "All" }, ...visibleChips].map((chip) => <button type="button" key={chip.id} onClick={() => setActive(chip.filter)} className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold ${active === chip.filter ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"}`}>{chip.label}</button>)}
          </div>

          {siteExperience.sectionOrder.map((sectionKey) => {
            if (sectionKey === "learning") {
              return <Fragment key="learning">
                {siteExperience.showLearningBanner ? <div className="relative mb-5 min-h-[230px] overflow-hidden rounded-2xl border border-pink-400/20 bg-[#17113b] p-5 sm:flex sm:min-h-[280px] sm:items-center sm:justify-between sm:p-8">
                  <img src="https://images.unsplash.com/photo-1529390079861-591de354faf5?w=1600&auto=format&fit=crop" alt="Students learning together" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-center opacity-60"/>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#100b35] via-[#160d42]/90 to-[#160d42]/20"/>
                  <div className="relative z-10 max-w-xl"><p className="text-xs font-bold uppercase tracking-widest text-pink-300">Videos · Chapters · Questions · Answers</p><h1 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">{siteExperience.heroTitle}</h1><p className="mt-2 max-w-lg text-sm text-slate-200">{siteExperience.heroSubtitle}</p>
                  <Link href="/learn/school" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-pink-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-950/40"> <PlaySquare size={17}/> Watch Now</Link></div>
                </div> : null}
                {siteExperience.showHomeAds ? <MonetagPlacement placement="home-after-learning-banner" /> : null}
              </Fragment>;
            }
            if (sectionKey === "shorts") {
              return <Fragment key="shorts">
                {siteExperience.showShorts ? <section className="mb-7" aria-labelledby="shorts-heading">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 id="shorts-heading" className="flex items-center gap-2 text-lg font-bold sm:text-xl"><PlaySquare className="text-rose-500" size={23}/> Shorts</h2>
                    <Link href="/shorts" className="shrink-0 text-sm font-semibold text-pink-300 hover:underline">View all Shorts</Link>
                  </div>
                  {loading ? <div className="grid grid-cols-2 gap-3">{Array.from({ length: 4 }, (_, index) => <div key={index} className="aspect-[9/16] animate-pulse rounded-2xl bg-white/5"/>)}</div> : error ? <p role="status" className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-100">{error}</p> : <ShortsGrid videos={shorts}/>}
                </section> : null}
                {siteExperience.showHomeAds ? <MonetagPlacement placement="home-after-shorts" /> : null}
              </Fragment>;
            }
            if (sectionKey === "longVideos") {
              return <Fragment key="longVideos">
                {siteExperience.showLongVideos ? <section className="mb-7" aria-labelledby="long-videos-heading">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 id="long-videos-heading" className="text-lg font-bold sm:text-xl">Latest Long Videos</h2>
                    <Link href="/videos" className="shrink-0 text-sm font-semibold text-pink-300 hover:underline">View all videos</Link>
                  </div>
                  {loading ? (
                    <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="aspect-video animate-pulse rounded-xl bg-white/5" />)}</div>
                  ) : error ? null : longVideos.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/15 p-7 text-center">
                      <p className="font-semibold">अभी कोई approved Long Video उपलब्ध नहीं है।</p>
                      <p className="mt-2 text-sm text-slate-400">Upload में Long Video चुनकर वीडियो भेजें। Admin approval के बाद वह यहाँ दिखाई देगा।</p>
                      <Link href="/videos/upload" className="mt-4 inline-flex rounded-full bg-pink-500 px-4 py-2 text-sm font-bold text-slate-950">Upload Long Video</Link>
                    </div>
                  ) : (
                    <div className={`grid gap-x-4 gap-y-8 sm:grid-cols-2 ${siteExperience.compactCards ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>{longVideos.slice(0, 12).map((video, index) => <LongVideoCard key={video.id} video={video} eager={index < 3}/>)}</div>
                  )}
                </section> : null}
                {siteExperience.showHomeAds ? <MonetagPlacement placement="home-after-video-grid" /> : null}
              </Fragment>;
            }
            return null;
          })}
          {featuredVideos.length ? <section className="mb-8" aria-labelledby="featured-videos-heading"><h2 id="featured-videos-heading" className="mb-4 text-lg font-bold sm:text-xl">Featured Video</h2><div className={`grid gap-x-4 gap-y-6 sm:grid-cols-2 ${siteExperience.compactCards ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>{featuredVideos.map((item, index) => <div key={item.videoId}><p className="mb-2 text-xs font-semibold text-pink-300">{item.label}</p><LongVideoCard video={item.video} eager={index === 0}/></div>)}</div></section> : null}
          {featuredCreators.length ? <section className="mb-8" aria-labelledby="featured-creators-heading">
            <h2 id="featured-creators-heading" className="mb-4 text-lg font-bold sm:text-xl">Recommended Creators</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{featuredCreators.map((creator) => <article key={creator.creatorId} className="rounded-2xl border border-white/10 bg-[var(--color-card-background)] p-4"><Link href={`/videos/uploader/${encodeURIComponent(creator.creatorId)}`} className="flex items-center gap-3"><CreatorAvatar video={creator.videos[0]}/><div className="min-w-0"><p className="truncate font-semibold">{creator.label}</p><p className="text-xs text-slate-400">{creator.videos.length} featured videos</p></div><ChevronRight className="ml-auto shrink-0 text-slate-500" size={18}/></Link><div className="mt-3 grid grid-cols-2 gap-2">{creator.videos.slice(0, 2).map((video) => <Link key={video.id} href={`/videos?v=${encodeURIComponent(video.id)}`} className="overflow-hidden rounded-lg"><Thumbnail video={video} ratio="landscape"/><p className="mt-1 line-clamp-1 text-xs">{video.caption || "Untitled video"}</p></Link>)}</div></article>)}</div>
          </section> : null}
          {featuredPlaylists.map((playlist) => <section key={playlist.id} className="mb-8" aria-labelledby={`playlist-${playlist.id}`}>
            <div className="mb-3"><h2 id={`playlist-${playlist.id}`} className="text-lg font-bold sm:text-xl">{playlist.title}</h2>{playlist.description ? <p className="mt-1 text-sm text-slate-400">{playlist.description}</p> : null}</div>
            <div className={`grid gap-x-4 gap-y-6 sm:grid-cols-2 ${siteExperience.compactCards ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>{playlist.videos.slice(0, 12).map((video, index) => <LongVideoCard key={video.id} video={video} eager={index < 2}/>)}</div>
          </section>)}
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-white/10 bg-[var(--color-page-background)]/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
        {mobileNavigation.map(({ icon: Icon, label, href, key }) => <Link key={key || label} href={href} className={`flex min-w-0 flex-col items-center gap-1 px-2 py-1 text-[10px] ${key === "home" ? "text-pink-300" : "text-slate-300"}`}><Icon size={21}/>{key ? siteExperience.navigationLabels[key] || label : label}</Link>)}
      </nav>
    </main>
  );
}
