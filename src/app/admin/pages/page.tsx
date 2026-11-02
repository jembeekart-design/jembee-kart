"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { auth } from "@/firebase/config";

import {
  LayoutTemplate,
  Plus,
  Trash2,
  Eye,
  FileText
} from "lucide-react";

interface PageAuditVerification {
  verified: boolean;
  checkedEvents: number;
  legacyEvents: number;
  truncated: boolean;
  message: string;
}

interface PageAuditEvent {
  id: string;
  action: string;
  actorUid: string;
  createdAt: string | null;
}

interface PageVersion {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string | null;
}

interface PageItem {
  id: string;
  title: string;
  slug: string;
  visible: boolean;
  archived?: boolean;
  content: string;
  auditRevision?: number;
}

export default function PagesManagerPage() {

  const [pages, setPages] = useState<PageItem[]>([]);
  const [archivedPages, setArchivedPages] = useState<PageItem[]>([]);
  const [activeCursor, setActiveCursor] = useState<string | null>(null);
  const [archivedCursor, setArchivedCursor] = useState<string | null>(null);
  const [activeHasMore, setActiveHasMore] = useState(false);
  const [archivedHasMore, setArchivedHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [contentDraft, setContentDraft] = useState("");
  const [savingContent, setSavingContent] = useState(false);
  const [historyFor, setHistoryFor] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<PageVersion[]>([]);
  const [auditFor, setAuditFor] = useState<string | null>(null);
  const [auditItems, setAuditItems] = useState<PageAuditEvent[]>([]);
  const [auditVerification, setAuditVerification] = useState<PageAuditVerification | null>(null);
  const [verifyingAudit, setVerifyingAudit] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  async function adminRequest(path: string, method = "GET", body?: unknown) {
    const user = auth.currentUser;
    if (!user) throw new Error("Admin login required");
    const token = await user.getIdToken();
    const response = await fetch(path, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const result = await response.json();
    if (!response.ok || result.success !== true) throw new Error(result.message || "Request failed");
    return result;
  }

  async function fetchPages() {
    try {
      const [activeResult, archivedResult] = await Promise.all([
        adminRequest("/api/admin/dynamic-pages?limit=50"),
        adminRequest("/api/admin/dynamic-pages?archived=true&limit=50"),
      ]);
      setPages(Array.isArray(activeResult.pages) ? activeResult.pages : []);
      setArchivedPages(Array.isArray(archivedResult.pages) ? archivedResult.pages : []);
      setActiveCursor(activeResult.nextCursor || null);
      setArchivedCursor(archivedResult.nextCursor || null);
      setActiveHasMore(activeResult.hasMore === true);
      setArchivedHasMore(archivedResult.hasMore === true);
    } catch (error) {
      console.error("Error fetching pages:", error);
      alert(error instanceof Error ? error.message : "Could not load pages");
    } finally {
      setLoading(false);
    }
  }

  async function loadMorePages(archived: boolean) {
    const cursor = archived ? archivedCursor : activeCursor;
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const query = new URLSearchParams({ limit: "50", cursor });
      if (archived) query.set("archived", "true");
      const result = await adminRequest(`/api/admin/dynamic-pages?${query.toString()}`);
      const incoming = Array.isArray(result.pages) ? result.pages as PageItem[] : [];
      if (archived) {
        setArchivedPages((prev) => [...prev, ...incoming]);
        setArchivedCursor(result.nextCursor || null);
        setArchivedHasMore(result.hasMore === true);
      } else {
        setPages((prev) => [...prev, ...incoming]);
        setActiveCursor(result.nextCursor || null);
        setActiveHasMore(result.hasMore === true);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not load more pages");
    } finally {
      setLoadingMore(false);
    }
  }

  async function createPage() {
    if (!title || !slug) return;
    
    try {
      const result = await adminRequest("/api/admin/dynamic-pages", "POST", { title, slug: slug.trim().toLowerCase() });
      setPages((prev) => [...prev, result.page as PageItem]);
      setTitle("");
      setSlug("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not create page");
    }
  }

  function editContent(page: PageItem) {
    setEditingId(page.id);
    setContentDraft(page.content || "");
  }

  async function saveContent() {
    if (!editingId) return;
    setSavingContent(true);
    try {
      const result = await adminRequest("/api/admin/dynamic-pages", "PATCH", { id: editingId, content: contentDraft, expectedAuditRevision: pages.find((page) => page.id === editingId)?.auditRevision ?? 0 });
      setPages((prev) => prev.map((page) => page.id === editingId ? { ...page, content: contentDraft, auditRevision: Number.isSafeInteger(result.auditRevision) ? result.auditRevision : (page.auditRevision ?? 0) } : page));
      alert("Content saved as plain text. Page visibility was not changed.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not save page content");
    } finally {
      setSavingContent(false);
    }
  }

  async function loadHistory(pageId: string) {
    setHistoryFor(pageId);
    setLoadingHistory(true);
    try {
      const result = await adminRequest(`/api/admin/dynamic-pages?history=${encodeURIComponent(pageId)}`);
      setHistoryItems(Array.isArray(result.versions) ? result.versions as PageVersion[] : []);
    } catch (error) {
      setHistoryItems([]);
      alert(error instanceof Error ? error.message : "Could not load page history");
    } finally {
      setLoadingHistory(false);
    }
  }

  async function restorePage(id: string) {
    if (!window.confirm("Restore this page as hidden? A separate approval is required before it becomes public.")) return;
    try {
      await adminRequest("/api/admin/dynamic-pages", "PUT", { id, expectedAuditRevision: archivedPages.find((page) => page.id === id)?.auditRevision ?? 0 });
      const restored = archivedPages.find((page) => page.id === id);
      if (restored) {
        setArchivedPages((prev) => prev.filter((page) => page.id !== id));
        setPages((prev) => [...prev, { ...restored, archived: false, visible: false, auditRevision: (restored.auditRevision ?? 0) + 1 }]);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not restore page");
    }
  }

  async function loadAudit(pageId: string) {
    setAuditFor(pageId);
    setAuditVerification(null);
    try {
      const result = await adminRequest(`/api/admin/dynamic-pages?audit=${encodeURIComponent(pageId)}`);
      setAuditItems(Array.isArray(result.events) ? result.events as PageAuditEvent[] : []);
    } catch (error) {
      setAuditItems([]);
      alert(error instanceof Error ? error.message : "Could not load audit trail");
    }
  }

  async function verifyAudit(pageId: string) {
    setVerifyingAudit(true);
    setAuditVerification(null);
    try {
      const result = await adminRequest(`/api/admin/dynamic-pages?audit=${encodeURIComponent(pageId)}&verify=true`);
      setAuditVerification({
        verified: result.verified === true,
        checkedEvents: Number(result.checkedEvents) || 0,
        legacyEvents: Number(result.legacyEvents) || 0,
        truncated: result.truncated === true,
        message: typeof result.message === "string" ? result.message : "Verification result unavailable",
      });
    } catch (error) {
      setAuditVerification({ verified: false, checkedEvents: 0, legacyEvents: 0, truncated: false, message: error instanceof Error ? error.message : "Could not verify audit chain" });
    } finally {
      setVerifyingAudit(false);
    }
  }

  async function deletePage(id: string) {
    if (!window.confirm("Archive this hidden page? It will be removed from public access while its version history is retained.")) return;
    try {
      await adminRequest("/api/admin/dynamic-pages", "DELETE", { id, expectedAuditRevision: pages.find((page) => page.id === id)?.auditRevision ?? 0 });
      setPages((prev) => prev.map((item) => item.id === id ? { ...item, visible: false, archived: true } : item));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not delete page");
    }
  }

  async function togglePage(page: PageItem) {
    try {
      await adminRequest("/api/admin/dynamic-pages", "PATCH", { id: page.id, visible: !page.visible, expectedAuditRevision: page.auditRevision ?? 0 });
      setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, visible: !p.visible, auditRevision: (p.auditRevision ?? 0) + 1 } : p)));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not update page");
    }
  }

  if (loading) return <div className="p-4">Loading Pages...</div>;

  return (

    <main className="min-h-screen bg-[var(--color-page-background)] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] theme-primary-bg">

          <LayoutTemplate size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Pages Manager
          </h1>

          <p className="mt-1 text-sm text-[var(--muted-text-color)]">
            Manage custom website pages (new pages start hidden until reviewed)
          </p>

        </div>

      </div>

      {/* CREATE PAGE */}

      <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

        <h2 className="text-2xl font-black">
          Create New Page
        </h2>

        <div className="mt-5 space-y-4">

          <div className="flex items-center gap-3 rounded-2xl bg-[var(--card-color)] px-4 py-4">

            <FileText
              size={20}
              className="text-[var(--muted-text-color)]"
            />

            <input
              type="text"
              placeholder="Page Title"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              className="w-full bg-transparent outline-none"
            />

          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-[var(--card-color)] px-4 py-4">

            <LayoutTemplate
              size={20}
              className="text-[var(--muted-text-color)]"
            />

            <input
              type="text"
              placeholder="page-slug (e.g., privacy)"
              value={slug}
              onChange={(e) =>
                setSlug(
                  e.target.value
                )
              }
              className="w-full bg-transparent outline-none"
            />

          </div>

          <button
            onClick={createPage}
            className="flex items-center gap-2 rounded-2xl theme-primary-bg px-5 py-3 font-bold"
          >

            <Plus size={18} />

            Create Page

          </button>

        </div>

      </div>

      {/* PAGE LIST */}

      <div className="mt-6 space-y-5">

        {pages.map(
          (item) => (

            <div
              key={item.id}
              className="rounded-[30px] bg-[var(--primary-color)] p-5"
            >

              <div className="flex items-center justify-between gap-4">

                <div>

                  <h2 className="text-2xl font-black">
                    {item.title}
                  </h2>

                  <p className="mt-2 text-sm text-[var(--muted-text-color)]">
                    {item.slug}
                  </p>

                  <div className="mt-4 inline-block rounded-full theme-primary-bg px-4 py-2 text-sm font-bold">

                    {item.archived ? "Archived" : item.visible ? "Visible" : "Hidden"}

                  </div>

                </div>

                <div className="flex gap-3">

                  <button
                    onClick={() => editContent(item)}
                    disabled={item.archived}
                    className="rounded-xl bg-[var(--card-color)] px-3 py-2 text-sm font-bold disabled:opacity-40"
                    aria-label={`Edit ${item.title} content`}
                  >
                    Edit content
                  </button>
                  <button
                    onClick={() => loadHistory(item.id)}
                    className="rounded-xl bg-[var(--card-color)] px-3 py-2 text-sm font-bold"
                    aria-label={`View ${item.title} version history`}
                  >
                    Version history
                  </button>
                  <button
                    onClick={() => loadAudit(item.id)}
                    className="rounded-xl bg-[var(--card-color)] px-3 py-2 text-sm font-bold"
                    aria-label={`View ${item.title} audit trail`}
                  >
                    Activity
                  </button>

                  <button
                    onClick={() => togglePage(item)}
                    disabled={item.archived}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-color)] disabled:opacity-40"
                  >

                    <Eye size={22} />

                  </button>

                  <button
                    onClick={() => deletePage(item.id)}
                    disabled={item.archived || item.visible}
                    aria-label={`Archive ${item.title}`}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--danger-color)] disabled:opacity-40"
                  >

                    <Trash2 size={22} />

                  </button>

                </div>

              </div>

            </div>

          )
        )}

      </div>

      {activeHasMore && (
        <div className="mt-4 text-center">
          <button onClick={() => loadMorePages(false)} disabled={loadingMore} className="rounded-xl theme-primary-bg px-5 py-3 font-bold disabled:opacity-50">
            {loadingMore ? "Loading..." : "Load more pages"}
          </button>
        </div>
      )}

      <section className="mt-6 rounded-[30px] bg-[var(--primary-color)] p-5" aria-label="Archived pages">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">Archived pages ({archivedPages.length})</h2>
          <button onClick={() => setShowArchived((value) => !value)} className="rounded-xl bg-[var(--card-color)] px-4 py-2 font-bold">
            {showArchived ? "Hide archive" : "Show archive"}
          </button>
        </div>
        {showArchived && (
          <div className="mt-4 space-y-3">
            {archivedPages.length === 0 ? <p>No archived pages.</p> : archivedPages.map((item) => (
              <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--card-color)] p-4">
                <div><p className="font-bold">{item.title}</p><p className="text-sm text-[var(--muted-text-color)]">{item.slug}</p></div>
                <div className="flex gap-2">
                  <button onClick={() => loadHistory(item.id)} className="rounded-xl px-3 py-2 text-sm font-bold">History</button>
                  <button onClick={() => restorePage(item.id)} className="rounded-xl theme-primary-bg px-3 py-2 text-sm font-bold">Restore hidden</button>
                </div>
              </article>
            ))}
          </div>
        )}
        {showArchived && archivedHasMore && (
          <div className="mt-4 text-center">
            <button onClick={() => loadMorePages(true)} disabled={loadingMore} className="rounded-xl theme-primary-bg px-5 py-3 font-bold disabled:opacity-50">
              {loadingMore ? "Loading..." : "Load more archived pages"}
            </button>
          </div>
        )}
      </section>

      {auditFor && (
        <section className="mt-6 rounded-[30px] bg-[var(--primary-color)] p-5" aria-label="Page audit trail">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">Activity: {auditFor}</h2>
            <button onClick={() => { setAuditFor(null); setAuditItems([]); }} className="rounded-xl bg-[var(--card-color)] px-4 py-2 font-bold">Close</button>
          </div>
          <p className="mt-1 text-sm text-[var(--muted-text-color)]">Latest 50 server-recorded actions. Hash verification checks the full chain up to 5,000 events.</p>
          <button onClick={() => verifyAudit(auditFor)} disabled={verifyingAudit} className="mt-3 rounded-xl theme-primary-bg px-4 py-2 font-bold disabled:opacity-50">
            {verifyingAudit ? "Verifying..." : "Verify audit integrity"}
          </button>
          {auditVerification && (
            <div className="mt-3 rounded-xl bg-[var(--card-color)] p-3" role="status">
              <p className="font-bold">{auditVerification.verified ? "Hash chain valid" : "Verification needs review"}</p>
              <p className="text-sm">{auditVerification.message}</p>
              <p className="text-xs text-[var(--muted-text-color)]">Checked: {auditVerification.checkedEvents} · Legacy: {auditVerification.legacyEvents} · Truncated: {auditVerification.truncated ? "Yes" : "No"}</p>
            </div>
          )}
          {auditItems.length === 0 ? <p className="mt-3">No activity events found.</p> : (
            <div className="mt-4 space-y-2">
              {auditItems.map((event) => (
                <article key={event.id} className="rounded-xl bg-[var(--card-color)] p-3">
                  <p className="font-bold">{event.action}</p>
                  <p className="text-xs text-[var(--muted-text-color)]">UID: {event.actorUid || "Unavailable"} · {event.createdAt ? new Date(event.createdAt).toLocaleString() : "Time unavailable"}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {historyFor && (
        <section className="mt-6 rounded-[30px] bg-[var(--primary-color)] p-5" aria-label="Page version history">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">Version history: {historyFor}</h2>
            <button onClick={() => { setHistoryFor(null); setHistoryItems([]); }} className="rounded-xl bg-[var(--card-color)] px-4 py-2 font-bold">Close</button>
          </div>
          <p className="mt-1 text-sm text-[var(--muted-text-color)]">Latest 20 snapshots. Previous content is retained for audit; restore is not enabled.</p>
          {loadingHistory ? <p className="mt-3">Loading history...</p> : historyItems.length === 0 ? <p className="mt-3">No saved versions yet. A snapshot is created when content changes.</p> : (
            <div className="mt-4 space-y-3">
              {historyItems.map((version) => (
                <article key={version.id} className="rounded-2xl bg-[var(--card-color)] p-4">
                  <p className="text-sm font-bold">{version.createdAt ? new Date(version.createdAt).toLocaleString() : "Time unavailable"}</p>
                  <p className="mt-1 text-xs text-[var(--muted-text-color)]">Editor UID: {version.createdBy || "Unavailable"}</p>
                  <p className="mt-3 whitespace-pre-wrap break-words">{version.content || "(Empty previous content)"}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {editingId && (
        <section className="mt-6 rounded-[30px] bg-[var(--primary-color)] p-5" aria-label="Page content editor">
          <h2 className="text-2xl font-black">Edit page content</h2>
          <p className="mt-1 text-sm text-[var(--muted-text-color)]">Plain text only · HTML is displayed as text · Maximum 20,000 characters · Saving does not publish.</p>
          <textarea
            value={contentDraft}
            onChange={(event) => setContentDraft(event.target.value)}
            maxLength={20000}
            rows={10}
            className="mt-4 w-full rounded-2xl bg-[var(--card-color)] p-4 outline-none"
            aria-label="Page content"
          />
          <p className="mt-2 text-xs text-[var(--muted-text-color)]">{contentDraft.length.toLocaleString()} / 20,000 characters</p>
          <div className="mt-4 rounded-2xl border border-[var(--muted-text-color)]/30 p-4">
            <h3 className="font-bold">Preview (plain text)</h3>
            <p className="mt-2 whitespace-pre-wrap break-words">{contentDraft || "No content yet."}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={saveContent} disabled={savingContent || contentDraft.length > 20000} className="rounded-xl theme-primary-bg px-5 py-3 font-bold disabled:opacity-50">
              {savingContent ? "Saving..." : "Save content"}
            </button>
            <button onClick={() => { setEditingId(null); setContentDraft(""); }} className="rounded-xl bg-[var(--card-color)] px-5 py-3 font-bold">Close editor</button>
          </div>
        </section>
      )}

      {/* PREVIEW */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] p-6">

        <h2 className="text-3xl font-black">
          Dynamic Pages System
        </h2>

        <p className="mt-2 text-[var(--button-text-color)]/80">
          Create unlimited custom pages
        </p>

      </div>

    </main>

  );
}
