"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, BookOpen, RefreshCw, Trash2, Pencil, Save, ImagePlus } from "lucide-react";
import { auth } from "@/firebase/config";
import { DEFAULT_EXPLORE_CATEGORIES, type ExploreCategoryRecord } from "@/lib/catalog/defaultExploreCategories";

type NodeType = "subject" | "book" | "chapter" | "question";
type LearningNode = {
  id: string;
  type: NodeType;
  name: string;
  parentId?: string | null;
  coverImageUrl?: string | null;
};
const TYPES: { value: NodeType; label: string; parent?: NodeType[] }[] = [
  { value: "subject", label: "Subject" },
  { value: "book", label: "Book", parent: ["subject"] },
  { value: "chapter", label: "Chapter", parent: ["book"] },
  { value: "question", label: "Question", parent: ["chapter"] },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ExploreCategoryRecord[]>(DEFAULT_EXPLORE_CATEGORIES);
  const [nodes, setNodes] = useState<LearningNode[]>([]);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [notice, setNotice] = useState("");
  const [type, setType] = useState<NodeType>("subject");
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [editingId, setEditingId] = useState("");

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/content-categories?type=subject&pageSize=50", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || data.success !== true) throw new Error(data.message || "Library load failed");
      const merged = new Map(DEFAULT_EXPLORE_CATEGORIES.map((item) => [item.id, item]));
      for (const item of (data.categories || []) as ExploreCategoryRecord[]) {
        if (item && typeof item.id === "string") merged.set(item.id, { ...merged.get(item.id), ...item });
      }
      const allNodes: LearningNode[] = [];
      async function loadLevel(nodeType: NodeType, parent?: string) {
        let cursor = "";
        for (let page = 0; page < 200; page += 1) {
          const params = new URLSearchParams({ type: nodeType, pageSize: "50" });
          if (parent) params.set("parentId", parent);
          if (cursor) params.set("cursor", cursor);
          const pageResponse = await fetch(`/api/content-categories?${params.toString()}`, { cache: "no-store" });
          const pageData = await pageResponse.json();
          if (!pageResponse.ok || pageData.success !== true || !Array.isArray(pageData.learningNodes)) throw new Error(pageData.message || "Learning entries could not be loaded");
          allNodes.push(...pageData.learningNodes as LearningNode[]);
          if (pageData.pagination?.hasMore !== true || typeof pageData.pagination?.nextCursor !== "string") return;
          cursor = pageData.pagination.nextCursor;
        }
        throw new Error("Learning Library has too many pages to load at once");
      }
      await loadLevel("subject");
      const subjects = [...allNodes];
      for (const subject of subjects) await loadLevel("book", subject.id);
      const books = allNodes.filter((node) => node.type === "book");
      for (const book of books) await loadLevel("chapter", book.id);
      // Questions are the largest catalog level. Load them only after an
      // Admin selects a specific Chapter in the Question editor.
      setCategories([...merged.values()]);
      setNodes(allNodes);
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Library load failed");
    } finally { setBusy(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (type !== "question" || !parentId) return;
    let active = true;
    async function loadSelectedChapterQuestions() {
      setBusy(true);
      try {
        const questions: LearningNode[] = [];
        let cursor = "";
        for (let page = 0; page < 200; page += 1) {
          const params = new URLSearchParams({ type: "question", parentId, pageSize: "50" });
          if (cursor) params.set("cursor", cursor);
          const response = await fetch(`/api/content-categories?${params.toString()}`, { cache: "no-store" });
          const data = await response.json();
          if (!response.ok || data.success !== true || !Array.isArray(data.learningNodes)) {
            throw new Error(data.message || "Questions could not be loaded");
          }
          questions.push(...data.learningNodes as LearningNode[]);
          if (data.pagination?.hasMore !== true || typeof data.pagination?.nextCursor !== "string") break;
          cursor = data.pagination.nextCursor;
          if (page === 199) throw new Error("Too many question pages for one chapter");
        }
        if (active) {
          setNodes((current) => [...current.filter((node) => node.type !== "question"), ...questions]);
          setNotice("");
        }
      } catch (error) {
        if (active) setNotice(error instanceof Error ? error.message : "Questions could not be loaded");
      } finally {
        if (active) setBusy(false);
      }
    }
    loadSelectedChapterQuestions();
    return () => { active = false; };
  }, [type, parentId]);

  const config = TYPES.find((item) => item.value === type)!;
  const parents = useMemo(
    () => config.parent ? nodes.filter((item) => config.parent?.includes(item.type)) : [],
    [config, nodes],
  );

  function resetForm() {
    setEditingId("");
    setType("subject");
    setName("");
    setParentId("");
    setCoverImageUrl("");
  }

  function startEdit(node: LearningNode) {
    setEditingId(node.id);
    setType(node.type);
    setName(node.name);
    setParentId(node.parentId || "");
    setCoverImageUrl(node.coverImageUrl || "");
    setNotice("Selected learning entry is ready to edit.");
  }

  async function adminRequest(payload: Record<string, unknown>) {
    const user = auth.currentUser;
    if (!user) throw new Error("Admin login आवश्यक है।");
    const token = await user.getIdToken();
    const response = await fetch("/api/content-categories", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok || data.success !== true) throw new Error(data.message || "Library update failed");
    return data;
  }

  async function saveNode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || (config.parent && !parentId)) {
      setNotice("Entry का नाम और सही parent चुनना आवश्यक है।");
      return;
    }
    if (type === "book" && !coverImageUrl.trim()) {
      setNotice("Book cover path or URL देना आवश्यक है।");
      return;
    }
    setSaving(true);
    try {
      await adminRequest({
        action: "save-school-node",
        type,
        name: name.trim(),
        parentId: parentId || null,
        ...(type === "book" ? { coverImageUrl: coverImageUrl.trim() } : {}),
        ...(editingId ? { id: editingId } : {}),
      });
      setNotice(editingId ? "Learning entry updated." : "Learning entry added.");
      resetForm();
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Library update failed");
    } finally { setSaving(false); }
  }

  async function deleteNode(node: LearningNode) {
    if (!window.confirm(`Delete "${node.name}"? Entries with children cannot be deleted.`)) return;
    setSaving(true);
    try {
      await adminRequest({ action: "delete-school-node", id: node.id });
      setNotice("Learning entry deleted.");
      if (editingId === node.id) resetForm();
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Delete failed");
    } finally { setSaving(false); }
  }

  async function importLibraryFile(file: File) {
    setImporting(true);
    setNotice("");
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const entries = Array.isArray(parsed) ? parsed : parsed && typeof parsed === "object" && "entries" in parsed && Array.isArray((parsed as { entries?: unknown[] }).entries) ? (parsed as { entries: unknown[] }).entries : [];
      if (!entries.length) throw new Error("JSON file में entries की सूची नहीं मिली।");
      let imported = 0;
      for (let index = 0; index < entries.length; index += 50) {
        const chunk = entries.slice(index, index + 50);
        const result = await adminRequest({ action: "bulk-import-learning-library", entries: chunk });
        imported += Number(result.imported || 0);
        setNotice(`Import progress: ${imported} / ${entries.length}`);
      }
      setNotice(`Learning Library में ${imported} entries import हो गईं।`);
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  async function seedNcertGrade6() {
    if (!window.confirm("NCERT Grade 6 का starter catalog जोड़ें? इसमें 9 Subjects, 9 Books, 103 Chapters और 103 original JEMBEE PLAY practice questions हैं। पहले से मौजूद matching IDs update होंगे; duplicate records नहीं बनेंगे।")) return;
    setImporting(true);
    setNotice("");
    try {
      const result = await adminRequest({ action: "seed-ncert-grade-6" });
      setNotice(`NCERT Grade 6 starter catalog में ${Number(result.imported || 0)} entries जोड़ दी गईं।`);
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "NCERT starter catalog import failed");
    } finally { setImporting(false); }
  }
  const books = nodes.filter((node) => node.type === "book");
  return (
    <main className="min-h-screen bg-[#080d18] px-4 py-6 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-400"><ArrowLeft size={16}/> Admin Dashboard</Link>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Preloaded book-centric learning library</p><h1 className="text-2xl font-black sm:text-3xl">Learning Library</h1></div>
          <button type="button" onClick={load} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm"><RefreshCw size={16}/> Refresh</button>
        </div>
        <section className="mt-5 rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.05] p-5">
          <p className="font-bold text-cyan-100">Subject → Book → Chapter → Question</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">Board, School aur Class selection नहीं होंगे। Admin Subject, Book cover, Chapter और Question manage करेगा; teachers केवल पहले से प्रकाशित entries चुनेंगे।</p>
          <p className="mt-2 text-xs text-slate-400">NCERT Grade 6 starter catalog को एक क्लिक में import करें। Admin केवल missing, गलत या unpublished entries को सुधारता है।</p>
        </section>
        {notice && <p role="status" className="mt-4 rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm">{notice}</p>}
        <section className="mt-5 rounded-3xl border border-cyan-300/20 bg-[#0c1725] p-5">
          <h2 className="text-lg font-bold">Bulk import preloaded books and questions</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">Verified JSON dataset एक बार चुनें। System entries को 50-record batches में import करेगा; हर book, chapter और question अलग-अलग manually add करने की जरूरत नहीं होगी। Parent entries पहले से मौजूद हों या उसी dataset में शामिल हों।</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={seedNcertGrade6} disabled={importing} className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-50">
              {importing ? "Importing…" : "Add NCERT Grade 6 starter catalog"}
            </button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold">
              Choose JSON dataset
              <input type="file" accept="application/json,.json" disabled={importing} className="sr-only" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) importLibraryFile(file); event.currentTarget.value = ""; }}/>
            </label>
          </div>
          <p className="mt-3 text-xs text-slate-400">Starter catalog: 9 subjects, 9 books, 103 chapters and 103 independently written JEMBEE PLAY practice questions. Book covers are original JEMBEE PLAY artwork. NCERT textbook pages, scans and exercise questions are not copied.</p>
        </section>
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-lg font-bold">{editingId ? "Edit learning entry" : "Add learning entry"}</h2>
          <form onSubmit={saveNode} className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-slate-300">Entry type
              <select value={type} onChange={(event) => { setType(event.target.value as NodeType); setParentId(""); setNodes((current) => current.filter((node) => node.type !== "question")); }} disabled={Boolean(editingId)} className="mt-1 w-full rounded-xl border border-white/15 bg-[#111827] p-3 text-white">
                {TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label className="text-sm text-slate-300">Name / Question text
              {type === "question"
                ? <textarea value={name} onChange={(event) => setName(event.target.value)} maxLength={3000} required rows={4} placeholder="Q1. Write the complete verified textbook question…" className="mt-1 w-full rounded-xl border border-white/15 bg-[#111827] p-3 text-white"/>
                : <input value={name} onChange={(event) => setName(event.target.value)} maxLength={180} required placeholder="Official subject, book or chapter name" className="mt-1 w-full rounded-xl border border-white/15 bg-[#111827] p-3 text-white"/>}
            </label>
            {config.parent && <label className="text-sm text-slate-300 sm:col-span-2">Parent entry
              <select value={parentId} onChange={(event) => { setParentId(event.target.value); setNodes((current) => current.filter((node) => node.type !== "question")); }} required className="mt-1 w-full rounded-xl border border-white/15 bg-[#111827] p-3 text-white">
                <option value="">Choose parent</option>
                {parents.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.type}</option>)}
              </select>
            </label>}
            {type === "book" && <>
              <label className="text-sm text-slate-300">Book cover image URL
                <input type="text" required value={coverImageUrl} onChange={(event) => setCoverImageUrl(event.target.value)} placeholder="/learning-covers/book.svg or https://…/book-cover.jpg" className="mt-1 w-full rounded-xl border border-white/15 bg-[#111827] p-3 text-white"/>
              </label>
              {coverImageUrl && <div className="sm:col-span-2"><p className="mb-2 text-xs text-slate-400">Cover preview</p><img src={coverImageUrl} alt="Book cover preview" className="h-48 w-36 rounded-xl border border-white/10 object-cover" referrerPolicy="no-referrer"/></div>}
            </>}
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-50"><Save size={16}/>{saving ? "Saving…" : editingId ? "Update entry" : "Add entry"}</button>
              {editingId && <button type="button" onClick={resetForm} className="rounded-xl border border-white/15 px-4 py-3 text-sm">Cancel edit</button>}
            </div>
          </form>
        </section>
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-lg font-bold">Book covers ({books.length})</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {books.map((book) => <article key={book.id} className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
              {book.coverImageUrl ? <img src={book.coverImageUrl} alt={book.name} loading="lazy" className="h-44 w-full object-contain bg-white/5" referrerPolicy="no-referrer"/> : <div className="grid h-44 place-items-center text-slate-500"><ImagePlus size={28}/></div>}
              <div className="p-3"><h3 className="line-clamp-2 text-sm font-bold">{book.name}</h3><div className="mt-2 flex gap-3"><button type="button" onClick={() => startEdit(book)} className="text-xs text-cyan-300">Edit</button><button type="button" onClick={() => deleteNode(book)} disabled={saving} className="text-xs text-rose-300">Delete</button></div></div>
            </article>)}
          </div>
        </section>
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold"><BookOpen size={19} className="text-cyan-300"/> Learning entries ({nodes.length})</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TYPES.map((item) => {
              const group = nodes.filter((node) => node.type === item.value);
              return <div key={item.value} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="font-semibold">{item.label} ({group.length})</p>
                <ul className="mt-2 space-y-2 text-xs text-slate-300">
                  {group.slice(0, 40).map((node) => <li key={node.id} className="flex items-center justify-between gap-2"><span className="min-w-0 truncate">{node.name}</span><span className="flex shrink-0 gap-2"><button type="button" aria-label={`Edit ${node.name}`} onClick={() => startEdit(node)} className="rounded p-1 text-cyan-300"><Pencil size={14}/></button><button type="button" aria-label={`Delete ${node.name}`} onClick={() => deleteNode(node)} disabled={saving} className="rounded p-1 text-rose-300 disabled:opacity-40"><Trash2 size={14}/></button></span></li>)}
                </ul>
              </div>;
            })}
          </div>
        </section>
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5"><h2 className="text-lg font-bold">Explore Categories ({categories.length})</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{categories.map((item) => <article key={item.id} className="rounded-xl border border-white/10 bg-black/20 p-3"><h3 className="font-semibold">{item.name}</h3><p className="mt-1 text-xs text-slate-400">{item.description}</p></article>)}</div></section>
        <p className="mt-5 text-xs text-slate-500">Only admin / super_admin accounts can write to the Learning Library. Teachers cannot create, edit or delete master entries.</p>
      </div>
    </main>
  );
}
