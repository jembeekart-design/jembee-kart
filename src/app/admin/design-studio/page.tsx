"use client";

import { useState } from "react";
import {
  Activity, ArrowLeft, Bell, BookOpen, Cast, CheckCircle2, ChevronRight,
  Clapperboard, Compass, Download, Flame, GraduationCap, Heart, Home,
  Library, ListFilter, MessageCircle, Monitor, Play, Search, Share2,
  Smartphone, Sparkles, ThumbsDown, ThumbsUp, Tv, Users, Video, Wallet,
} from "lucide-react";

type ScreenKey = "home" | "shorts" | "library" | "player" | "creator" | "admin";
type Device = "mobile" | "desktop" | "tv";

const screens: { key: ScreenKey; label: string; hint: string; icon: typeof Home }[] = [
  { key: "home", label: "Home", hint: "Mobile and TV discovery", icon: Home },
  { key: "shorts", label: "Shorts", hint: "Vertical swipe experience", icon: Clapperboard },
  { key: "library", label: "Learning Library", hint: "Books, chapters and questions", icon: Library },
  { key: "player", label: "Long Video Player", hint: "Watch, learn and continue", icon: Play },
  { key: "creator", label: "Creator Studio", hint: "Creator overview", icon: Users },
  { key: "admin", label: "Admin Dashboard", hint: "Moderation and controls", icon: Activity },
];

const subjects = [
  { name: "Science", icon: "🧬", color: "from-emerald-500 to-green-900" },
  { name: "Mathematics", icon: "📐", color: "from-violet-500 to-indigo-950" },
  { name: "Social Science", icon: "🌍", color: "from-sky-500 to-blue-950" },
  { name: "English", icon: "📚", color: "from-amber-500 to-orange-950" },
  { name: "Hindi", icon: "अ", color: "from-rose-500 to-pink-950" },
  { name: "Computer", icon: "💻", color: "from-cyan-500 to-slate-950" },
  { name: "General Knowledge", icon: "💡", color: "from-yellow-500 to-amber-950" },
  { name: "Art & Craft", icon: "🎨", color: "from-fuchsia-500 to-purple-950" },
];

const videos = [
  { title: "Photosynthesis in Plants", meta: "Class 7 · Science", duration: "08:24", icon: "🌿", color: "from-emerald-500 via-green-700 to-lime-950" },
  { title: "Respiration in Humans", meta: "Science · Biology", duration: "12:08", icon: "🫁", color: "from-rose-500 via-red-700 to-slate-950" },
  { title: "Cardboard Waste Craft", meta: "Jembee Create", duration: "07:16", icon: "📦", color: "from-amber-500 via-orange-700 to-stone-950" },
  { title: "Reproduction in Plants", meta: "Class 7 · Science", duration: "10:33", icon: "🌸", color: "from-pink-500 via-fuchsia-700 to-violet-950" },
];

function Poster({ video, wide = false }: { video: typeof videos[number]; wide?: boolean }) {
  return <div className={"relative grid aspect-video place-items-center overflow-hidden rounded-xl bg-gradient-to-br " + video.color + (wide ? " w-full" : "")}>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(255,255,255,.22),transparent_35%)]" />
    <span className="relative text-5xl drop-shadow-xl sm:text-6xl">{video.icon}</span>
    <span className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-1 text-[10px] font-bold">{video.duration}</span>
    <span className="absolute bottom-2 left-2 grid h-8 w-8 place-items-center rounded-full bg-black/45"><Play size={15} fill="white" /></span>
  </div>;
}

function VideoCard({ video, compact = false, onClick }: { video: typeof videos[number]; compact?: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={"min-w-0 overflow-hidden rounded-xl border border-white/10 bg-[#151b29] text-left transition hover:border-pink-400/60 " + (compact ? "flex gap-3 p-2" : "")}>
    <div className={compact ? "w-2/5 shrink-0" : ""}><Poster video={video} /></div>
    <div className={compact ? "min-w-0 self-center py-1 pr-1" : "p-2.5"}>
      <p className="line-clamp-2 text-xs font-bold leading-snug sm:text-sm">{video.title}</p>
      <p className="mt-1 text-[10px] text-white/45">{video.meta}</p>
    </div>
  </button>;
}

function Brand() {
  return <div className="flex items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-pink-500 to-fuchsia-700 shadow-lg shadow-pink-900/40"><Play size={17} fill="white" /></span><span className="text-lg font-black tracking-tight">JEMBEE <span className="text-pink-400">PLAY</span></span></div>;
}

export default function DesignStudioPage() {
  const [screen, setScreen] = useState<ScreenKey>("home");
  const [device, setDevice] = useState<Device>("mobile");
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [subject, setSubject] = useState("Science");
  const [notice, setNotice] = useState("Reference-inspired interface preview. All actions are local demo interactions.");
  const active = screens.find((item) => item.key === screen)!;

  const open = (key: ScreenKey) => { setScreen(key); setNotice(screens.find((item) => item.key === key)!.hint + " · Local preview only."); };
  const clickNotice = (message: string) => setNotice(message);

  function HomeView() {
    if (device === "tv" || device === "desktop") return <div className="min-h-[620px] bg-[#080a13] p-5 sm:p-7">
      <div className="mb-6 flex items-center justify-between"><Brand/><nav className="hidden items-center gap-7 text-sm font-semibold text-white/80 md:flex"><button className="rounded-full bg-pink-600 px-5 py-2">Home</button><button onClick={() => open("shorts")}>Shorts</button><button onClick={() => open("library")}>Learning</button><button onClick={() => open("library")}>Library</button><button>Live</button></nav><div className="flex items-center gap-4 text-white/70"><Search/><Bell/><span className="text-xl">👩🏻</span></div></div>
      <div className="grid gap-5 lg:grid-cols-[64px_1fr]"><aside className="hidden flex-col items-center gap-7 rounded-2xl bg-[#111727] py-6 text-white/60 lg:flex"><Home/><Flame/><BookOpen/><Activity/><Wallet/><Sparkles/></aside><div className="min-w-0">
        <div className="relative overflow-hidden rounded-2xl border border-violet-400/20 bg-gradient-to-r from-indigo-950 via-purple-950 to-fuchsia-950 p-7 sm:p-10"><div className="absolute -right-4 -top-8 text-[150px] opacity-20">🎧</div><p className="text-xs font-black uppercase tracking-[.25em] text-pink-300">Videos · Chapters · Questions · Answers</p><h2 className="mt-4 max-w-xl text-4xl font-black leading-tight sm:text-5xl">Learn <span className="text-pink-400">Anytime</span><br/>Anywhere</h2><p className="mt-3 text-sm text-white/70">Watch, learn, create and share with Jembee Play.</p><button onClick={() => open("library")} className="mt-5 rounded-full bg-pink-600 px-6 py-3 text-sm font-bold"><Play className="mr-2 inline" size={15} fill="white"/> Watch Now</button></div>
        <section className="mt-6"><div className="mb-3 flex justify-between"><h3 className="font-bold">Continue Watching</h3><button onClick={() => open("library")} className="text-xs text-pink-300">See all →</button></div><div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{videos.map((v) => <VideoCard key={v.title} video={v} onClick={() => open("player")}/>)}</div></section>
        <section className="mt-7"><div className="mb-3 flex justify-between"><h3 className="font-bold">Trending Videos 🔥</h3><button onClick={() => open("shorts")} className="text-xs text-pink-300">Explore all →</button></div><div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{videos.slice().reverse().map((v) => <VideoCard key={v.title} video={v} onClick={() => open("player")}/>)}</div></section>
      </div></div>
    </div>;

    return <div className="mx-auto min-h-[680px] max-w-[430px] overflow-hidden rounded-[2rem] border-[5px] border-[#242a39] bg-[#05070d]">
      <div className="px-4 pb-5 pt-4"><div className="flex items-center justify-between"><Brand/><div className="flex items-center gap-3 text-white/80"><Cast size={18}/><Bell size={18}/><Search size={19}/><span className="text-xl">👩🏻</span></div></div>
      <div className="mt-5 flex gap-2 overflow-hidden text-xs font-semibold">{["All","Learning","Shorts","Education","Craft"].map((x,i)=><button key={x} onClick={() => i===2?open("shorts"):i===1?open("library"):clickNotice(x+" category selected")} className={"shrink-0 rounded-full px-4 py-2.5 " +(i===0?"bg-pink-600":"bg-white/5 text-white/80")}>{x}</button>)}</div>
      <div className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-950 p-5"><div className="absolute -right-4 top-0 text-7xl opacity-70">👩🏻‍🎓</div><p className="text-[10px] font-black tracking-widest text-pink-200">WATCH · LEARN · CREATE · SHARE</p><h2 className="mt-4 max-w-[230px] text-2xl font-black leading-tight">JEMBEE PLAY <span className="text-pink-400">▶</span></h2><p className="mt-2 text-xs text-white/80">Watch · Learn · Create · Share & Earn</p><button onClick={() => open("library")} className="mt-4 rounded-full bg-pink-600 px-4 py-2 text-xs font-bold">Start Learning</button></div>
      <div className="mt-5 grid grid-cols-5 gap-2">{[{i:"📖",t:"Learning"},{i:"▶️",t:"Shorts"},{i:"📡",t:"Live"},{i:"☁️",t:"Create"},{i:"🪙",t:"Earn"}].map((x,i)=><button key={x.t} onClick={() => i===1?open("shorts"):i===0?open("library"):clickNotice(x.t+" demo selected")} className="flex flex-col items-center gap-1"><span className="grid h-12 w-full place-items-center rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-indigo-950 text-2xl">{x.i}</span><span className="text-[10px]">{x.t}</span></button>)}</div>
      <div className="mt-6 flex items-center justify-between"><h3 className="font-bold">Continue Learning</h3><button onClick={() => open("library")} className="text-xs text-pink-300">See All ›</button></div>
      <button onClick={() => open("player")} className="mt-3 flex w-full gap-3 text-left"><div className="w-1/2 shrink-0"><Poster video={videos[0]}/></div><div className="self-center"><p className="text-sm font-bold">Photosynthesis in Plants | Full Chapter ...</p><p className="mt-1 text-[10px] text-white/45">Class 7 · Science</p><p className="mt-2 text-[10px]">68% watched</p><div className="mt-1 h-1 rounded-full bg-white/15"><div className="h-1 w-2/3 rounded-full bg-pink-500"/></div></div></button>
      <div className="mt-6 flex items-center justify-between"><h3 className="font-bold">Trending Videos 🔥</h3><button onClick={() => open("shorts")} className="text-xs text-pink-300">See All ›</button></div>
      <div className="mt-3 grid grid-cols-2 gap-3">{videos.slice(1).map((v)=><VideoCard key={v.title} video={v} onClick={() => open("player")}/>)}</div>
      </div><nav className="sticky bottom-0 flex justify-around border-t border-white/10 bg-[#0c101b] px-2 py-3 text-[10px] text-white/65">{[{i:Home,t:"Home",k:"home" as ScreenKey},{i:Clapperboard,t:"Shorts",k:"shorts" as ScreenKey},{i:BookOpen,t:"Learning",k:"library" as ScreenKey},{i:Wallet,t:"Earn",k:"creator" as ScreenKey},{i:Library,t:"Library",k:"library" as ScreenKey}].map((x)=>{const I=x.i;return <button key={x.t} onClick={()=>open(x.k)} className={"flex flex-col items-center gap-1 "+(screen===x.k?"text-pink-400":"")}><I size={19}/>{x.t}</button>})}</nav>
    </div>;
  }

  function ShortsView() {
    return <div className="mx-auto flex min-h-[650px] max-w-[390px] flex-col justify-between overflow-hidden rounded-[2rem] border-[5px] border-[#252b38] bg-black p-4"><div className="flex justify-between"><button onClick={()=>open("home")}><ArrowLeft/></button><b>Shorts</b><Search/><span>⋮</span></div><div className="relative my-4 flex flex-1 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-pink-500 to-purple-900"><span className="text-8xl">🖍️</span><p className="mt-5 text-center text-xl font-black">DIY Pen Holder from Waste Cardboard</p><p className="mt-2 text-sm">Easy Craft Ideas 🌿</p><div className="absolute bottom-5 left-4 text-sm font-bold">@JembeeCreate · <button onClick={()=>setFollowing(!following)} className="rounded-full bg-pink-600 px-3 py-1">{following?"Following":"Subscribe"}</button><p className="mt-2 text-xs">#craft #diy #wastematerial</p></div><div className="absolute bottom-8 right-3 grid gap-5 text-center">{[{I:Heart,t:liked?"12.5K":"12.4K",f:()=>setLiked(!liked)},{I:ThumbsDown,t:"Dislike",f:()=>clickNotice("Dislike demo selected")},{I:MessageCircle,t:"256",f:()=>clickNotice("Comments panel preview")},{I:Share2,t:"Share",f:()=>clickNotice("Share sheet preview") }].map((x,i)=>{const I=x.I;return <button key={i} onClick={x.f} className="grid justify-items-center gap-1"><I size={22} fill={i===0&&liked?"white":"none"}/><span className="text-[10px]">{x.t}</span></button>})}</div></div><p className="text-center text-xs text-white/45">Swipe up for next short · demo only</p></div>;
  }

  function LibraryView() {
    return <div className="min-h-[620px] bg-[#080b14] p-4 sm:p-7"><div className="flex items-center justify-between"><button onClick={()=>open("home")} className="flex items-center gap-2 text-lg font-bold"><ArrowLeft/> Learning Library</button><div className="flex gap-4"><Search/><ListFilter/></div></div><div className="mt-6 flex gap-2"><button className="rounded-full bg-pink-600 px-5 py-2 text-sm font-bold">Books</button><button className="rounded-full bg-white/10 px-5 py-2 text-sm">Chapters</button><button className="rounded-full bg-white/10 px-5 py-2 text-sm">Questions</button></div><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{subjects.map((s)=><button key={s.name} onClick={()=>{setSubject(s.name);clickNotice(s.name+" subject selected. Next: choose book, chapter and question.");}} className={"flex min-h-36 flex-col items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br "+s.color+" p-3"}><span className="text-4xl">{s.icon}</span><span className="mt-3 text-center text-sm font-bold">{s.name}</span></button>)}</div><div className="mt-6 rounded-2xl border border-white/10 bg-[#151b29] p-4"><p className="text-xs text-pink-300">SELECTED SUBJECT</p><h3 className="mt-1 text-xl font-black">{subject}</h3><p className="mt-2 text-sm text-white/55">Choose a book, then a chapter and question number to find its video answer.</p><div className="mt-4 flex items-center justify-between rounded-xl bg-black/20 p-3"><span className="text-sm font-bold">Our Environment and Science</span><ChevronRight/></div></div></div>;
  }

  function PlayerView() {
    return <div className="min-h-[620px] bg-[#080b14] p-4 sm:p-6"><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]"><div><div className="relative grid aspect-video place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-700 via-green-900 to-slate-950"><span className="text-8xl">🌿</span><button onClick={()=>clickNotice("Video playback is a visual prototype; no media stream is connected.")} className="absolute grid h-14 w-14 place-items-center rounded-full bg-pink-600"><Play fill="white"/></button><div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20"><div className="h-full w-1/3 bg-pink-500"/></div></div><h2 className="mt-4 text-xl font-black">Photosynthesis in Plants | Full Chapter Explanation</h2><p className="mt-1 text-xs text-white/50">Class 7 · Science · 1.2M views · 3 months ago</p><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4"><div className="flex items-center gap-2"><span className="text-2xl">▶️</span><div><b className="text-sm">Jembee Learning</b><p className="text-[10px] text-white/45">1.4M subscribers</p></div><button onClick={()=>setFollowing(!following)} className="ml-2 rounded-full bg-pink-600 px-4 py-2 text-xs font-bold">{following?"Subscribed":"Subscribe"}</button></div><div className="flex gap-4 text-xs"><button onClick={()=>setLiked(!liked)}><ThumbsUp className="mr-1 inline" size={15}/>{liked?"32.1K":"32K"}</button><button><Share2 className="mr-1 inline" size={15}/>Share</button><button><Download className="mr-1 inline" size={15}/>Save</button></div></div><p className="mt-4 text-sm text-white/65">Learn how green plants prepare their food through photosynthesis. Continue with the next chapter videos.</p></div><aside><h3 className="mb-3 font-bold">Up Next</h3><div className="grid gap-3">{videos.slice(1).map(v=><VideoCard key={v.title} video={v} compact onClick={()=>clickNotice(v.title+" selected in Up Next.")}/>)}</div></aside></div></div>;
  }

  function OtherView() {
    const isAdmin = screen === "admin";
    return <div className="min-h-[620px] bg-[#080b14] p-6"><p className="text-xs font-black uppercase tracking-widest text-pink-300">{isAdmin?"Admin Control Center":"Creator Studio"}</p><h2 className="mt-2 text-3xl font-black">{isAdmin?"Platform overview":"Your creator overview"}</h2><p className="mt-2 text-sm text-white/50">Illustrative sample data only. No account, moderation or payout API is connected.</p><div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">{(isAdmin?[["Pending videos","18"],["Learning entries","240"],["Reports","03"],["Active creators","1.2K"],["Demo sessions","86"],["System status","Healthy"]]:[["Videos","24"],["Views","18.4K"],["Followers","1,280"]]).map(([a,b])=><div key={a} className="rounded-2xl border border-white/10 bg-[#151b29] p-5"><p className="text-xs text-white/45">{a}</p><p className="mt-2 text-2xl font-black">{b}</p></div>)}</div><div className="mt-6 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-100">Safe preview: upload, approval, payment, payouts and destructive admin actions are disabled.</div></div>;
  }

  return <main className="min-h-screen bg-[#070911] p-3 text-white sm:p-6"><div className="mx-auto max-w-[1500px]"><header className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><a href="/admin" className="inline-flex items-center gap-2 text-xs text-white/45"><ArrowLeft size={14}/> Admin</a><div className="mt-2 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-700"><Sparkles/></span><div><p className="text-xs font-bold tracking-[.2em] text-pink-300">JEMBEE PLAY</p><h1 className="text-xl font-black sm:text-2xl">Premium Experience Studio</h1></div></div></div><div className="flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-200"><CheckCircle2 size={14}/> SAFE DEMO MODE</div></header>
    <div className="grid gap-3 lg:grid-cols-[250px_minmax(0,1fr)]"><aside className="rounded-2xl border border-white/10 bg-white/[.03] p-3"><p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[.2em] text-white/35">Screens & experiences</p><nav className="grid grid-cols-2 gap-2 lg:grid-cols-1">{screens.map((s)=>{const I=s.icon;return <button key={s.key} onClick={()=>open(s.key)} className={"flex items-center gap-3 rounded-xl p-3 text-left "+(screen===s.key?"border border-pink-400/30 bg-pink-500/10 text-pink-100":"text-white/65 hover:bg-white/5")}><I size={18}/><span><b className="block text-sm">{s.label}</b><small className="hidden text-[10px] text-white/40 sm:block">{s.hint}</small></span></button>})}</nav><div className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/5 p-3 text-xs leading-relaxed text-amber-100/80"><b className="block text-amber-100">Isolated preview</b>No database, payment, upload, ad, payout or production API is connected.</div></aside>
    <section className="min-w-0 rounded-2xl border border-white/10 bg-white/[.03] p-3 sm:p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs text-white/40">REFERENCE-INSPIRED PREVIEW</p><h2 className="mt-1 text-lg font-black">{active.label}</h2><p className="text-xs text-white/50">{active.hint}</p></div><div className="flex gap-1 rounded-xl border border-white/10 bg-black/20 p-1"><button aria-label="Mobile preview" onClick={()=>setDevice("mobile")} className={"rounded-lg px-3 py-2 "+(device==="mobile"?"bg-pink-500 text-white":"text-white/60")}><Smartphone size={17}/></button><button aria-label="Desktop preview" onClick={()=>setDevice("desktop")} className={"rounded-lg px-3 py-2 "+(device==="desktop"?"bg-pink-500 text-white":"text-white/60")}><Monitor size={17}/></button><button aria-label="TV preview" onClick={()=>setDevice("tv")} className={"rounded-lg px-3 py-2 "+(device==="tv"?"bg-pink-500 text-white":"text-white/60")}><Tv size={17}/></button></div></div>
    <div className="flex min-h-[650px] justify-center overflow-auto rounded-xl bg-[#02040a] p-2 sm:p-4"><div className={"w-full overflow-hidden border border-white/10 shadow-2xl "+(device==="mobile"?"max-w-[430px] rounded-[2rem]":"rounded-xl")+(device==="tv"?" max-w-[1250px]":"")}>{screen==="home"?<HomeView/>:screen==="shorts"?<ShortsView/>:screen==="library"?<LibraryView/>:screen==="player"?<PlayerView/>:<OtherView/>}</div></div>
    <div className="mt-4 rounded-xl border border-pink-300/15 bg-pink-300/5 p-4"><div className="flex items-center gap-2 text-sm font-bold text-pink-100"><Activity size={16}/>{notice}</div><p className="mt-1 text-[10px] text-white/45">Prototype only · interactions do not save to production.</p></div></section></div>
    <footer className="mt-4 flex flex-wrap justify-between gap-2 text-[11px] text-white/35"><span>Design direction based on supplied Jembee Play reference</span><span>Demo state resets when refreshed</span></footer></div></main>;
}
