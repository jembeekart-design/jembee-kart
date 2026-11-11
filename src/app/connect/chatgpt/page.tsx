"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/firebase/config";
import { Bot, CheckCircle2, LockKeyhole, ShieldCheck, XCircle } from "lucide-react";

type OAuthParams = {
  client_id: string;
  redirect_uri: string;
  code_challenge: string;
  code_challenge_method: string;
  resource: string;
  scope: string;
  state: string;
};

function ConsentContent() {
  const search = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [clientName, setClientName] = useState("ChatGPT");
  const [clientVerified, setClientVerified] = useState(false);

  const params = useMemo<OAuthParams>(() => ({
    client_id: search.get("client_id") || "",
    redirect_uri: search.get("redirect_uri") || "",
    code_challenge: search.get("code_challenge") || "",
    code_challenge_method: search.get("code_challenge_method") || "",
    resource: search.get("resource") || "",
    scope: search.get("scope") || "",
    state: search.get("state") || "",
  }), [search]);

  useEffect(() => onAuthStateChanged(auth, (nextUser) => {
    setUser(nextUser);
    setAuthReady(true);
  }), []);

  useEffect(() => {
    let active = true;
    if (!params.client_id) return () => { active = false; };
    void fetch(`/api/mcp/oauth/consent?client_id=${encodeURIComponent(params.client_id)}`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json().catch(() => null);
        if (!response.ok || result?.success !== true || typeof result.clientName !== "string") throw new Error("ChatGPT client metadata could not be verified.");
        if (active) { setClientName(result.clientName); setClientVerified(true); }
      })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Client verification failed."); });
    return () => { active = false; };
  }, [params.client_id]);

  const scopeLabels = params.scope.split(/\s+/).filter(Boolean).map((scope) => {
    if (scope === "videos:read") return "Approved public free videos की जानकारी पढ़ना";
    if (scope === "uploads:read") return "आपके अपने upload/moderation status पढ़ना";
    if (scope === "offline_access") return "पुनः login के बिना token refresh (tool permission नहीं)";
    return scope;
  });

  function loginHref() {
    const returnPath = `/connect/chatgpt${window.location.search}`;
    return `/admin/login?next=${encodeURIComponent(returnPath)}`;
  }

  async function finish(approved: boolean) {
    setBusy(true);
    setError("");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (approved) {
        if (!user) throw new Error("पहले JEMBEE PLAY Admin में login करें।");
        headers.Authorization = `Bearer ${await user.getIdToken()}`;
      }
      const response = await fetch("/api/mcp/oauth/consent", {
        method: "POST",
        headers,
        cache: "no-store",
        body: JSON.stringify({ ...params, approved }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success !== true || typeof result.redirectUrl !== "string") {
        throw new Error(typeof result?.message === "string" ? result.message : "Authorization request failed.");
      }
      window.location.assign(result.redirectUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Authorization request failed.");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080d16] px-4 py-10 text-white">
      <section className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-[#111a28] p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600"><Bot size={26} /></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Secure connection request</p>
            <h1 className="text-2xl font-black">JEMBEE PLAY</h1>
          </div>
        </div>

        <h2 className="text-xl font-bold">{clientName} को access देने की अनुमति दें?</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">यह अनुमति आपके JEMBEE PLAY Admin account से जुड़ी होगी। केवल नीचे दिखाई गई read-only जानकारी साझा होगी।</p>

        <div className="mt-6 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4">
          <div className="flex items-center gap-2 font-bold text-blue-100"><ShieldCheck size={18} /> ChatGPT read-only permissions</div>
          <ul className="mt-3 space-y-3 text-sm text-slate-200">
            {scopeLabels.map((label) => <li key={label} className="flex gap-2"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-400" />{label}</li>)}
          </ul>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl bg-black/20 p-4 text-sm text-slate-300">
          <LockKeyhole size={18} className="mt-0.5 shrink-0" />
          <p>ChatGPT को Google Drive credentials, upload links, paid video files, passwords, Firebase secrets, payouts या moderation controls नहीं मिलेंगे। Access token को Admin कभी भी disable कर सकता है।</p>
        </div>

        {!clientVerified ? <p className="mt-6 text-sm text-slate-400">ChatGPT client की पहचान verify की जा रही है…</p> : !authReady ? <p className="mt-6 text-sm text-slate-400">Admin session जाँची जा रही है…</p> : !user ? (
          <div className="mt-6 rounded-xl border border-amber-300/20 bg-amber-300/10 p-4">
            <p className="text-sm text-amber-100">पहले अपने JEMBEE PLAY Admin account से login करें। Login के बाद आप इसी अनुमति पेज पर वापस आएँगे।</p>
            <a href={loginHref()} className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">Admin Login</a>
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-300">Signed in: <span className="font-semibold text-white">{user.email || "JEMBEE PLAY admin"}</span>. Server केवल admin/super_admin role स्वीकार करेगा।</p>
        )}

        {error && <p role="alert" className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}

        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => finish(true)} disabled={busy || !user || !authReady || !clientVerified} className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{busy ? "Processing…" : "Allow read-only access"}</button>
          <button type="button" onClick={() => finish(false)} disabled={busy || !clientVerified} className="flex items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3 font-semibold text-slate-200 disabled:opacity-40"><XCircle size={17} /> Deny</button>
        </div>
        <p className="mt-5 text-center text-xs text-slate-500">JEMBEE PLAY कभी भी आपका password या Google Drive token ChatGPT को नहीं भेजेगा।</p>
      </section>
    </main>
  );
}

export default function ChatGPTConsentPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#080d16] p-8 text-white">Loading secure consent…</div>}><ConsentContent /></Suspense>;
}
