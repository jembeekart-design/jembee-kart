"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/client/adminFetch";

type DiagnosticEvent = {
  id: string;
  event: string;
  provider: string;
  placement: string;
  environment: string;
  billable: false;
  createdAt: string | null;
};
type DiagnosticsResponse = {
  success: boolean;
  providerStatus: { masterEnabled: boolean; exoclickEnvironmentEnabled: boolean; activeMonetagSlots: number };
  events: DiagnosticEvent[];
};

export function AdDiagnosticsPanel() {
  const [data, setData] = useState<DiagnosticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    setError("");
    try {
      const response = await adminFetch("/api/admin/ad-diagnostics");
      const result = await response.json() as DiagnosticsResponse;
      if (!response.ok || result.success !== true) throw new Error("Ad diagnostics load नहीं हुए।");
      setData(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Ad diagnostics load नहीं हुए।");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-[#111a28] p-5 text-white sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">संचालन और QA</p>
          <h2 className="mt-1 text-xl font-black">Ad Network स्थिति और जाँच</h2>
          <p className="mt-1 text-sm text-slate-400">ये operational diagnostics हैं, billable impressions/clicks या settlement evidence नहीं।</p>
        </div>
        <button type="button" onClick={() => void load()} disabled={refreshing} className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold disabled:opacity-50">{refreshing ? "रीफ्रेश हो रहा है…" : "लॉग रीफ्रेश करें"}</button>
      </div>

      {loading ? <p className="text-sm text-slate-400">Ad स्थिति लोड हो रही है…</p> : null}
      {error ? <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p> : null}
      {data ? <>
        <p className="rounded-xl border border-cyan-300/15 bg-cyan-300/5 p-3 text-xs leading-5 text-cyan-100">
          Shorts और Long Video में VAST request, ad start, no-fill, timeout और error events यहाँ दिखेंगे। No-fill का अर्थ है provider ने उस request के लिए playable ad नहीं लौटाया।
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Status label="Global Ads Master" enabled={data.providerStatus.masterEnabled} />
          <Status label="ExoClick Environment Flag" enabled={data.providerStatus.exoclickEnvironmentEnabled} />
          <div className="rounded-xl border border-white/10 bg-black/20 p-3"><p className="text-xs text-slate-400">Enabled Monetag slots</p><p className="mt-1 text-2xl font-black tabular-nums">{data.providerStatus.activeMonetagSlots}</p></div>
        </div>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase text-slate-400"><tr><th className="p-3">Time</th><th className="p-3">Event</th><th className="p-3">Provider</th><th className="p-3">Placement</th><th className="p-3">Environment</th><th className="p-3">Billing</th></tr></thead>
            <tbody>{data.events.length ? data.events.map((event) => <tr key={event.id} className="border-t border-white/10"><td className="p-3 text-slate-300">{event.createdAt ? new Date(event.createdAt).toLocaleString() : "—"}</td><td className="p-3 font-semibold">{event.event}</td><td className="p-3">{event.provider}</td><td className="p-3 text-slate-300">{event.placement}</td><td className="p-3">{event.environment}</td><td className="p-3"><span className="rounded-full bg-slate-500/15 px-2 py-1 text-xs text-slate-300">Non-billable</span></td></tr>) : <tr><td colSpan={6} className="p-6 text-center text-slate-500">अभी कोई ad diagnostic event नहीं है।</td></tr>}</tbody>
          </table>
        </div>
      </> : null}
    </section>
  );
}

function Status({ label, enabled }: { label: string; enabled: boolean }) {
  return <div className="rounded-xl border border-white/10 bg-black/20 p-3"><p className="text-xs text-slate-400">{label}</p><p className={`mt-1 text-sm font-black ${enabled ? "text-emerald-300" : "text-amber-300"}`}>{enabled ? "ENABLED" : "DISABLED"}</p></div>;
}
