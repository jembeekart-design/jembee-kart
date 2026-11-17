"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, BookOpen, GraduationCap, RefreshCw } from "lucide-react";
import { auth } from "@/firebase/config";
import { DEFAULT_EXPLORE_CATEGORIES, type ExploreCategoryRecord } from "@/lib/catalog/defaultExploreCategories";

type SchoolNode = { id: string; type: string; name: string; status?: string; parentId?: string | null };
type CustomCategory = { id: string; name: string; description?: string; topics: string[]; status?: string; ownerUid?: string | null };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ExploreCategoryRecord[]>(DEFAULT_EXPLORE_CATEGORIES);
  const [nodes, setNodes] = useState<SchoolNode[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [updatingNodeId, setUpdatingNodeId] = useState("");

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Admin session expired. Please sign in again.");
      const token = await user.getIdToken();
      const [response, adminResponse] = await Promise.all([
        fetch("/api/content-categories", { cache: "no-store" }),
        fetch("/api/admin/learning-catalog", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }),
      ]);
      const [data, adminData] = await Promise.all([
        response.json().catch(() => null),
        adminResponse.json().catch(() => null),
      ]);
      if (!response.ok || data?.success !== true) throw new Error(data?.message || "Category catalog load failed");
      if (!adminResponse.ok || adminData?.success !== true) throw new Error(adminData?.message || "Admin Learning catalog load failed");
      const merged = new Map(DEFAULT_EXPLORE_CATEGORIES.map((item) => [item.id, item]));
      for (const item of (data.categories || []) as ExploreCategoryRecord[]) {
        if (item && typeof item.id === "string") merged.set(item.id, { ...merged.get(item.id), ...item });
      }
      setCategories([...merged.values()]);
      setNodes(Array.isArray(adminData.nodes) ? adminData.nodes : []);
      setCustomCategories(Array.isArray(adminData.categories) ? adminData.categories : []);
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Catalog load failed");
    } finally { setBusy(false); }
  }, []);

  const updateNodeStatus = async (node: SchoolNode) => {
    const nextStatus = node.status === "pending" || node.status === "unpublished" ? "published" : "unpublished";
    const confirmed = window.confirm(
      nextStatus === "unpublished"
        ? `Unpublish "${node.name}"? New video approvals using this entry will be blocked.`
        : `Approve and publish "${node.name}"?`
    );
    if (!confirmed) return;
    setUpdatingNodeId(node.id);
    setNotice("");
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Admin session expired. Please sign in again.");
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/learning-catalog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: node.id, status: nextStatus }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success !== true) throw new Error(result?.message || "Catalog status update failed");
      setNodes((current) => current.map((item) => item.id === node.id ? { ...item, status: nextStatus } : item));
      setNotice(nextStatus === "unpublished" ? "Entry unpublished. Pending approvals using it will be blocked." : "Entry published.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Catalog status update failed");
    } finally {
      setUpdatingNodeId("");
    }
  };


  const updateCategoryStatus = async (category: CustomCategory) => {
    const nextStatus = category.status === "pending" || category.status === "unpublished" ? "published" : "unpublished";
    if (!window.confirm(`${nextStatus === "published" ? "Approve and publish" : "Unpublish"} "${category.name}"?`)) return;
    setUpdatingNodeId(category.id);
    setNotice("");
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Admin session expired. Please sign in again.");
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/learning-catalog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ kind: "explore-category", id: category.id, status: nextStatus }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success !== true) throw new Error(result?.message || "Category status update failed");
      setCustomCategories((current) => current.map((item) => item.id === category.id ? { ...item, status: nextStatus } : item));
      setNotice(nextStatus === "published" ? "Custom Explore category approved and published." : "Custom Explore category unpublished.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Category status update failed");
    } finally {
      setUpdatingNodeId("");
    }
  };

  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);

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
          <p className="mt-2 text-sm leading-6 text-slate-300">अब School की जानकारी, Board, Class, Subject, Book, Chapter और Question संबंधित teacher या uploader स्वयं जोड़ता है। Admin को हर School की जानकारी manually collect या publish नहीं करनी होगी। Admin catalog entries को review करके publish या unpublish कर सकता है। Entry unpublish होने पर उससे जुड़े नए video approvals रुकेंगे; creator अपनी entries जोड़ सकता है।</p>
          <Link href="/videos/upload" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950"><GraduationCap size={17}/> Teacher / Creator Upload खोलें</Link>
        </section>
        {notice && <p role="status" className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm">{notice}</p>}
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold"><BookOpen size={19} className="text-cyan-300"/> Explore Categories ({categories.length})</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((item) => <article key={item.id} className="rounded-xl border border-white/10 bg-black/20 p-3"><h3 className="font-semibold">{item.name}</h3><p className="mt-1 text-xs text-slate-400">{item.description}</p><p className="mt-2 text-xs text-cyan-200">{item.topics.join(" · ")}</p></article>)}
          </div>
        </section>
        <section className="mt-6 rounded-3xl border border-violet-300/20 bg-violet-300/[0.04] p-5">
          <h2 className="text-lg font-bold">Custom Explore Category Moderation ({customCategories.length})</h2>
          <p className="mt-1 text-xs text-slate-400">Creator द्वारा जोड़ी गई Explore categories पहले pending रहेंगी। Admin review के बाद publish कर सकता है।</p>
          {customCategories.length === 0 ? (
            <p className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-slate-400">अभी कोई custom Explore category review के लिए नहीं है।</p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {customCategories.map((category) => (
                <article key={category.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="mt-1 text-xs text-slate-400">{category.description || "No description"}</p>
                      <p className="mt-2 text-xs text-cyan-200">{category.topics.join(" · ")}</p>
                      <p className="mt-2 text-xs text-slate-400">Status: <span className={category.status === "published" ? "text-emerald-300" : "text-amber-300"}>{category.status || "unknown"}</span></p>
                    </div>
                    <button type="button" disabled={updatingNodeId === category.id || !["pending", "published", "unpublished"].includes(category.status || "")} onClick={() => void updateCategoryStatus(category)} className="shrink-0 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold disabled:opacity-40">{updatingNodeId === category.id ? "Saving…" : category.status === "pending" ? "Approve & Publish" : category.status === "unpublished" ? "Publish" : "Unpublish"}</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-lg font-bold">School Learning Hierarchy ({nodes.length} entries)</h2>
          <p className="mt-1 text-xs text-slate-400">Board → School → Class → Subject / Book → Chapter → Question · Admin can publish or unpublish entries. Every change is audited.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {["board", "school", "class", "subject", "book", "chapter", "question"].map((type) => {
              const group = nodes.filter((node) => node.type === type);
              return <div key={type} className="rounded-xl border border-white/10 bg-black/20 p-3"><p className="font-semibold capitalize">{type} ({group.length})</p><ul className="mt-2 space-y-2 text-xs text-slate-400">{group.slice(0, 30).map((node) => <li key={node.id} className="flex items-center justify-between gap-2 border-t border-white/5 pt-2"><span className="min-w-0"><span className="block truncate">{node.name}</span><span className={node.status === "unpublished" ? "text-amber-300" : "text-emerald-300"}>{node.status || "status unknown"}</span></span><button type="button" disabled={updatingNodeId === node.id || !["pending", "published", "unpublished"].includes(node.status || "")} onClick={() => void updateNodeStatus(node)} className="shrink-0 rounded-lg border border-white/15 px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-40">{updatingNodeId === node.id ? "Saving…" : node.status === "pending" ? "Approve" : node.status === "unpublished" ? "Publish" : "Unpublish"}</button></li>)}</ul></div>;
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
