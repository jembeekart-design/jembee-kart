"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search, ChevronRight, GraduationCap, BookOpen, LibraryBig, Hash, Video, PlusCircle, SlidersHorizontal, Play, RefreshCw } from "lucide-react";

type Item = { id: string; name: string; detail?: string; type?: string; parentId?: string | null };
type AnswerVideo = { id: string; caption: string; username: string; videoAccess: "free" | "paid"; videoFormat: "short" | "long"; thumbnail: string | null; createdAt: number | null };

export default function SchoolLearningPage() {
  const [nodes, setNodes] = useState<Item[]>([]);
  const [stage, setStage] = useState(0);
  const [board, setBoard] = useState<Item | null>(null);
  const [school, setSchool] = useState<Item | null>(null);
  const [klass, setKlass] = useState<Item | null>(null);
  const [subjectOrBook, setSubjectOrBook] = useState<Item | null>(null);
  const [chapter, setChapter] = useState<Item | null>(null);
  const [question, setQuestion] = useState<Item | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [videos, setVideos] = useState<AnswerVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/content-categories", { cache: "no-store" })
      .then(async (response) => { if (!response.ok) throw new Error("School catalog could not be loaded"); return response.json(); })
      .then((data) => { if (active && data.success === true) setNodes(Array.isArray(data.schoolNodes) ? data.schoolNodes : []); })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Catalog unavailable"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (stage !== 6 || !question) return;
    let active = true;
    setVideoLoading(true);
    fetch(`/api/learning/school-video-answers?questionId=${encodeURIComponent(question.id)}`, { cache: "no-store" })
      .then(async (response) => { if (!response.ok) throw new Error("Video answers could not be loaded"); return response.json(); })
      .then((data) => { if (active && data.success === true) setVideos(Array.isArray(data.videos) ? data.videos : []); })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Video answers unavailable"); })
      .finally(() => { if (active) setVideoLoading(false); });
    return () => { active = false; };
  }, [stage, question]);

  const titles = ["Choose Board / Pattern", "Find your School", "Choose Class", "Choose Subject / Book", "Choose Chapter", "Choose Question", "Video Answers"];
  const list = useMemo<Item[]>(() => {
    if (stage === 0) return nodes.filter((item) => item.type === "board");
    if (stage === 1) return nodes.filter((item) => item.type === "school" && item.parentId === board?.id);
    if (stage === 2) return nodes.filter((item) => item.type === "class" && item.parentId === school?.id);
    if (stage === 3) return nodes.filter((item) => (item.type === "subject" || item.type === "book") && item.parentId === klass?.id);
    if (stage === 4) return nodes.filter((item) => item.type === "chapter" && item.parentId === subjectOrBook?.id);
    if (stage === 5) return nodes.filter((item) => item.type === "question" && item.parentId === chapter?.id);
    return [];
  }, [nodes, stage, board, school, klass, subjectOrBook, chapter]);
  const filtered = useMemo(() => list.filter((item) => `${item.name} ${item.detail || ""}`.toLowerCase().includes(query.toLowerCase())), [list, query]);
  const pageSize = 10;
  const total = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  function back() {
    if (stage === 0) return;
    setStage((value) => value - 1); setQuery(""); setPage(1); setError("");
  }
  function choose(item: Item) {
    if (stage === 0) setBoard(item);
    if (stage === 1) setSchool(item);
    if (stage === 2) setKlass(item);
    if (stage === 3) setSubjectOrBook(item);
    if (stage === 4) setChapter(item);
    if (stage === 5) { setQuestion(item); setVideos([]); }
    setStage((value) => value + 1); setQuery(""); setPage(1);
  }
  function reset() {
    setStage(0); setBoard(null); setSchool(null); setKlass(null); setSubjectOrBook(null); setChapter(null); setQuestion(null); setQuery(""); setPage(1); setVideos([]); setError("");
  }
  const trail = [board?.name, school?.name, klass?.name, subjectOrBook?.name, chapter?.name, question?.name].filter(Boolean);

  return <main className="min-h-screen bg-[#080d18] text-white">
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#080d18]/95 px-4 py-4 backdrop-blur"><div className="mx-auto flex max-w-5xl items-center gap-3"><Link href="/" className="text-sm text-slate-300">JEMBEE <b className="text-cyan-300">PLAY</b></Link><ChevronRight size={15}/><span className="font-semibold">School Learning</span></div></header>
    <section className="mx-auto max-w-5xl px-4 py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><button onClick={back} disabled={stage === 0} className="rounded-full border border-white/15 p-2 disabled:opacity-30"><ArrowLeft size={19}/></button><div><p className="text-xs font-bold uppercase tracking-widest text-cyan-300">School learning pathway</p><h1 className="text-2xl font-black sm:text-3xl">{titles[stage]}</h1></div></div><button onClick={reset} className="rounded-full border border-white/15 px-3 py-2 text-xs">Start again</button></div>
      <div className="mb-5 flex flex-wrap gap-2">{trail.map((item, index) => <span key={`${item}-${index}`} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{item}</span>)}</div>
      {error && <p role="alert" className="mb-4 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">{error}</p>}
      {stage < 6 ? <>
        <label className="mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"><Search size={19} className="text-slate-400"/><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={`Search ${titles[stage].toLowerCase()}...`} className="w-full bg-transparent text-sm outline-none"/><SlidersHorizontal size={17} className="text-slate-500"/></label>
        <div className="mb-3 flex items-center justify-between text-xs text-slate-400"><span>{filtered.length} results</span><span>Page {page} of {total}</span></div>
        {loading ? <div className="flex items-center gap-2 rounded-2xl border border-white/10 p-6 text-sm text-slate-300"><RefreshCw className="animate-spin" size={18}/> Loading school catalog…</div> : visible.length ? <div className="grid gap-3 sm:grid-cols-2">{visible.map((item) => <button key={item.id} onClick={() => choose(item)} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#111827] p-4 text-left transition hover:border-cyan-300/50 hover:bg-cyan-400/5"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300">{stage === 0 ? <GraduationCap/> : stage === 1 ? <LibraryBig/> : stage === 2 ? <GraduationCap/> : stage === 3 ? <BookOpen/> : stage === 4 ? <BookOpen/> : <Hash/>}</span><span className="min-w-0 flex-1"><b className="block">{item.name}</b><small className="mt-1 block text-slate-400">{item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : "Browse available learning content"}</small></span><ChevronRight size={19} className="text-slate-500"/></button>)}</div> : <div className="rounded-2xl border border-dashed border-white/20 p-8 text-center"><p className="font-semibold">{stage === 0 ? "अभी कोई published Board नहीं है।" : "इस स्तर के लिए अभी कोई published entry उपलब्ध नहीं है।"}</p><p className="mt-1 text-sm text-slate-400">Teacher या uploader अपने अनुसार Board, School, Class, Subject / Book, Chapter और Question जोड़ सकते हैं।</p><Link href="/videos/upload" className="mt-4 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950"><PlusCircle size={16}/> Teacher Catalog</Link></div>}
        <div className="mt-6 flex items-center justify-between"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-white/15 px-4 py-2 text-sm disabled:opacity-30">Previous</button><span className="text-xs text-slate-400">Showing {filtered.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span><button disabled={page >= total} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-white/15 px-4 py-2 text-sm disabled:opacity-30">Next</button></div>
      </> : <>
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-5"><p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Selected question</p><h2 className="mt-1 text-xl font-black">{question?.name} · {chapter?.name}</h2><p className="mt-1 text-sm text-slate-400">{board?.name} / {school?.name} / {klass?.name} / {subjectOrBook?.name}</p></div>
        <div className="my-5 flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold">Available video answers</h3><span className="text-xs text-slate-400">Approved videos only</span></div>
        {videoLoading ? <p className="rounded-xl border border-white/10 p-5 text-sm text-slate-300">Loading matching answers…</p> : videos.length ? <div className="grid gap-4 sm:grid-cols-2">{videos.map((video) => <Link key={video.id} href={`/videos/original/${encodeURIComponent(video.id)}`} className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]"><div className="flex aspect-video items-center justify-center bg-black">{video.thumbnail ? <img src={video.thumbnail} alt="Video thumbnail" className="h-full w-full object-cover"/> : <Play size={34} className="text-cyan-300"/>}</div><div className="p-4"><p className="font-bold">{video.caption || "Video answer"}</p><p className="mt-1 text-xs text-slate-400">{video.username} · {video.videoAccess === "paid" ? "Paid" : "Free"} · {video.videoFormat === "short" ? "Shorts" : "Long video"}</p></div></Link>)}</div> : <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center"><Video className="mx-auto mb-3 text-slate-500" size={30}/><p className="font-semibold">इस प्रश्न के लिए अभी कोई approved video answer उपलब्ध नहीं है।</p><p className="mt-2 text-sm text-slate-400">Teacher या creator इस प्रश्न को चुनकर वीडियो अपलोड कर सकते हैं। Admin approval के बाद वीडियो यहाँ दिखाई देगा।</p><Link href={`/videos/upload?category=school&question=${encodeURIComponent(question?.id || "")}`} className="mt-4 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950"><PlusCircle size={16}/> Upload answer video</Link></div>}
      </>}
      <p className="mt-10 text-center text-xs text-slate-500">Teachers and uploaders contribute School catalog entries. Search and pagination keep large learning lists manageable.</p>
    </section>
  </main>;
}
