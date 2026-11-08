"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";

export function MonetagGlobalControl() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (active) {
          setError("कृपया Admin अकाउंट से लॉगिन करें।");
          setLoading(false);
        }
        return;
      }

      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/admin/monetag-global", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok || data.success !== true) {
          throw new Error(data.message || "Setting लोड नहीं हुई।");
        }

        if (active) {
          setEnabled(data.enabled === true);
          setError("");
        }
      } catch (err) {
        if (active) {
          setEnabled(false);
          setError(err instanceof Error ? err.message : "Setting लोड नहीं हुई।");
        }
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function save(nextEnabled: boolean) {
    const user = auth.currentUser;
    if (!user || saving) {
      setError("कृपया Admin अकाउंट से लॉगिन करें।");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/monetag-global", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: nextEnabled }),
      });
      const data = await response.json();

      if (!response.ok || data.success !== true) {
        throw new Error(data.message || "Setting सेव नहीं हुई।");
      }

      setEnabled(data.enabled === true);
      setMessage(
        nextEnabled
          ? "Monetag ON सेव हो गया। नए पेज लोड पर script चलेगी।"
          : "Monetag OFF सेव हो गया। प्रभाव देखने के लिए वेबसाइट reload करें।"
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setting सेव नहीं हुई।");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-primary-button)] p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Monetag Global Control</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Zone ID: 297992 · पूरी वेबसाइट के लिए
          </p>
        </div>

        <span className={`rounded-full px-3 py-1 text-sm font-bold ${
          enabled ? "bg-green-500/15 text-green-700" : "bg-red-500/15 text-red-700"
        }`}>
          {loading ? "Loading..." : enabled ? "ON" : "OFF"}
        </span>
      </div>

      <button
        type="button"
        disabled={loading || saving}
        onClick={() => void save(!enabled)}
        className="rounded-xl bg-[var(--color-secondary-button)] px-5 py-3 font-bold text-[var(--text-primary)] disabled:opacity-50"
      >
        {saving ? "Saving..." : enabled ? "Turn Monetag OFF" : "Turn Monetag ON"}
      </button>

      <p className="text-xs text-[var(--text-muted)]">
        OFF करने पर नए पेज लोड में Monetag script नहीं चलेगी।
        पहले से खुले पेज को reload करें। यह Video Ads और Internal Campaigns से अलग है।
      </p>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {message && <p role="status" className="text-sm text-green-700">{message}</p>}
    </section>
  );
}
