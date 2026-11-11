"use client";

import { useCallback, useEffect, useState } from "react";
import { auth } from "@/firebase/config";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Bot, CheckCircle2, Copy, ExternalLink, LockKeyhole, RefreshCw, ShieldCheck, ToggleLeft, ToggleRight } from "lucide-react";

type Status = { serverConfigured: boolean; issuer: string | null; endpoint: string | null; enabled: boolean; accessMode: string; scopes: string[] };

export default function ChatGPTIntegrationPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Admin session नहीं मिली। दोबारा login करें।");
      const response = await fetch("/api/admin/mcp/settings", { headers: { Authorization: `Bearer ${await user.getIdToken()}` }, cache: "no-store" });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error(result.message || "Settings load नहीं हुईं।");
      setStatus(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Settings load नहीं हुईं।");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function toggle() {
    if (!status) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Admin session नहीं मिली।");
      const response = await fetch("/api/admin/mcp/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({ enabled: !status.enabled }),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error(result.message || "Setting save नहीं हुई।");
      setMessage(result.enabled ? "ChatGPT integration enabled. अब ChatGPT में MCP endpoint जोड़ें।" : "ChatGPT integration disabled. पुराने access tokens भी invalidate हो गए हैं।");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Setting save नहीं हुई।");
    } finally {
      setSaving(false);
    }
  }

  async function copyEndpoint() {
    if (!status?.endpoint) return;
    try {
      await navigator.clipboard.writeText(status.endpoint);
      setMessage("MCP endpoint copied.");
    } catch {
      setError("Copy नहीं हुआ। Endpoint को manually select करें।");
    }
  }

  return (
    <div className="flex min-h-screen bg-[#080d16] text-white">
      <AdminSidebar />
      <main className="min-w-0 flex-1 px-4 py-7 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600"><Bot size={26} /></div>
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">Integrations</p><h1 className="text-2xl font-black sm:text-3xl">ChatGPT Connection</h1><p className="mt-1 text-sm text-slate-400">Connect JEMBEE PLAY through secure MCP + OAuth</p></div>
            </div>
            <button onClick={() => void load()} disabled={loading} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5"><RefreshCw size={16} /> Refresh</button>
          </div>

          {loading ? <div className="mt-8 rounded-2xl border border-white/10 bg-[#111a28] p-6 text-slate-300">Loading integration settings…</div> : status && <>
            <section className="mt-8 rounded-3xl border border-white/10 bg-[#111a28] p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div><div className="flex items-center gap-2"><ShieldCheck className="text-blue-300" size={20} /><h2 className="text-lg font-bold">Connection control</h2></div><p className="mt-1 text-sm text-slate-400">Admin master switch. Disable करने पर पहले जारी किए गए सभी tokens invalid हो जाएंगे।</p></div>
                <div className={`rounded-full px-3 py-1 text-xs font-bold ${status.enabled ? "bg-emerald-400/15 text-emerald-300" : "bg-slate-400/10 text-slate-300"}`}>{status.enabled ? "ENABLED" : "DISABLED"}</div>
              </div>
              <button onClick={() => void toggle()} disabled={saving || !status.serverConfigured} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto">
                {status.enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}{saving ? "Saving…" : status.enabled ? "Disable ChatGPT connection" : "Enable ChatGPT connection"}
              </button>
              {!status.serverConfigured && <p className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">पहले Vercel Environment Variables में <code>MCP_SERVER_BASE_URL</code> को अपने canonical HTTPS origin पर set करें, उदाहरण: <code>https://jembee-kart.vercel.app</code>. फिर redeploy करें।</p>}
            </section>

            <section className="mt-5 rounded-3xl border border-white/10 bg-[#111a28] p-5 sm:p-7">
              <div className="flex items-center gap-2"><LockKeyhole size={19} className="text-blue-300" /><h2 className="text-lg font-bold">MCP server endpoint</h2></div>
              <p className="mt-1 text-sm text-slate-400">यह URL ChatGPT के custom MCP server connection में डालना है—सिर्फ homepage URL नहीं।</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <code className="min-w-0 flex-1 break-all rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-blue-100">{status.endpoint || "MCP_SERVER_BASE_URL not configured"}</code>
                <button onClick={() => void copyEndpoint()} disabled={!status.endpoint} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold hover:bg-white/5 disabled:opacity-40"><Copy size={16} /> Copy URL</button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-black/20 p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Authentication</p><p className="mt-1 font-semibold">OAuth 2.1 + PKCE S256</p></div>
                <div className="rounded-2xl bg-black/20 p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Access mode</p><p className="mt-1 font-semibold">Read-only</p></div>
              </div>
            </section>

            <section className="mt-5 rounded-3xl border border-white/10 bg-[#111a28] p-5 sm:p-7">
              <h2 className="text-lg font-bold">ChatGPT में connect करने का तरीका</h2>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <li className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">1</span><span>ChatGPT को browser में खोलें और Settings → Apps/Plugins में जाएँ।</span></li>
                <li className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">2</span><span>“Add custom MCP server” चुनें और ऊपर दिया MCP endpoint डालें।</span></li>
                <li className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">3</span><span>OAuth चुनें/स्वीकार करें। Browser JEMBEE PLAY Admin login और permission approval page खोलेगा।</span></li>
                <li className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">4</span><span>Read-only permissions approve करें। फिर ChatGPT chat में JEMBEE PLAY app/tool select करके सवाल पूछें।</span></li>
              </ol>
              <a href="https://chatgpt.com/" target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold hover:bg-white/5">Open ChatGPT <ExternalLink size={15} /></a>
            </section>

            <section className="mt-5 rounded-3xl border border-emerald-400/15 bg-emerald-400/5 p-5 sm:p-7">
              <div className="flex items-center gap-2 text-emerald-200"><CheckCircle2 size={19} /><h2 className="font-bold">इस version में ChatGPT क्या कर सकता है?</h2></div>
              <ul className="mt-3 space-y-2 text-sm text-slate-200"><li>• Approved, active, moderation-safe FREE videos की सूची पढ़ना।</li><li>• किसी approved FREE video की public metadata पढ़ना।</li><li>• Connected admin के अपने upload/moderation status पढ़ना।</li></ul>
              <p className="mt-4 text-sm font-semibold text-amber-200">कोई upload, delete, moderation approval, payment, settlement या payout action उपलब्ध नहीं है।</p>
            </section>
          </>}

          {message && <p role="status" className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">{message}</p>}
          {error && <p role="alert" className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
          <p className="mt-6 text-xs leading-5 text-slate-500">ChatGPT custom MCP connections are subject to the ChatGPT plan, workspace policy and current feature availability. The server can be ready even when the current ChatGPT account does not yet show the custom MCP option.</p>
        </div>
      </main>
    </div>
  );
}
