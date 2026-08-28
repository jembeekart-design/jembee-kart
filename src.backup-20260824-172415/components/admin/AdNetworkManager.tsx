"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/firebase/config";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";
import { AdNetwork, AdNetworkMode } from "@/types/ads";
import { Plus, X } from "lucide-react";
import { addAdNetwork } from "@/firestore/services/adManagement";
import { AdSlotManager } from "./AdSlotManager";

export function AdNetworkManager() {
  const [networks, setNetworks] = useState<AdNetwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"networks" | "slots">("networks");
  
  // Create form state
  const [name, setName] = useState("");
  const [mode, setMode] = useState<AdNetworkMode>("GAM");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, FIRESTORE_PATHS.AD_MANAGEMENT.NETWORKS));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdNetwork));
      setNetworks(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  async function handleCreate() {
    if (!name) return;
    setSaving(true);
    try {
        await addAdNetwork({
            name,
            mode,
            enabled: false,
            environment: "test",
            priority: 0,
            fallbackEnabled: false,
            supportedSlots: [],
            config: {},
        });
        setShowCreate(false);
        setName("");
    } catch (err) {
        console.error(err);
        alert("Failed to create network");
    } finally {
        setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
        <div className="flex gap-4">
          <button onClick={() => setActiveSubTab("networks")} className={`font-bold ${activeSubTab === "networks" ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>Networks</button>
          <button onClick={() => setActiveSubTab("slots")} className={`font-bold ${activeSubTab === "slots" ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>Slots</button>
        </div>

      {activeSubTab === "networks" ? (
        <>
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black">Ad Networks</h2>
                <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 rounded-2xl bg-[var(--color-secondary-button)] px-4 py-2 font-bold text-[var(--text-primary)]"
                >
                <Plus size={18} />
                Add Network
                </button>
            </div>

            {loading ? (
                <div className="p-8 text-center">Loading...</div>
            ) : (
                <div className="grid gap-4">
                {networks.map((network) => (
                    <div key={network.id} className="rounded-[28px] border border-[var(--color-border)]/10 bg-[var(--color-primary-button)] p-5">
                    <h3 className="text-lg font-bold">{network.name}</h3>
                    <p className="text-sm text-[var(--text-muted)]">Mode: {network.mode} | Status: {network.enabled ? "Enabled" : "Disabled"}</p>
                    </div>
                ))}
                </div>
            )}

            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                <div className="w-full max-w-sm rounded-[30px] bg-[var(--color-card-background)] p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Add New Network</h2>
                        <button onClick={() => setShowCreate(false)}><X size={20}/></button>
                    </div>
                    <input className="w-full p-3 rounded-2xl mb-4 border border-[var(--color-border)] bg-[var(--color-input-background)]" placeholder="Network Name" value={name} onChange={e => setName(e.target.value)} />
                    <select className="w-full p-3 rounded-2xl mb-4 border border-[var(--color-border)] bg-[var(--color-input-background)]" value={mode} onChange={e => setMode(e.target.value as AdNetworkMode)}>
                        <option value="GAM">Google Ad Manager</option>
                        <option value="AdSense_Auto">AdSense Auto Ads</option>
                        <option value="AdSense_Manual">AdSense Manual Ad Units</option>
                    </select>
                    <button disabled={saving} onClick={handleCreate} className="w-full bg-[var(--color-primary-button)] p-3 rounded-2xl font-bold">{saving ? "Saving..." : "Create"}</button>
                </div>
                </div>
            )}
        </>
      ) : (
        <AdSlotManager networks={networks} />
      )}
    </div>
  );
}
