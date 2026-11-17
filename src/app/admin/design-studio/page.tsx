"use client";

import { useMemo, useState } from "react";
import {
  Activity, ArrowLeft, Bell, BookOpen, CheckCircle2, ChevronDown, Clapperboard,
  Compass, GraduationCap, Heart, Home, LayoutDashboard, Monitor, Play, Search,
  Smartphone, Sparkles, Tv, Users, Video, X,
} from "lucide-react";

type ScreenKey = "home" | "shorts" | "explore" | "learning" | "creator" | "admin";
type Device = "mobile" | "desktop" | "tv";
type DemoAction = { title: string; detail: string };

const screens: { key: ScreenKey; label: string; description: string; icon: typeof Home }[] = [
  { key: "home", label: "Home", description: "Main video discovery and featured learning", icon: Home },
  { key: "shorts", label: "Shorts", description: "Vertical swipe-video experience", icon: Clapperboard },
  { key: "explore", label: "Explore", description: "Categories, topics and search", icon: Compass },
  { key: "learning", label: "School Learning", description: "Class, subject, book and chapter flow", icon: GraduationCap },
  { key: "creator", label: "Creator Studio", description: "Creator overview and content status", icon: Users },
  { key: "admin", label: "Admin Dashboard", description: "Moderation and platform controls", icon: LayoutDashboard },
];

const demoVideos = [
  { title: "The Solar System explained", creator: "Jembee Learning", category: "Science", duration: "08:42", color: "from-cyan-500 to-blue-700" },
  { title: "How plants make their food", creator: "Science with Aisha", category: "Class 7", duration: "12:18", color: "from-emerald-500 to-teal-800" },
  { title: "Fractions made simple", creator: "Maths Corner", category: "Mathematics", duration: "06:35", color: "from-violet-500 to-indigo-800" },
];

function DemoButton({ children, onClick, secondary = false }: { children: React.ReactNode; onClick: () => void; secondary?: boolean }) {
  return <button type="button" onClick={onClick} className={secondary ? "rounded-xl border border-white/15 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10" : "rounded-xl bg-cyan-400 px-3 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300"}>{children}</button>;
}

export default function DesignStudioPage() {
  const [screen, setScreen] = useState<ScreenKey>("home");
  const [device, setDevice] = useState<Device>("desktop");
  const [action, setAction] = useState<DemoAction>({ title: "Preview ready", detail: "Choose any screen and interact with the demo controls. All changes stay inside this preview." });
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [selectedClass, setSelectedClass] = useState("Class 7");
  const [selectedSubject, setSelectedSubject] = useState("Science");
  const [query, setQuery] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  const activeScreen = screens.find((item) => item.key === screen)!;
  const filteredVideos = useMemo(() => demoVideos.filter((video) => (video.title + video.category).toLowerCase().includes(query.toLowerCase())), [query]);

  function simulate(title: string, detail: string) {
    setAction({ title, detail });
  }

  function renderScreen() {
    if (screen === "shorts") return (
      <div className="mx-auto max-w-sm overflow-hidden rounded-[2rem] border border-white/15 bg-black shadow-2xl">
        <div className="relative flex aspect-[9/16] flex-col justify-between bg-gradient-to-br from-indigo-700 via-slate-900 to-cyan-900 p-5">
          <div className="flex items-center justify-between text-xs font-bold"><span>JEMBEE PLAY</span><span>SHORTS · DEMO</span></div>
          <div className="space-y-3"><div className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-white/30 bg-white/10"><Play size={38} fill="white" /></div><p className="text-center text-xl font-black">Learn something new in 30 seconds</p><p className="text-center text-sm text-white/70">A sample short video · 00:28</p></div>
          <div className="flex items-end justify-between"><div><p className="font-bold">@jembee_learning</p><p className="mt-1 text-xs text-white/70">#science #learn #shorts</p><DemoButton onClick={() => { setFollowing(!following); simulate(following ? "Creator unfollowed" : "Creator followed", "Demo follow state only. No account was changed."); }}>{following ? "Following" : "Follow"}</DemoButton></div><div className="grid gap-4 text-center"><button onClick={() => { setLiked(!liked); simulate(liked ? "Like removed" : "Video liked", "This is a local demo reaction. No like was saved."); }} className="grid justify-items-center gap-1"><Heart fill={liked ? "currentColor" : "none"} className={liked ? "text-pink-400" : ""}/><span className="text-xs">{liked ? "Liked" : "Like"}</span></button><button onClick={() => { setShowDetails(!showDetails); simulate("Comments panel", "A sample comments panel would open here."); }} className="grid justify-items-center gap-1"><Users/><span className="text-xs">Comments</span></button><button onClick={() => simulate("Share preview", "A demo share sheet would appear here. Nothing was shared.")} className="grid justify-items-center gap-1"><Activity/><span className="text-xs">Share</span></button></div></div>
        </div>
        {showDetails && <div className="border-t border-white/10 p-3 text-sm text-white/70">Demo comments: “Very helpful!” · “Explain the next chapter too.”</div>}
      </div>
    );

    if (screen === "learning") return (
      <div className="space-y-5">
        <div><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">School Learning</p><h2 className="mt-2 text-2xl font-black">Find your exact question</h2><p className="mt-1 text-sm text-white/60">Select a class, subject and chapter to see sample textbook questions.</p></div>
        <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs text-white/60">Class<select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); simulate("Class changed", "Sample learning catalogue updated locally."); }} className="mt-1 w-full rounded-xl border border-white/15 bg-slate-900 p-3 text-white"><option>Class 6</option><option>Class 7</option><option>Class 8</option><option>Class 9</option><option>Class 10</option></select></label><label className="text-xs text-white/60">Subject<select value={selectedSubject} onChange={(e) => { setSelectedSubject(e.target.value); simulate("Subject changed", "Sample subject selection updated locally."); }} className="mt-1 w-full rounded-xl border border-white/15 bg-slate-900 p-3 text-white"><option>Science</option><option>Mathematics</option><option>English</option><option>Social Science</option></select></label></div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="font-bold">{selectedClass} · {selectedSubject}</p><p className="mt-1 text-sm text-white/55">Sample book: Our Environment and Science</p>{["Nutrition in Plants", "Nutrition in Animals", "Respiration in Organisms"].map((chapter, i) => <button key={chapter} onClick={() => simulate("Chapter opened", chapter + " · Sample questions and answer videos are displayed in demo mode.")} className="mt-3 flex w-full items-center justify-between rounded-xl bg-white/5 p-3 text-left text-sm hover:bg-white/10"><span><span className="mr-3 text-cyan-300">0{i + 1}</span>{chapter}</span><ChevronDown size={16}/></button>)}</div>
        <DemoButton onClick={() => simulate("Sample question selected", "A teacher would attach a video answer to this preloaded question. No upload has started.")}>Open sample question</DemoButton>
      </div>
    );

    if (screen === "explore") return (
      <div className="space-y-5"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Explore</p><h2 className="mt-2 text-2xl font-black">Explore what you love</h2></div><div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3"><Search size={18} className="text-white/50"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search sample videos..." className="w-full bg-transparent py-3 text-sm outline-none"/></div><div className="flex flex-wrap gap-2">{["Education", "Science", "Technology", "Music", "Gaming"].map((item) => <button key={item} onClick={() => { setQuery(item); simulate("Category selected", item + " sample results are filtered locally."); }} className="rounded-full border border-white/15 px-3 py-2 text-xs hover:border-cyan-300">{item}</button>)}</div><VideoGrid videos={filteredVideos} onOpen={(title) => simulate("Video preview opened", title + " · Sample player only; no real playback or view count.")}/></div>
    );

    if (screen === "creator") return (
      <div className="space-y-5"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Creator Studio</p><h2 className="mt-2 text-2xl font-black">Your creator overview</h2><p className="mt-1 text-sm text-white/60">Illustrative data only — not connected to a creator account.</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[["Videos","24"],["Views","18.4K"],["Followers","1,280"]].map(([label,value]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-white/50">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div>)}</div><div className="rounded-2xl border border-white/10 p-4"><h3 className="font-bold">Recent content</h3>{["Science facts in 30 seconds","Chapter 4 · Question 2","How the heart works"].map((item) => <div key={item} className="flex items-center justify-between border-b border-white/10 py-3 text-sm"><span>{item}</span><span className="text-xs text-emerald-300">Demo approved</span></div>)}</div><DemoButton onClick={() => simulate("Upload is disabled", "The real upload workflow is intentionally not connected in Design Studio.")}>Preview upload button</DemoButton></div>
    );

    if (screen === "admin") return (
      <div className="space-y-5"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Admin Control Center</p><h2 className="mt-2 text-2xl font-black">Platform overview</h2><p className="mt-1 text-sm text-white/60">Fake sample metrics. No admin API is called.</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[["Pending videos","18"],["Learning entries","240"],["Reports to review","03"],["Active creators","1.2K"],["Demo sessions","86"],["System status","Healthy"]].map(([label,value]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-white/50">{label}</p><p className="mt-2 text-xl font-black">{value}</p></div>)}</div><div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-100">Safety controls: approve, publish, payouts, payment settings and destructive admin actions are disabled in this demo.</div><DemoButton onClick={() => simulate("Moderation preview", "A sample review detail would open. No video can be approved or rejected here.")}>Open sample moderation</DemoButton></div>
    );

    return (
      <div className="space-y-6"><div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-950 via-slate-900 to-indigo-950 p-6 sm:p-9"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-cyan-300"><Sparkles size={15}/> Watch · Learn · Create · Share</div><h2 className="mt-5 max-w-2xl text-3xl font-black leading-tight sm:text-5xl">अपनी किताब का हर सवाल सीखें</h2><p className="mt-3 max-w-xl text-sm text-white/70 sm:text-base">अपनी class, book और chapter चुनें और सही video answer खोजें।</p><div className="mt-6 flex flex-wrap gap-2"><DemoButton onClick={() => { setScreen("learning"); simulate("Learning opened", "School Learning demo screen opened."); }}>Start Learning</DemoButton><DemoButton secondary onClick={() => { setScreen("shorts"); simulate("Shorts opened", "Shorts demo screen opened."); }}>Watch Shorts</DemoButton></div></div><div><div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-black">Sample videos · Popular for you</h3><button onClick={() => setScreen("explore")} className="text-sm font-semibold text-cyan-300">Explore all</button></div><VideoGrid videos={demoVideos} onOpen={(title) => simulate("Video selected", title + " · This is a non-playing sample card.")}/></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex items-center gap-2 font-bold"><BookOpen size={18} className="text-cyan-300"/> School Learning</div><p className="mt-1 text-sm text-white/60">Choose a class and continue from your chapter.</p><button onClick={() => setScreen("learning")} className="mt-3 text-sm font-bold text-cyan-300">Browse learning library →</button></div></div>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b14] p-3 text-white sm:p-6">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div><a href="/admin" className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white"><ArrowLeft size={14}/> Admin</a><div className="mt-2 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 text-slate-950"><Sparkles/></div><div><p className="text-xs font-bold tracking-[.2em] text-cyan-300">JEMBEE PLAY</p><h1 className="text-xl font-black sm:text-2xl">Interactive Design Studio</h1></div></div></div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-200"><CheckCircle2 size={14}/> SAFE DEMO MODE</div>
        </header>
        <div className="mb-5 grid gap-3 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-white/10 bg-white/[.03] p-3">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[.2em] text-white/35">Screens & experiences</p>
            <nav className="grid grid-cols-2 gap-2 lg:grid-cols-1">{screens.map((item) => { const Icon = item.icon; return <button key={item.key} onClick={() => { setScreen(item.key); setShowDetails(false); simulate(item.label + " preview", item.description + ". Interactions are simulated locally."); }} className={screen === item.key ? "flex items-center gap-3 rounded-xl border border-cyan-300/30 bg-cyan-300/10 p-3 text-left text-cyan-100" : "flex items-center gap-3 rounded-xl border border-transparent p-3 text-left text-white/65 hover:bg-white/5"}><Icon size={18}/><span className="min-w-0"><span className="block text-sm font-bold">{item.label}</span><span className="hidden truncate text-[10px] text-white/40 sm:block">{item.description}</span></span></button>; })}</nav>
            <div className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/5 p-3 text-xs leading-relaxed text-amber-100/80"><strong className="block text-amber-100">Isolated preview</strong>No database, payment, upload, ad, payout or production API is connected.</div>
          </aside>
          <section className="min-w-0 rounded-2xl border border-white/10 bg-white/[.03] p-3 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs text-white/40">CURRENT PREVIEW</p><h2 className="mt-1 text-lg font-black">{activeScreen.label}</h2><p className="text-xs text-white/50">{activeScreen.description}</p></div><div className="flex gap-1 rounded-xl border border-white/10 bg-black/20 p-1"><button onClick={() => setDevice("mobile")} aria-label="Mobile preview" className={device === "mobile" ? "rounded-lg bg-cyan-400 px-3 py-2 text-slate-950" : "rounded-lg px-3 py-2 text-white/60"}><Smartphone size={17}/></button><button onClick={() => setDevice("desktop")} aria-label="Desktop preview" className={device === "desktop" ? "rounded-lg bg-cyan-400 px-3 py-2 text-slate-950" : "rounded-lg px-3 py-2 text-white/60"}><Monitor size={17}/></button><button onClick={() => setDevice("tv")} aria-label="TV preview" className={device === "tv" ? "rounded-lg bg-cyan-400 px-3 py-2 text-slate-950" : "rounded-lg px-3 py-2 text-white/60"}><Tv size={17}/></button></div></div>
            <div className="flex min-h-[560px] justify-center overflow-auto rounded-xl bg-[#03060c] p-3 sm:p-5"><div className={device === "mobile" ? "w-full max-w-[390px] rounded-[2rem] border-[5px] border-slate-700 bg-[#0b1220] p-4" : device === "tv" ? "w-full max-w-[1100px] rounded-xl border-4 border-slate-700 bg-[#0b1220] p-7 text-lg" : "w-full max-w-[950px] rounded-xl border border-white/10 bg-[#0b1220] p-5 sm:p-7"}><div className="mb-5 flex items-center justify-between border-b border-white/10 pb-3"><span className="font-black tracking-wide">JEMBEE <span className="text-cyan-300">PLAY</span></span><div className="flex items-center gap-3 text-white/55"><Search size={16}/><Bell size={16}/><span className="rounded-full bg-cyan-300/15 px-2 py-1 text-[10px] text-cyan-200">DEMO</span></div></div>{renderScreen()}<div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-4 text-xs text-white/40"><button onClick={() => simulate("Home navigation", "Home selected in local demo navigation.")}>Home</button><button onClick={() => { setScreen("shorts"); simulate("Shorts navigation", "Shorts demo opened."); }}>Shorts</button><button onClick={() => { setScreen("explore"); simulate("Explore navigation", "Explore demo opened."); }}>Explore</button><button onClick={() => { setScreen("learning"); simulate("Learning navigation", "Learning demo opened."); }}>Learning</button></div></div></div>
            <div className="mt-4 rounded-xl border border-cyan-300/15 bg-cyan-300/5 p-4"><div className="flex items-center gap-2 text-sm font-bold text-cyan-100"><Activity size={16}/>{action.title}</div><p className="mt-1 text-xs leading-relaxed text-white/60">{action.detail}</p></div>
          </section>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/35"><span>Development branch preview · UI prototype with local demo interactions</span><span>All demo changes reset when this page is refreshed.</span></footer>
      </div>
    </main>
  );
}

function VideoGrid({ videos, onOpen }: { videos: typeof demoVideos; onOpen: (title: string) => void }) {
  if (!videos.length) return <p className="rounded-xl border border-white/10 p-4 text-sm text-white/50">No sample videos match this search.</p>;
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{videos.map((video) => <button key={video.title} onClick={() => onOpen(video.title)} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left transition hover:border-cyan-300/30"><div className={`grid aspect-video place-items-center bg-gradient-to-br ${video.color}`}><div className="grid h-12 w-12 place-items-center rounded-full bg-black/30"><Play fill="white" size={20}/></div><span className="absolute translate-x-24 translate-y-14 rounded bg-black/60 px-2 py-1 text-[10px]">{video.duration}</span></div><div className="p-3"><p className="font-bold">{video.title}</p><p className="mt-1 text-xs text-white/50">{video.creator} · {video.category}</p></div></button>)}</div>;
}
