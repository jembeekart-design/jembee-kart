"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Search, Play, BookOpen, GraduationCap, Sprout, Laptop, Stethoscope, Wrench,
  PawPrint, Languages, BriefcaseBusiness, Palette, Trophy, Music, Leaf, Video,
  ChevronRight, Sparkles, History, ChefHat, House, Briefcase, Scale, Baby,
} from "lucide-react";
import { MonetagPlacement } from "@/components/ads/MonetagPlacement";
import { DEFAULT_EXPLORE_CATEGORIES, type ExploreCategoryRecord } from "@/lib/catalog/defaultExploreCategories";

type SchoolNode = { id: string; type: string; name: string; parentId?: string | null };
const iconMap = {
  "graduation-cap": GraduationCap, "book-open": BookOpen, sprout: Sprout, laptop: Laptop,
  stethoscope: Stethoscope, wrench: Wrench, "paw-print": PawPrint, languages: Languages,
  "briefcase-business": BriefcaseBusiness, palette: Palette, trophy: Trophy, music: Music,
  leaf: Leaf, history: History, "chef-hat": ChefHat, house: House, briefcase: Briefcase,
  scale: Scale, baby: Baby,
} as const;

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [categories, setCategories] = useState<ExploreCategoryRecord[]>(DEFAULT_EXPLORE_CATEGORIES);
  const [schoolNodes, setSchoolNodes] = useState<SchoolNode[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/content-categories", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Catalog unavailable");
        return response.json();
      })
      .then((data) => {
        if (!active || data.success !== true) return;
        const published = Array.isArray(data.categories) ? data.categories as ExploreCategoryRecord[] : [];
        const merged = new Map(DEFAULT_EXPLORE_CATEGORIES.map((item) => [item.id, item]));
        for (const item of published) {
          if (item && typeof item.id === "string" && typeof item.name === "string") {
            merged.set(item.id, { ...merged.get(item.id), ...item, topics: Array.isArray(item.topics) ? item.topics : [] });
          }
        }
        setCategories([...merged.values()]);
        setSchoolNodes(Array.isArray(data.schoolNodes) ? data.schoolNodes : []);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => categories.filter((category) =>
    `${category.name} ${category.description} ${category.topics.join(" ")}`.toLowerCase().includes(query.toLowerCase())
  ), [categories, query]);
  const active = categories.find((category) => category.id === selected);
  const schoolBoards = schoolNodes.filter((node) => node.type === "board");

  return (
    <main className="min-h-screen bg-[#080d18] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#080d18]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3"><div><p className="text-xl font-black tracking-tight">JEMBEE <span className="text-cyan-400">PLAY</span></p><p className="text-xs text-slate-400">Explore • Watch • Learn</p></div><Link href="/shorts" className="flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950"><Play size={16}/> Shorts</Link></div>
      </header>
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-7">
        <div className="mb-6"><p className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyan-300"><Sparkles size={16}/> Explore Jembee</p><h1 className="text-3xl font-black leading-tight sm:text-4xl">हर रुचि, हर हुनर के लिए <span className="text-cyan-300">एक जगह</span></h1><p className="mt-2 max-w-2xl text-sm text-slate-400">Short videos dekhein, nayi skills seekhein aur apna knowledge share karein.</p></div>
        <label className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><Search className="text-slate-400" size={20}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="School, krishi, computer, teacher ya topic khojein..." className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"/></label>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Explore Categories</h2><span className="text-xs text-slate-500">Swipe karein →</span></div>
        <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:thin]">
          {filtered.map((category) => {
            const Icon = iconMap[category.iconKey as keyof typeof iconMap] || BookOpen;
            return <button key={category.id} onClick={() => setSelected(selected === category.id ? null : category.id)} aria-pressed={selected === category.id} className={`group flex w-[104px] shrink-0 snap-start flex-col items-center gap-2 rounded-2xl p-2 text-center transition ${selected === category.id ? "bg-cyan-400/15" : "hover:bg-white/5"}`}><span className={`grid h-[76px] w-[76px] place-items-center rounded-full border bg-gradient-to-br from-white/10 to-white/[0.02] shadow-lg transition group-hover:-translate-y-1 ${selected === category.id ? "border-cyan-300 ring-2 ring-cyan-300/30" : "border-white/10"}`}><Icon size={30} className={selected === category.id ? "text-cyan-300" : "text-slate-100"}/></span><span className="text-xs font-semibold">{category.name}</span></button>;
          })}
          {filtered.length === 0 && <p className="py-8 text-sm text-slate-400">कोई matching category नहीं मिली।</p>}
        </div>
        {active && <section className="mb-7 rounded-3xl border border-cyan-300/20 bg-cyan-300/5 p-5">
          <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Selected category</p><h3 className="mt-1 text-2xl font-black">{active.name}</h3><p className="mt-1 text-sm text-slate-400">{active.description}</p></div><button onClick={() => setSelected(null)} className="rounded-full border border-white/15 px-3 py-1 text-xs">Close</button></div>
          <div className="mt-4 flex flex-wrap gap-2">{active.topics.map((topic) => <span key={topic} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200">{topic}</span>)}</div>
          {(active.schoolSpecial || active.id === "school") && <div className="mt-5 rounded-2xl border border-cyan-300/15 bg-[#081421] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs font-bold uppercase tracking-wider text-cyan-300">Dedicated School Learning</p><h4 className="mt-1 text-lg font-bold">Board → School → Class → Subject / Book → Chapter → Question</h4></div><Link href="/learn/school" className="rounded-full bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950">Open School Learning</Link></div>
            {schoolBoards.length > 0 ? <div className="mt-4 space-y-3">{schoolBoards.map((board) => { const schools = schoolNodes.filter((node) => node.type === "school" && node.parentId === board.id); return <div key={board.id} className="rounded-xl border border-white/10 p-3"><p className="font-semibold text-cyan-100">{board.name}</p><div className="mt-2 flex flex-wrap gap-2">{schools.map((school) => <Link key={school.id} href={`/learn/school?board=${encodeURIComponent(board.id)}&school=${encodeURIComponent(school.id)}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs">{school.name}</Link>)}</div></div>; })}</div> : <p className="mt-3 text-xs text-slate-400">School Boards और Schools teacher / uploader द्वारा जोड़ने पर यहाँ दिखेंगे।</p>}
          </div>}
          <p className="mt-4 text-xs text-slate-500">Categories और topics Admin Catalog से नियंत्रित होते हैं। केवल published School entries सार्वजनिक रूप से दिखाई जाती हैं।</p>
        </section>}
        <section className="mb-7 grid gap-3 sm:grid-cols-2"><Link href="/shorts" className="flex items-center justify-between rounded-3xl border border-white/10 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/10 p-5"><div><p className="text-xs font-bold text-violet-200">ENTERTAINMENT & LEARNING</p><h3 className="mt-1 text-xl font-black">Watch Shorts</h3><p className="mt-1 text-xs text-slate-400">Vertical video feed</p></div><Video size={34} className="text-violet-200"/></Link><Link href="/videos/upload" className="flex items-center justify-between rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-500/15 to-cyan-500/10 p-5"><div><p className="text-xs font-bold text-emerald-200">CREATE & TEACH</p><h3 className="mt-1 text-xl font-black">Share Knowledge</h3><p className="mt-1 text-xs text-slate-400">Upload under a category or school question</p></div><GraduationCap size={36} className="text-emerald-200"/></Link></section>
        <MonetagPlacement placement="explore-bottom" />
        <div className="mt-8 flex items-center justify-between text-xs text-slate-500"><span>JEMBEE PLAY • Explore</span><span className="flex items-center gap-1">More categories <ChevronRight size={14}/></span></div>
      </section>
    </main>
  );
}
