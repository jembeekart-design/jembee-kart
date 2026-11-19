"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/firebase/config";
import { ArrowLeft, CheckCircle2, Clock3, Loader2, PlusCircle, RefreshCw, School, ShieldCheck, XCircle } from "lucide-react";

type SchoolRecord = {
  id: string;
  name: string;
  board: string;
  city: string;
  state: string;
  branch?: string | null;
  status: "pending" | "approved" | "rejected" | string;
  reviewReason?: string | null;
};

const statusLabel: Record<string, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

export default function EducationSchoolsAdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("pending");
  const [name, setName] = useState("");
  const [board, setBoard] = useState("CBSE");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Jharkhand");
  const [branch, setBranch] = useState("");
  const [reviewReason, setReviewReason] = useState("");

  const loadSchools = useCallback(async (currentUser: User) => {
    setBusy(true);
    setError("");
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/education/schools", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success !== true) throw new Error(data.message || "School catalog load नहीं हुआ।");
      setSchools(Array.isArray(data.schools) ? data.schools : []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "School catalog load नहीं हुआ।");
      setSchools([]);
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    if (currentUser) void loadSchools(currentUser);
    else {
      setSchools([]);
      setError("Admin login आवश्यक है।");
      setLoading(false);
    }
  }), [loadSchools]);

  async function createSchool(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || saving) return;
    setSaving(true);
    setNotice("");
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/education/schools", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name, board, city, state, branch }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success !== true) throw new Error(data.message || "School request save नहीं हुई।");
      setNotice(data.message || "School request pending review में भेजी गई।");
      setName("");
      setCity("");
      setBranch("");
      setFilter("pending");
      await loadSchools(user);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "School request save नहीं हुई।");
    } finally {
      setSaving(false);
    }
  }

  async function reviewSchool(record: SchoolRecord, status: "approved" | "rejected") {
    if (!user || busy) return;
    if (status === "rejected" && reviewReason.trim().length < 3) {
      setError("Reject करने से पहले कम-से-कम 3 अक्षर का कारण लिखें।");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/education/schools/review", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id: record.id, status, reason: status === "rejected" ? reviewReason.trim() : "" }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success !== true) throw new Error(data.message || "School review save नहीं हुआ।");
      setNotice(status === "approved" ? "School approved और public catalog में publish हो गया।" : "School request reject कर दी गई।");
      setReviewReason("");
      await loadSchools(user);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "School review save नहीं हुआ।");
    } finally {
      setBusy(false);
    }
  }

  const filtered = schools.filter((item) => filter === "all" || item.status === filter);
  const pending = schools.filter((item) => item.status === "pending").length;
  const approved = schools.filter((item) => item.status === "approved").length;
  const rejected = schools.filter((item) => item.status === "rejected").length;

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#080d18] text-white"><Loader2 className="animate-spin" size={28}/></main>;
  if (!user) return <main className="grid min-h-screen place-items-center bg-[#080d18] p-6 text-white"><section className="text-center"><School className="mx-auto text-cyan-300" size={40}/><h1 className="mt-3 text-2xl font-black">School Management</h1><p className="mt-2 text-sm text-slate-300">Admin login करके school catalog manage करें।</p><Link href="/admin/login" className="mt-4 inline-flex rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">Admin Login</Link></section></main>;

  return (
    <main className="min-h-screen bg-[#080d18] p-4 text-white sm:p-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-400"><ArrowLeft size={16}/> Admin Dashboard</Link>
        <header className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3"><span className="rounded-xl bg-cyan-400/10 p-3 text-cyan-300"><School size={25}/></span><div><p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Education Catalog</p><h1 className="text-2xl font-black">School Management</h1></div></div>
          <button type="button" onClick={() => void loadSchools(user)} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold disabled:opacity-50"><RefreshCw size={16} className={busy ? "animate-spin" : ""}/> Refresh</button>
        </header>

        {error && <p role="alert" className="mt-4 rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100">{error}</p>}
        {notice && <p role="status" className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100">{notice}</p>}

        <section className="mt-6 grid grid-cols-3 gap-3">
          <Count label="Pending" value={pending} icon={<Clock3/>}/>
          <Count label="Approved" value={approved} icon={<CheckCircle2/>}/>
          <Count label="Rejected" value={rejected} icon={<XCircle/>}/>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold"><PlusCircle size={19} className="text-cyan-300"/> Add School</h2>
          <p className="mt-1 text-sm text-slate-400">नया school पहले pending रहेगा। Admin approval के बाद ही public learning catalog में दिखाई देगा।</p>
          <form onSubmit={createSchool} className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">School Name<input required minLength={2} maxLength={160} value={name} onChange={(e) => setName(e.target.value)} placeholder="Official school name" className="mt-1 w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2.5"/></label>
            <label className="text-sm">Board / Pattern<select value={board} onChange={(e) => setBoard(e.target.value)} className="mt-1 w-full rounded-xl border border-white/15 bg-[#0b1220] px-3 py-2.5"><option value="CBSE">CBSE</option><option value="ICSE">ICSE</option><option value="JAC">JAC</option><option value="BSEB">BSEB</option><option value="OTHER_STATE">Other State Board</option></select></label>
            <label className="text-sm">City<input required minLength={2} maxLength={100} value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="mt-1 w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2.5"/></label>
            <label className="text-sm">State<input required minLength={2} maxLength={100} value={state} onChange={(e) => setState(e.target.value)} className="mt-1 w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2.5"/></label>
            <label className="text-sm">Branch / Campus (optional)<input maxLength={120} value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="Branch or locality" className="mt-1 w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2.5"/></label>
            <div className="sm:col-span-2"><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 disabled:opacity-50">{saving ? <Loader2 className="animate-spin" size={17}/> : <PlusCircle size={17}/>} Submit for review</button></div>
          </form>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">School Requests & Catalog</h2><p className="text-xs text-slate-400">{schools.length} records returned by the secured school catalog API</p></div><select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-white/15 bg-[#0b1220] px-3 py-2 text-sm"><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="all">All statuses</option></select></div>
          {filtered.length === 0 ? <p className="mt-5 rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-slate-400">इस filter में कोई school record नहीं है।</p> : <div className="mt-4 space-y-3">{filtered.map((item) => <article key={item.id} className="rounded-xl border border-white/10 bg-black/20 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">{item.name}</h3><p className="mt-1 text-xs text-slate-400">{item.board} · {item.city}, {item.state}{item.branch ? ` · ${item.branch}` : ""}</p><p className="mt-2 text-xs font-semibold text-cyan-200">{statusLabel[item.status] || item.status}</p>{item.reviewReason && <p className="mt-2 text-xs text-rose-200">Review note: {item.reviewReason}</p>}</div><span className="max-w-[100px] truncate text-[10px] text-slate-500" title={item.id}>{item.id.slice(0, 10)}…</span></div>{item.status === "pending" && <div className="mt-4 flex flex-wrap items-center gap-2"><button type="button" disabled={busy} onClick={() => void reviewSchool(item, "approved")} className="rounded-lg bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 disabled:opacity-50">Approve & publish</button><button type="button" disabled={busy || reviewReason.trim().length < 3} onClick={() => void reviewSchool(item, "rejected")} className="rounded-lg border border-rose-300/30 px-4 py-2 text-xs font-bold text-rose-200 disabled:opacity-40">Reject</button></div>}</article>)}</div>}
          {filtered.some((item) => item.status === "pending") && <label className="mt-4 block text-sm">Reject reason (required for rejection)<textarea value={reviewReason} onChange={(e) => setReviewReason(e.target.value)} maxLength={500} rows={2} placeholder="Explain what needs correction" className="mt-1 w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2.5"/></label>}
        </section>
        <p className="mt-5 flex items-center gap-2 text-xs text-slate-500"><ShieldCheck size={15}/> Every create and review request is verified server-side with Admin RBAC. Duplicate school records are rejected by the backend.</p>
      </div>
    </main>
  );
}

function Count({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3"><div className="flex items-center justify-between text-slate-400"><span className="text-xs">{label}</span>{icon}</div><p className="mt-2 text-xl font-black tabular-nums">{value}</p></div>;
}
