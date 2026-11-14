"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, BookOpen, GraduationCap, RefreshCw } from "lucide-react";
import { DEFAULT_EXPLORE_CATEGORIES, type ExploreCategoryRecord } from "@/lib/catalog/defaultExploreCategories";

type SchoolNode = { id: string; type: string; name: string; parentId?: string | null };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ExploreCategoryRecord[]>(DEFAULT_EXPLORE_CATEGORIES);
  const [nodes, setNodes] = useState<SchoolNode[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/content-categories", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || data.success !== true) throw new Error(data.message || "Catalog load failed");
      const merged = new Map(DEFAULT_EXPLORE_CATEGORIES.map((item) => [item.id, item]));
      for (const item of (data.categories || []) as ExploreCategoryRecord[]) {
        if (item && typeof item.id === "string") merged.set(item.id, { ...merged.get(item.id), ...item });
      }
      setCategories([...merged.values()]);
      setNodes(Array.isArray(data.schoolNodes) ? data.schoolNodes : []);
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Catalog load failed");
    } finally { setBusy(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <main className="min-h-screen bg-[#080d18] px-4 py-6 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-400"><ArrowLeft size={16}/> Admin Dashboard</Link>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Explore catalog overview</p><h1 className="text-2xl font-black sm:text-3xl">Category & School Catalog</h1></div>
          <button type="button" onClick={() => void load()} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm"><RefreshCw size={16}/> Refresh</button>
        </div>
        <section className="mt-5 rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.05] p-5">
          <p className="font-bold text-cyan-100">Teacher / uploader managed catalog</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">अब School की जानकारी, Board, Class, Subject, Book, Chapter और Question संबंधित teacher या uploader स्वयं जोड़ता है। Admin को हर School की जानकारी manually collect या publish नहीं करनी होगी। Admin यहाँ catalog केवल देख सकता है; entries बनाने और बदलने का अधिकार उनके creators के पास है। वीडियो फिर भी सामान्य moderation approval से गुजरेगा।</p>
          <Link href="/videos/upload" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950"><GraduationCap size={17}/> Teacher / Creator Upload खोलें</Link>
        </section>
        {notice && <p role="status" className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm">{notice}</p>}
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold"><BookOpen size={19} className="text-cyan-300"/> Explore Categories ({categories.length})</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((item) => <article key={item.id} className="rounded-xl border border-white/10 bg-black/20 p-3"><h3 className="font-semibold">{item.name}</h3><p className="mt-1 text-xs text-slate-400">{item.description}</p><p className="mt-2 text-xs text-cyan-200">{item.topics.join(" · ")}</p></article>)}
          </div>
        </section>
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-lg font-bold">School Learning Hierarchy ({nodes.length} entries)</h2>
          <p className="mt-1 text-xs text-slate-400">Board → School → Class → Subject / Book → Chapter → Question</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {["board", "school", "class", "subject", "book", "chapter", "question"].map((type) => {
              const group = nodes.filter((node) => node.type === type);
              return <div key={type} className="rounded-xl border border-white/10 bg-black/20 p-3"><p className="font-semibold capitalize">{type} ({group.length})</p><ul className="mt-2 space-y-1 text-xs text-slate-400">{group.slice(0, 12).map((node) => <li key={node.id}>{node.name}</li>)}</ul></div>;
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
