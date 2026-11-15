"use client";

import Link from "next/link";
import { MonetagPlacement } from "@/components/ads/MonetagPlacement";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search, ChevronRight, BookOpen, Hash, Video, PlusCircle, Play, RefreshCw } from "lucide-react";

type Item = { id: string; name: string; type?: string; parentId?: string | null; coverImageUrl?: string | null };
type AnswerVideo = { id: string; caption: string; username: string; videoAccess: "free" | "paid"; videoFormat: "short" | "long"; thumbnail: string | null; createdAt: number | null };

export default function SchoolLearningPage() {
  const [nodes, setNodes] = useState<Item[]>([]);
  const [stage, setStage] = useState(0);
  const [subject, setSubject] = useState<Item | null>(null);
  const [book, setBook] = useState<Item | null>(null);
  const [chapter, setChapter] = useState<Item | null>(null);
  const [question, setQuestion] = useState<Item | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [nextCursors, setNextCursors] = useState<Record<string, string>>({});
  const [hasMore, setHasMore] = useState(false);
  const [videos, setVideos] = useState<AnswerVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (stage >= 4) return;
    let active = true;
    const types = ["subject", "book", "chapter", "question"] as const;
    const type = types[stage];
    const parentId = stage === 1 ? subject?.id : stage === 2 ? book?.id : stage === 3 ? chapter?.id : undefined;
    if (stage > 0 && !parentId) return;
    const cursorKey = `${stage}:${parentId || "root"}:${page}`;
    const cursor = nextCursors[cursorKey];
    const params = new URLSearchParams({ type, pageSize: "24" });
    if (parentId) params.set("parentId", parentId);
    if (cursor) params.set("cursor", cursor);
    setLoading(true);
    setError("");
    fetch(`/api/content-categories?${params.toString()}`, { cache: "no-store" })
      .then(async (response) => { if (!response.ok) throw new Error("Learning Library could not be loaded"); return response.json(); })
      .then((data) => {
        if (!active || data.success !== true) return;
        setNodes(Array.isArray(data.learningNodes) ? data.learningNodes : []);
        setHasMore(data.pagination?.hasMore === true);
        const nextCursor = typeof data.pagination?.nextCursor === "string" ? data.pagination.nextCursor : "";
        if (nextCursor) setNextCursors((current) => ({ ...current, [`${stage}:${parentId || "root"}:${page + 1}`]: nextCursor }));
      })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Library unavailable"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [stage, subject?.id, book?.id, chapter?.id, page]);

  useEffect(() => {
    if (stage !== 4 || !question) return;
    let active = true;
    setVideoLoading(true);
    fetch(`/api/learning/school-video-answers?questionId=${encodeURIComponent(question.id)}`, { cache: "no-store" })
      .then(async (response) => { if (!response.ok) throw new Error("Video answers could not be loaded"); return response.json(); })
      .then((data) => { if (active && data.success === true) setVideos(Array.isArray(data.videos) ? data.videos : []); })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Video answers unavailable"); })
      .finally(() => { if (active) setVideoLoading(false); });
    return () => { active = false; };
  }, [stage, question]);

  const titles = ["Choose Subject", "Choose Book", "Choose Chapter", "Choose Question", "Video Answers"];
  const filtered = useMemo(() => nodes.filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase())), [nodes, query]);
  const visible = filtered;

  function back() {
    if (stage === 0) return;
    setStage((value) => value - 1); setQuery(""); setPage(1); setError("");
  }
  function choose(item: Item) {
    if (stage === 0) setSubject(item);
    if (stage === 1) setBook(item);
    if (stage === 2) setChapter(item);
    if (stage === 3) { setQuestion(item); setVideos([]); }
    setStage((value) => value + 1); setQuery(""); setPage(1);
  }
  function reset() {
    setStage(0); setSubject(null); setBook(null); setChapter(null); setQuestion(null); setQuery(""); setPage(1); setVideos([]); setError("");
  }
  const trail = [subject?.name, book?.name, chapter?.name, question?.name].filter(Boolean);

  return <main className="min-h-screen bg-[#080d18] text-white">
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#080d18]/95 px-4 py-4 backdrop-blur"><div className="mx-auto flex max-w-5xl items-center gap-3"><Link href="/" className="text-sm text-slate-300">JEMBEE <b className="text-cyan-300">PLAY</b></Link><ChevronRight size={15}/><span className="font-semibold">Learning Library</span></div></header>
    <section className="mx-auto max-w-5xl px-4 py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><button onClick={back} disabled={stage === 0} className="rounded-full border border-white/15 p-2 disabled:opacity-30"><ArrowLeft size={19}/></button><div><p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Book-based learning</p><h1 className="text-2xl font-black sm:text-3xl">{titles[stage]}</h1></div></div><button onClick={reset} className="rounded-full border border-white/15 px-3 py-2 text-xs">Start again</button></div>
      <div className="mb-5 flex flex-wrap gap-2">{trail.map((item, index) => <span key={`${item}-${index}`} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{item}</span>)}</div>
      {error && <p role="alert" className="mb-4 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">{error}</p>}
      {stage < 4 ? <>
        <label className="mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"><Search size={19} className="text-slate-400"/><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={stage === 1 ? "Search books on this page…" : stage === 2 ? "Search chapters on this page…" : stage === 3 ? "Search questions on this page…" : "Search subjects on this page…"} className="w-full bg-transparent text-sm outline-none"/></label>
        <div className="mb-3 flex items-center justify-between text-xs text-slate-400"><span>{filtered.length} matches on this page</span><span>Page {page}{hasMore ? " · More pages available" : ""}</span></div>
        {loading ? <div className="flex items-center gap-2 rounded-2xl border border-white/10 p-6 text-sm text-slate-300"><RefreshCw className="animate-spin" size={18}/> Loading Learning Library…</div> : visible.length ? <div className={stage === 1 ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" : "grid gap-3 sm:grid-cols-2"}>{visible.map((item) => <button key={item.id} onClick={() => choose(item)} className={stage === 1 ? "overflow-hidden rounded-2xl border border-white/10 bg-[#111827] text-left transition hover:border-cyan-300/50" : "flex items-center gap-4 rounded-2xl border border-white/10 bg-[#111827] p-4 text-left transition hover:border-cyan-300/50 hover:bg-cyan-400/5"}>{stage === 1 ? <>{item.coverImageUrl ? <img src={item.coverImageUrl} alt={item.name} loading="lazy" className="h-52 w-full bg-white/5 object-contain" referrerPolicy="no-referrer"/> : <div className="grid h-52 place-items-center text-slate-500"><BookOpen size={32}/></div>}<span className="block p-3"><b className="block text-sm">{item.name}</b></span></> : <><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300">{stage === 3 ? <Hash/> : <BookOpen/>}</span><span className="min-w-0 flex-1"><b className="block">{item.name}</b><small className="mt-1 block text-slate-400">{stage === 3 ? "Question number / text" : "Chapter"}</small></span><ChevronRight size={19} className="text-slate-500"/></>}</button>)}</div> : <div className="rounded-2xl border border-dashed border-white/20 p-8 text-center"><p className="font-semibold">इस search के लिए कोई published entry उपलब्ध नहीं है।</p><p className="mt-1 text-sm text-slate-400">Admin Learning Library में verified books, chapters और questions add करेगा।</p></div>}
        <div className="mt-6 flex items-center justify-between"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-white/15 px-4 py-2 text-sm disabled:opacity-30">Previous</button><span className="text-xs text-slate-400">Showing {filtered.length ? (page - 1) * 24 + 1}–{(page - 1) * 24 + filtered.length} on this page</span><button disabled={!hasMore} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-white/15 px-4 py-2 text-sm disabled:opacity-30">Next</button></div>
      </> : <div className="space-y-5">
        <div className="flex gap-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-5">{book?.coverImageUrl ? <img src={book.coverImageUrl} alt={book.name} className="h-28 w-20 rounded-lg object-contain bg-white/5" referrerPolicy="no-referrer"/> : null}<div><p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Selected question</p><h2 className="mt-1 text-xl font-black">{question?.name}</h2><p className="mt-1 text-sm text-slate-400">{subject?.name} / {book?.name} / {chapter?.name}</p></div></div>
        <div className="my-5 flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold">Available video answers</h3><span className="text-xs text-slate-400">Approved videos only</span></div>
        {videoLoading ? <p className="rounded-xl border border-white/10 p-5 text-sm text-slate-300">Loading matching answers…</p> : videos.length ? <div className="grid gap-4 sm:grid-cols-2">{videos.map((video) => <Link key={video.id} href={`/videos/original/${encodeURIComponent(video.id)}`} className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]"><div className="flex aspect-video items-center justify-center bg-black">{video.thumbnail ? <img src={video.thumbnail} alt="Video thumbnail" className="h-full w-full object-cover"/> : <Play size={34} className="text-cyan-300"/>}</div><div className="p-4"><p className="font-bold">{video.caption || "Video answer"}</p><p className="mt-1 text-xs text-slate-400">{video.username} · {video.videoAccess === "paid" ? "Paid" : "Free"} · {video.videoFormat === "short" ? "Shorts" : "Long video"}</p></div></Link>)}</div> : <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center"><Video className="mx-auto mb-3 text-slate-500" size={30}/><p className="font-semibold">इस प्रश्न के लिए अभी कोई approved video answer उपलब्ध नहीं है।</p><p className="mt-2 text-sm text-slate-400">Teacher इस पहले से मौजूद प्रश्न को चुनकर वीडियो अपलोड कर सकता है।</p><Link href={`/videos/upload?category=school&question=${encodeURIComponent(question?.id || "")}`} className="mt-4 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950"><PlusCircle size={16}/> Upload answer video</Link></div>}
      </div>}
      <p className="mt-10 text-center text-xs text-slate-500">Subject → Book cover → Chapter → Question → Matching video answers</p>
      <MonetagPlacement placement="learning-bottom" />
    </section>
  </main>;
}
