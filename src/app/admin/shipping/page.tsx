"use client";

import { useEffect, useState } from "react";
import { auth } from "@/firebase/config";
import { Save, Truck, Loader2 } from "lucide-react";

type ShippingSettings = {
  freeShipping: boolean;
  shippingCharge: string;
  freeShippingThreshold: string;
  deliveryDays: string;
};

const EMPTY: ShippingSettings = {
  freeShipping: false,
  shippingCharge: "0",
  freeShippingThreshold: "",
  deliveryDays: "0",
};

export default function ShippingPage() {
  const [settings, setSettings] = useState<ShippingSettings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function requestSettings(method: "GET" | "PUT", payload?: unknown) {
    const user = auth.currentUser;
    if (!user) throw new Error("Please sign in with an admin account.");
    const token = await user.getIdToken();
    const response = await fetch("/api/admin/shipping", {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(payload ? { "Content-Type": "application/json" } : {}),
      },
      ...(payload ? { body: JSON.stringify(payload) } : {}),
      cache: "no-store",
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.success !== true) {
      throw new Error(result?.message || "Shipping settings request failed.");
    }
    return result;
  }

  useEffect(() => {
    let active = true;
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        if (active) { setError("Please sign in with an admin account."); setLoading(false); }
        return;
      }
      try {
        const result = await requestSettings("GET");
        if (active) {
          const value = result.settings;
          setSettings({
            freeShipping: value.freeShipping === true,
            shippingCharge: String(value.shippingCharge ?? 0),
            freeShippingThreshold: value.freeShippingThreshold == null ? "" : String(value.freeShippingThreshold),
            deliveryDays: String(value.deliveryDays ?? 0),
          });
          if (value.shippingConfigured !== true) setMessage("Shipping is not configured yet. Save an explicit policy before using it in checkout.");
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Unable to load shipping settings.");
      } finally {
        if (active) setLoading(false);
      }
    });
    return () => { active = false; unsubscribe(); };
  }, []);

  const update = (key: keyof ShippingSettings, value: string | boolean) =>
    setSettings((current) => ({ ...current, [key]: value }));

  async function save() {
    setSaving(true); setMessage(""); setError("");
    try {
      if (!settings.shippingCharge.trim() || !settings.deliveryDays.trim()) {
        throw new Error("Shipping charge and delivery days are required.");
      }
      if (settings.freeShippingThreshold.trim() !== "" && !/^\\d+(?:\\.\\d{1,2})?$/.test(settings.freeShippingThreshold.trim())) {
        throw new Error("Free-shipping threshold must be a valid amount with at most two decimals.");
      }
      if (!/^\\d+(?:\\.\\d{1,2})?$/.test(settings.shippingCharge.trim()) || !/^\\d+$/.test(settings.deliveryDays.trim())) {
        throw new Error("Enter a valid shipping charge and whole-number delivery days.");
      }
      const shippingCharge = Number(settings.shippingCharge);
      const threshold = settings.freeShippingThreshold.trim() === "" ? null : Number(settings.freeShippingThreshold);
      const deliveryDays = Number(settings.deliveryDays);
      const result = await requestSettings("PUT", {
        freeShipping: settings.freeShipping,
        shippingCharge,
        freeShippingThreshold: threshold,
        deliveryDays,
      });
      setMessage(result.message || "Shipping settings saved successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save shipping settings.");
    } finally { setSaving(false); }
  }

  if (loading) return <main className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></main>;

  return (
    <main className="min-h-screen bg-[var(--color-page-background)] p-4 text-[var(--text-primary)]">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 flex items-center gap-3">
          <Truck size={28} />
          <div>
            <h1 className="text-2xl font-bold">Shipping Settings</h1>
            <p className="text-sm text-[var(--text-secondary)]">Manage the shipping policy used for future order quotes.</p>
          </div>
        </header>

        <section className="space-y-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-background)] p-5">
          <label className="flex items-center justify-between gap-4">
            <span className="font-semibold">Free shipping on all orders</span>
            <input type="checkbox" checked={settings.freeShipping}
              onChange={(e) => update("freeShipping", e.target.checked)} />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Standard delivery charge (₹)</span>
            <input type="number" min="0" max="100000" step="0.01" inputMode="decimal"
              value={settings.shippingCharge} onChange={(e) => update("shippingCharge", e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-transparent p-3" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Free shipping threshold (₹, optional)</span>
            <input type="number" min="0" max="100000" step="0.01" inputMode="decimal"
              value={settings.freeShippingThreshold} onChange={(e) => update("freeShippingThreshold", e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-transparent p-3" />
            <span className="mt-1 block text-xs text-[var(--text-secondary)]">Leave blank if there is no minimum order threshold.</span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Estimated delivery days</span>
            <input type="number" min="0" max="90" step="1"
              value={settings.deliveryDays} onChange={(e) => update("deliveryDays", e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-transparent p-3" />
          </label>

          {message && <p role="status" className="text-sm text-[var(--color-success)]">{message}</p>}
          {error && <p role="alert" className="text-sm text-[var(--color-danger)]">{error}</p>}

          <button type="button" onClick={save} disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-button)] p-3 font-bold text-[var(--button-text-color)] disabled:opacity-60">
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </section>
        <p className="mt-4 text-xs text-[var(--text-secondary)]">
          Changes are stored securely. Checkout totals will use this policy only after the server-side invoice quote integration is completed.
        </p>
      </div>
    </main>
  );
}
