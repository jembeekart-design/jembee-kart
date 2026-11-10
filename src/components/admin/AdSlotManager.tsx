"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/firebase/config";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";
import type { AdSlot } from "@/types/ads";
import { MONETAG_PLACEMENTS, normalizeMonetagDirectLink, type MonetagPlacementId } from "@/lib/ads/monetagPlacements";
import { addAdSlot, updateAdSlot, deleteAdSlot } from "@/firestore/services/adManagement";
import { Plus, Pencil, Trash2, X, ExternalLink } from "lucide-react";

type Environment = "test" | "production";

export function AdSlotManager() {
  const [slots, setSlots] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AdSlot | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [placement, setPlacement] = useState<MonetagPlacementId>(MONETAG_PLACEMENTS[0].id);
  const [link, setLink] = useState("");
  const [title, setTitle] = useState("Sponsored offer");
  const [description, setDescription] = useState("Open this offer from our advertising partner.");
  const [ctaLabel, setCtaLabel] = useState("View offer");
  const [environment, setEnvironment] = useState<Environment>("test");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, FIRESTORE_PATHS.AD_MANAGEMENT.SLOTS)),
      (snapshot) => {
        const data = snapshot.docs
          .map((item) => ({ id: item.id, ...item.data() }) as AdSlot)
          .filter((item) => item.networkId === "monetag-direct-link" && item.format === "monetag-direct-link");
        setSlots(data);
        setLoadError("");
        setLoading(false);
      },
      (listenerError) => {
        console.error("Monetag placement admin listener failed:", listenerError.code || "FIRESTORE_LISTENER_FAILED");
        setLoadError(listenerError.code === "permission-denied"
          ? "Admin permission नहीं मिली। कृपया Admin account और Firestore rules जाँचें।"
          : "Monetag placements लोड नहीं हो सके। Firestore connection जाँचें।");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const sortedSlots = useMemo(
    () => [...slots].sort((a, b) => a.placement.localeCompare(b.placement)),
    [slots]
  );

  function resetForm(slot?: AdSlot) {
    setEditingSlot(slot || null);
    setName(slot?.name || "");
    setPlacement((slot?.placement as MonetagPlacementId) || MONETAG_PLACEMENTS[0].id);
    setLink(slot?.adUnitId || "");
    setTitle(slot?.title || "Sponsored offer");
    setDescription(slot?.description || "Open this offer from our advertising partner.");
    setCtaLabel(slot?.ctaLabel || "View offer");
    setEnvironment(slot?.environment || "test");
    setEnabled(slot?.enabled === true);
    setError("");
    setShowModal(true);
  }

  async function saveSlot() {
    const safeUrl = normalizeMonetagDirectLink(link);
    if (!name.trim()) {
      setError("Placement का नाम भरें।");
      return;
    }
    if (!safeUrl) {
      setError("Monetag Direct Link में पूरा HTTPS Smart Link डालें। http:// और script code स्वीकार नहीं होंगे।");
      return;
    }
    if (!title.trim() || !ctaLabel.trim()) {
      setError("Ad title और button text दोनों जरूरी हैं।");
      return;
    }
    const duplicate = slots.find((slot) => slot.placement === placement
      && (slot.environment || "test") === environment
      && slot.id !== editingSlot?.id);
    if (duplicate) {
      setError("इस location और environment के लिए placement पहले से मौजूद है। उसी को Edit करें।");
      return;
    }

    setSaving(true);
    setError("");
    const payload = {
      name: name.trim().slice(0, 80),
      networkId: "monetag-direct-link",
      format: "monetag-direct-link" as const,
      fallbackNetworkId: "",
      adUnitId: safeUrl,
      placement,
      title: title.trim().slice(0, 120),
      description: description.trim().slice(0, 240),
      ctaLabel: ctaLabel.trim().slice(0, 32),
      environment,
      priority: 100,
      enabled,
      deviceTargeting: { mobile: true, desktop: true },
    };

    try {
      if (editingSlot) {
        await updateAdSlot(editingSlot.id, payload);
      } else {
        await addAdSlot(payload);
      }
      setShowModal(false);
    } catch {
      setError("Placement सेव नहीं हुआ। Admin Firestore permissions जाँचें।");
    } finally {
      setSaving(false);
    }
  }

  async function removeSlot(slot: AdSlot) {
    if (!window.confirm(`"${slot.name}" placement delete करना है?`)) return;
    try {
      await deleteAdSlot(slot.id);
    } catch {
      setLoadError("Placement delete नहीं हुआ। Admin permission जाँचें।");
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">Monetag Manual Placements</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Admin चुनता है कि किस page पर कौन-सा sponsored card दिखे।</p>
        </div>
        <button type="button" onClick={() => resetForm()} className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-secondary-button)] px-4 py-3 font-bold text-[var(--text-primary)]">
          <Plus size={18} /> Add placement
        </button>
      </div>

      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm leading-6 text-[var(--text-primary)]">
        केवल Monetag Direct Link / Smart Link इस्तेमाल होगा। Ad अपने-आप नहीं खुलेगा—उपयोगकर्ता को sponsored card का button दबाना होगा। Auto-tag, MultiTag, Popunder, Vignette और In-Page Push global रूप से load नहीं किए जाते।
      </div>

      {loading ? <p className="p-6 text-center">Loading placements…</p> : loadError ? (
        <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700">{loadError}</p>
      ) : sortedSlots.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--color-border)] p-8 text-center text-[var(--text-muted)]">अभी कोई Monetag placement नहीं है। Ad दिखाने के लिए पहले Direct Link और एक page location जोड़ें।</p>
      ) : (
        <div className="grid gap-3">
          {sortedSlots.map((slot) => {
            const placementLabel = MONETAG_PLACEMENTS.find((item) => item.id === slot.placement)?.label || slot.placement;
            return (
              <article key={slot.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-primary-button)] p-4 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold">{slot.name}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${slot.enabled ? "bg-emerald-500/15 text-emerald-700" : "bg-slate-500/15 text-[var(--text-muted)]"}`}>{slot.enabled ? "ON" : "OFF"}</span>
                    <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold text-cyan-700">{slot.environment || "test"}</span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{placementLabel}</p>
                  <p className="mt-1 flex items-center gap-1 truncate text-xs text-[var(--text-muted)]"><ExternalLink size={12}/> Monetag Direct Link configured</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => resetForm(slot)} aria-label={`Edit ${slot.name}`} className="rounded-lg border border-[var(--color-border)] p-2"><Pencil size={17}/></button>
                  <button type="button" onClick={() => void removeSlot(slot)} aria-label={`Delete ${slot.name}`} className="rounded-lg border border-red-500/30 p-2 text-red-600"><Trash2 size={17}/></button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-[var(--color-card-background)] p-5 text-[var(--text-primary)] shadow-2xl sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-xl font-black">{editingSlot ? "Edit Monetag Placement" : "Add Monetag Placement"}</h3>
              <button type="button" onClick={() => setShowModal(false)} aria-label="Close" className="rounded-full p-2 hover:bg-black/5"><X size={20}/></button>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-semibold">Admin label
                <input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} placeholder="Home sponsored card" className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input-background)] p-3"/>
              </label>
              <label className="block text-sm font-semibold">Exact page location
                <select value={placement} onChange={(event) => setPlacement(event.target.value as MonetagPlacementId)} className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input-background)] p-3">
                  {MONETAG_PLACEMENTS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold">Monetag Direct Link / Smart Link (HTTPS)
                <input type="url" inputMode="url" value={link} onChange={(event) => setLink(event.target.value)} placeholder="https://... (paste the link from Monetag dashboard)" className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input-background)] p-3"/>
              </label>
              <label className="block text-sm font-semibold">Sponsored card title
                <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input-background)] p-3"/>
              </label>
              <label className="block text-sm font-semibold">Description
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={240} rows={2} className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input-background)] p-3"/>
              </label>
              <label className="block text-sm font-semibold">Button text
                <input value={ctaLabel} onChange={(event) => setCtaLabel(event.target.value)} maxLength={32} className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input-background)] p-3"/>
              </label>
              <label className="block text-sm font-semibold">Environment
                <select value={environment} onChange={(event) => setEnvironment(event.target.value as Environment)} className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-input-background)] p-3">
                  <option value="test">Test / Preview</option>
                  <option value="production">Production</option>
                </select>
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] p-3 text-sm font-semibold">
                <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} className="h-4 w-4"/>
                Enable this exact placement
              </label>
              <p className="text-xs leading-5 text-[var(--text-muted)]">Preview deployment पर केवल Test placements दिखेंगे। Production domain पर केवल Production placements दिखेंगे। School Learning और full-screen Shorts में कोई ad slot उपलब्ध नहीं है।</p>
              {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-700">{error}</p>}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-[var(--color-border)] p-3 font-semibold">Cancel</button>
                <button type="button" disabled={saving} onClick={() => void saveSlot()} className="flex-1 rounded-xl bg-[var(--color-secondary-button)] p-3 font-bold text-[var(--text-primary)] disabled:opacity-50">{saving ? "Saving…" : "Save placement"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
