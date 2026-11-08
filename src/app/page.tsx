"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Menu, Home, Compass, PlaySquare, History, GraduationCap, PlusSquare, Bell, UserCircle, Flame, ThumbsUp, Clock3, Radio, BookOpen, ChevronRight } from "lucide-react";

type Video = { title: string; creator: string; views: string; age: string; duration: string; image: string; category: string; kind?: string };
const videos: Video[] = [
 {title:"Class 10 Maths | Real Numbers | Complete Chapter Explanation",creator:"Jembee Learning Demo",views:"12K views",age:"2 days ago",duration:"18:42",image:"https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=720&auto=format&fit=crop&q=80",category:"Education"},
 {title:"How to solve algebra equations step by step",creator:"Study Studio Demo",views:"8.4K views",age:"1 week ago",duration:"12:08",image:"https://images.unsplash.com/photo-1509062522246-3755977927d7?w=720&auto=format&fit=crop&q=80",category:"Education"},
 {title:"Amazing science experiment you can try at home",creator:"Science World Demo",views:"31K views",age:"3 days ago",duration:"09:31",image:"https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=720&auto=format&fit=crop&q=80",category:"Science"},
 {title:"Learn English speaking: 10 daily-use sentences",creator:"English Path Demo",views:"5.2K views",age:"5 days ago",duration:"07:54",image:"https://images.unsplash.com/photo-1455390582262-044cdead277a?w=720&auto=format&fit=crop&q=80",category:"Learning"},
 {title:"Beautiful nature and relaxing travel moments",creator:"Explore India Demo",views:"19K views",age:"1 day ago",duration:"14:15",image:"https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=720&auto=format&fit=crop&q=80",category:"Travel"},
 {title:"Computer basics: understand the internet",creator:"Digital Skills Demo",views:"2.1K views",age:"6 days ago",duration:"11:20",image:"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=720&auto=format&fit=crop&q=80",category:"Technology"},
];
const chips=["All","Education","Music","Science","Technology","Gaming","Live","Learning","Travel","Shorts"];
export default function HomePage(){
 const [query,setQuery]=useState(""); const [active,setActive]=useState("All"); const [sidebar,setSidebar]=useState(true);
 const filtered=useMemo(()=>videos.filter(v=>(active==="All"||v.category===active||active==="Shorts")&&(`${v.title} ${v.creator} ${v.category}`).toLowerCase().includes(query.toLowerCase())),[active,query]);
 return <main className="min-h-screen bg-[#0b0b0b] text-white">
  <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-white/10 bg-[#0b0b0b]/95 px-4 backdrop-blur">
   <button aria-label="Toggle menu" onClick={()=>setSidebar(!sidebar)} className="rounded-full p-2 hover:bg-white/10"><Menu size={23}/></button>
   <Link href="/" className="flex min-w-fit items-center gap-1 text-xl font-black tracking-tight">JEMBEE <span className="text-cyan-400">PLAY</span><PlaySquare size={19} className="ml-1 text-cyan-400"/></Link>
   <div className="mx-auto flex w-full max-w-2xl items-center">
    <div className="flex w-full overflow-hidden rounded-full border border-white/20 bg-[#121212]"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search videos, teachers and topics" className="w-full bg-transparent px-5 py-2.5 text-sm outline-none"/><button aria-label="Search" className="border-l border-white/15 bg-white/5 px-5"><Search size={19}/></button></div>
   </div>
   <Link href="/videos/upload" className="hidden items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold sm:flex"><PlusSquare size={18}/> Create</Link>
   <button aria-label="Notifications" className="rounded-full p-2 hover:bg-white/10"><Bell size={21}/></button><Link href="/account" aria-label="Profile"><UserCircle size={27}/></Link>
  </header>
  <div className="flex">
   {sidebar&&<aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-60 shrink-0 overflow-y-auto border-r border-white/10 p-3 md:block">
    {[[Home,"Home","/"],[PlaySquare,"Shorts","/shorts"],[Compass,"Explore","/explore"],[GraduationCap,"School Learning","/learn/school"],[History,"History","/account"],[ThumbsUp,"Liked videos","/account"]].map(([Icon,label,href]:any)=><Link key={label} href={href} className="flex items-center gap-5 rounded-xl px-4 py-3 text-sm hover:bg-white/10"><Icon size={21}/>{label}</Link>)}
    <div className="my-3 border-t border-white/10"/><p className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">Learning</p><Link href="/learn/school" className="flex items-center gap-5 rounded-xl px-4 py-3 text-sm hover:bg-white/10"><BookOpen size={21}/>Boards & Books</Link>
    <p className="mt-8 px-4 text-xs text-slate-500">JEMBEE PLAY · Watch • Learn • Create • Share • Earn</p>
   </aside>}
   <section className="min-w-0 flex-1 px-4 pb-24 pt-4 md:px-6">
    <div className="sticky top-16 z-30 -mx-4 mb-5 flex gap-3 overflow-x-auto bg-[#0b0b0b] px-4 py-2 [scrollbar-width:none] md:-mx-6 md:px-6">{chips.map(c=><button key={c} onClick={()=>setActive(c)} className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-semibold ${active===c?"bg-white text-black":"bg-white/10 text-white hover:bg-white/20"}`}>{c}</button>)}</div>
    <div className="mb-5 rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-950/70 to-violet-950/50 p-5 sm:flex sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Jembee Play Learning</p><h1 className="mt-1 text-2xl font-black">अपनी किताब का हर सवाल सीखें</h1><p className="mt-1 text-sm text-slate-300">Board → School → Book → Chapter → Question → Video Answer</p></div><Link href="/learn/school" className="mt-4 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 sm:mt-0">Find your school <ChevronRight size={17}/></Link></div>
    <div className="mb-4 flex items-center gap-2 text-xs text-slate-400"><Radio size={15} className="text-red-400"/> Video recommendations <span>·</span><span>Sample preview cards until live feed integration is verified</span></div>
    <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((v,i)=><article key={v.title} className="min-w-0"><Link href="/shorts" className="group relative block overflow-hidden rounded-xl bg-[#202020]"><img src={v.image} alt="" loading={i<3?"eager":"lazy"} fetchPriority={i<2?"high":"auto"} className="aspect-video w-full object-cover transition group-hover:scale-[1.02]"/><span className="absolute bottom-2 right-2 rounded bg-black/85 px-1.5 py-0.5 text-xs font-semibold">{v.duration}</span></Link><div className="mt-3 flex gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 font-black text-slate-950">J</div><div className="min-w-0"><Link href="/shorts" className="line-clamp-2 text-sm font-bold leading-5">{v.title}</Link><p className="mt-1 text-xs text-slate-400">{v.creator}</p><p className="text-xs text-slate-400">{v.views} · {v.age}</p></div></div></article>)}</div>
    {filtered.length===0&&<p className="py-16 text-center text-slate-400">No matching videos. Try another search.</p>}
    <div className="mt-10 rounded-xl border border-dashed border-white/15 p-4 text-center"><p className="text-xs font-semibold text-slate-400">Sponsored placement</p><p className="mt-1 text-sm">Admin-controlled ad slot · Ad serving subject to policy and verification</p></div>
   </section>
  </div>
  <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-white/10 bg-[#0b0b0b]/95 px-2 py-2 backdrop-blur md:hidden">{[[Home,"Home","/"],[PlaySquare,"Shorts","/shorts"],[PlusSquare,"Create","/videos/upload"],[GraduationCap,"Learn","/learn/school"],[UserCircle,"You","/account"]].map(([Icon,label,href]:any)=><Link key={label} href={href} className="flex flex-col items-center gap-1 px-2 py-1 text-[10px] text-slate-300"><Icon size={21}/>{label}</Link>)}</nav>
 </main>
}
