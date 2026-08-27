"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/firebase/config";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";
import { AdSlot, AdNetwork } from "@/types/ads";
import { Plus, X, Trash2, Edit2 } from "lucide-react";
import { addAdSlot, updateAdSlot, deleteAdSlot } from "@/firestore/services/adManagement";

export function AdSlotManager({ networks }: { networks: AdNetwork[] }) {
  const [slots, setSlots] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AdSlot | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [networkId, setNetworkId] = useState("");
  const [fallbackNetworkId, setFallbackNetworkId] = useState("");
  const [adUnitId, setAdUnitId] = useState("");
  const [placement, setPlacement] = useState("");
  const [priority, setPriority] = useState(0);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const q = query(collection(db, FIRESTORE_PATHS.AD_MANAGEMENT.SLOTS));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSlots(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdSlot)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  function openModal(slot?: AdSlot) {
    if (slot) {
      setEditingSlot(slot);
      setName(slot.name);
      setNetworkId(slot.networkId);
      setFallbackNetworkId(slot.fallbackNetworkId || "");
      setAdUnitId(slot.adUnitId);
      setPlacement(slot.placement);
      setPriority(slot.priority);
      setEnabled(slot.enabled);
    } else {
      setEditingSlot(null);
      setName("");
      setNetworkId(networks[0]?.id || "");
      setFallbackNetworkId("");
      setAdUnitId("");
      setPlacement("");
      setPriority(0);
      setEnabled(false);
    }
    setShowModal(true);
  }

  async function handleSave() {
    if (!name || !networkId || !adUnitId) return;
    setSaving(true);
    try {
      if (editingSlot) {
        await updateAdSlot(editingSlot.id, { name, networkId, fallbackNetworkId, adUnitId, placement, priority, enabled });
      } else {
        await addAdSlot({ name, networkId, fallbackNetworkId, adUnitId, placement, priority, enabled, deviceTargeting: { mobile: true, desktop: true } });
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save slot");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this slot?")) return;
    await deleteAdSlot(id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">Ad Slots</h2>
        <button onClick={() => openModal()} className="flex items-center gap-2 rounded-2xl bg-[var(--color-secondary-button)] px-4 py-2 font-bold text-[var(--text-primary)]">
          <Plus size={18} /> Add Slot
        </button>
      </div>

      {loading ? <div>Loading...</div> : (
        <div className="grid gap-4">
          {slots.map(slot => (
            <div key={slot.id} className="flex items-center justify-between rounded-[28px] border border-[var(--color-border)]/10 bg-[var(--color-primary-button)] p-5">
              <div>
                <h3 className="font-bold">{slot.name}</h3>
                <p className="text-sm text-[var(--text-muted)]">Network: {networks.find(n => n.id === slot.networkId)?.name} | Placement: {slot.placement} | {slot.enabled ? "Enabled" : "Disabled"}</p>
              </div>
              <div className="flex gap-2">
                  <button onClick={() => openModal(slot)} className="text-[var(--text-primary)]"><Edit2 size={18}/></button>
                  <button onClick={() => handleDelete(slot.id)} className="text-[var(--color-danger)]"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-[30px] bg-[var(--color-card-background)] p-6">
            <h2 className="text-xl font-bold mb-4">{editingSlot ? "Edit Ad Slot" : "New Ad Slot"}</h2>
            <input className="w-full p-3 rounded-2xl mb-4 border border-[var(--color-border)] bg-[var(--color-input-background)]" placeholder="Slot Name" value={name} onChange={e => setName(e.target.value)} />
            <select className="w-full p-3 rounded-2xl mb-4 border border-[var(--color-border)] bg-[var(--color-input-background)]" value={networkId} onChange={e => setNetworkId(e.target.value)}>
                {networks.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
            <input className="w-full p-3 rounded-2xl mb-4 border border-[var(--color-border)] bg-[var(--color-input-background)]" placeholder="Ad Unit ID" value={adUnitId} onChange={e => setAdUnitId(e.target.value)} />
            <input className="w-full p-3 rounded-2xl mb-4 border border-[var(--color-border)] bg-[var(--color-input-background)]" placeholder="Placement" value={placement} onChange={e => setPlacement(e.target.value)} />
            <div className="flex items-center gap-2 mb-4">
                <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
                <label>Enabled</label>
            </div>
            <button disabled={saving} onClick={handleSave} className="w-full bg-[var(--color-primary-button)] p-3 rounded-2xl font-bold">{saving ? "Saving..." : "Save"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
