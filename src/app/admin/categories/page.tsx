"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, BookOpen, GraduationCap, RefreshCw, Plus, Trash2, Pencil, Save } from "lucide-react";
import { auth } from "@/firebase/config";
import { DEFAULT_EXPLORE_CATEGORIES, type ExploreCategoryRecord } from "@/lib/catalog/defaultExploreCategories";

type NodeType = "board" | "school" | "class" | "subject" | "book" | "chapter" | "question";
type SchoolNode = { id: string; type: NodeType; name: string; parentId?: string | null };
const TYPES: { value: NodeType; label: string; parent?: NodeType[] }[] = [
  { value: "board", label: "Board / Curriculum" },
  { value: "school", label: "School", parent: ["board"] },
  { value: "class", label: "Class", parent: ["school"] },
  { value: "subject", label: "Subject", parent: ["class"] },
  { value: "book", label: "Book", parent: ["class"] },
  { value: "chapter", label: "Chapter", parent: ["subject", "book"] },
  { value: "question", label: "Question number", parent: ["chapter"] },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ExploreCategoryRecord[]>(DEFAULT_EXPLORE_CATEGORIES);
  const [nodes, setNodes] = useState<SchoolNode[]>([]);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [type, setType] = useState<NodeType>("board");
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [editingId, setEditingId] = useState("");

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

  const config = TYPES.find((item) => item.value === type)!;
  const parents = useMemo(() => config.parent ? nodes.filter((item) => config.parent?.includes(item.type)) : [], [config, nodes]);

  function startEdit(node: SchoolNode) {
    setEditingId(node.id);
    setType(node.type);
    setName(node.name);
    setParentId(node.parentId || "");
    setNotice("Editing selected master entry.");
  }

  function resetForm() {
    setEditingId("");
    setType("board");
    setName("");
    setParentId("");
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
    if (!response.ok || data.success !== true) throw new Error(data.message || "Catalog update failed");
    return data;
  }

  async function saveNode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || (config.parent && !parentId)) {
      setNotice("Entry का नाम और सही parent चुनना आवश्यक है।");
      return;
    }
    setSaving(true);
    try {
      await adminRequest({ action: "save-school-node", type, name: name.trim(), parentId: parentId || null, ...(editingId ? { id: editingId } : {}) });
      setNotice(editingId ? "Master entry updated." : "Master entry added.");
      resetForm();
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Catalog update failed");
    } finally { setSaving(false); }
  }

  async function deleteNode(node: SchoolNode) {
    if (!window.confirm(`Delete "${node.name}"? Entries with children cannot be deleted.`)) return;
    setSaving(true);
    try {
      await adminRequest({ action: "delete-school-node", id: node.id });
      setNotice("Master entry deleted.");
      if (editingId === node.id) resetForm();
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Delete failed");
    } finally { setSaving(false); }
  }

  return (
    <main className="min-h-screen bg-[#080d18] px-4 py-6 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-400"><ArrowLeft size={16}/> Admin Dashboard</Link>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Admin-controlled master data</p><h1 className="text-2xl font-black sm:text-3xl">Learning Master Catalog</h1></div>
          <button type="button" onClick={() => void load()} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm"><RefreshCw size={16}/> Refresh</button>
        </div>
        <section className="mt-5 rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.05] p-5">
          <p className="font-bold text-cyan-100">Master hierarchy — Admin only</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">Admin Board, School, Class, Subject, Book, Chapter और Question बनाता और नियंत्रित करता है। Teachers केवल पहले से प्रकाशित Question चुनकर answer videos upload करेंगे। Video moderation अलग से लागू रहेगा।</p>
        </section>
        {notice && <p role="status" className="mt-4 rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm">{notice}</p>}
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-lg font-bold">{editingId ? "Edit master entry" : "Add master entry"}</h2>
          <form onSubmit={saveNode} className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-slate-300">Entry type
              <select value={type} onChange={(event) => { setType(event.target.value as NodeType); setParentId(""); }} disabled={Boolean(editingId)} className="mt-1 w-full rounded-xl border border-white/15 bg-[#111827] p-3 text-white">
                {TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label className="text-sm text-slate-300">Name / Question number
              <input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required placeholder="Enter official name or number" className="mt-1 w-full rounded-xl border border-white/15 bg-[#111827] p-3 text-white"/>
            </label>
            {config.parent && <label className="text-sm text-slate-300 sm:col-span-2">Parent entry
              <select value={parentId} onChange={(event) => setParentId(event.target.value)} required className="mt-1 w-full rounded-xl border border-white/15 bg-[#111827] p-3 text-white">
                <option value="">Choose parent</option>
                {parents.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.type}</option>)}
              </select>
            </label>}
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-50"><Save size={16}/>{saving ? "Saving…" : editingId ? "Update entry" : "Add entry"}</button>
              {editingId && <button type="button" onClick={resetForm} className="rounded-xl border border-white/15 px-4 py-3 text-sm">Cancel edit</button>}
            </div>
          </form>
        </section>
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-lg font-bold">School Learning Hierarchy ({nodes.length} entries)</h2>
          <p className="mt-1 text-xs text-slate-400">Board → School → Class → Subject / Book → Chapter → Question</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TYPES.map((item) => {
              const group = nodes.filter((node) => node.type === item.value);
              return <div key={item.value} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="font-semibold">{item.label} ({group.length})</p>
                <ul className="mt-2 space-y-2 text-xs text-slate-300">
                  {group.slice(0, 40).map((node) => <li key={node.id} className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate">{node.name}</span>
                    <span className="flex shrink-0 gap-2"><button type="button" aria-label={`Edit ${node.name}`} onClick={() => startEdit(node)} className="rounded p-1 text-cyan-300"><Pencil size={14}/></button><button type="button" aria-label={`Delete ${node.name}`} onClick={() => void deleteNode(node)} disabled={saving} className="rounded p-1 text-rose-300 disabled:opacity-40"><Trash2 size={14}/></button></span>
                  </li>)}
                </ul>
              </div>;
            })}
          </div>
        </section>
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold"><BookOpen size={19} className="text-cyan-300"/> Explore Categories ({categories.length})</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((item) => <article key={item.id} className="rounded-xl border border-white/10 bg-black/20 p-3"><h3 className="font-semibold">{item.name}</h3><p className="mt-1 text-xs text-slate-400">{item.description}</p><p className="mt-2 text-xs text-cyan-200">{item.topics.join(" · ")}</p></article>)}
          </div>
        </section>
        <p className="mt-5 text-xs text-slate-500">Only admin / super_admin accounts can write to the school master catalog. Teachers cannot create, edit or delete master entries.</p>
      </div>
    </main>
  );
}
