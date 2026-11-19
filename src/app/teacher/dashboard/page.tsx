"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/firebase/config";
import { ArrowLeft, BookOpen, CheckCircle2, Clock3, GraduationCap, Loader2, PlayCircle, RefreshCw, UploadCloud, Wallet } from "lucide-react";

type CreatorSummary = { sampledVideos?: number; published?: number; pending?: number; rejected?: number; scope?: string };
type TeacherApplication = { status?: string; displayName?: string; qualification?: string; subjects?: string[]; experienceYears?: number; bio?: string; rejectionReason?: string | null };
type TeacherEarnings = { reconciledCommissionPaise?: number; earnings?: Array<{ id: string; amountPaise: number; status: string; createdAt: string | null }> };

const statusText: Record<string, string> = {
  not_submitted: "अभी आवेदन नहीं किया",
  pending: "जाँच के लिए लंबित",
  verified: "Verified Teacher",
  rejected: "आवेदन में सुधार आवश्यक",
  suspended: "Teacher access suspended",
};

export default function TeacherDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [creator, setCreator] = useState<CreatorSummary | null>(null);
  const [application, setApplication] = useState<TeacherApplication | null>(null);
  const [earnings, setEarnings] = useState<TeacherEarnings | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [qualification, setQualification] = useState("");
  const [subjects, setSubjects] = useState("");
  const [experienceYears, setExperienceYears] = useState("0");
  const [bio, setBio] = useState("");

  const loadDashboard = useCallback(async (currentUser: User, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const token = await currentUser.getIdToken();
      const headers = { Authorization: `Bearer ${token}` };
      const [dashboardResponse, applicationResponse, earningsResponse] = await Promise.all([
        fetch("/api/creator/dashboard", { headers, cache: "no-store" }),
        fetch("/api/teachers/verification", { headers, cache: "no-store" }),
        fetch("/api/teacher/earnings", { headers, cache: "no-store" }),
      ]);
      const [dashboardData, applicationData, earningsData] = await Promise.all([
        dashboardResponse.json().catch(() => ({})),
        applicationResponse.json().catch(() => ({})),
        earningsResponse.json().catch(() => ({})),
      ]);
      if (!dashboardResponse.ok || dashboardData.success !== true) {
        throw new Error(dashboardData.message || "Dashboard data load नहीं हो सका।");
      }
      if (!applicationResponse.ok || applicationData.success !== true) {
        throw new Error(applicationData.message || "Teacher verification status load नहीं हुआ।");
      }
      setCreator(dashboardData.creator || null);
      setApplication(applicationData.application || null);
      setEarnings(earningsResponse.ok && earningsData.success === true ? earningsData : null);
      const saved = applicationData.application;
      if (!saved) setDisplayName(currentUser.displayName || "");
      else {
        setDisplayName(typeof saved.displayName === "string" ? saved.displayName : currentUser.displayName || "");
        setQualification(typeof saved.qualification === "string" ? saved.qualification : "");
        setSubjects(Array.isArray(saved.subjects) ? saved.subjects.join(", ") : "");
        setExperienceYears(String(saved.experienceYears ?? 0));
        setBio(typeof saved.bio === "string" ? saved.bio : "");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Dashboard load नहीं हुआ।");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    if (currentUser) void loadDashboard(currentUser);
    else {
      setCreator(null);
      setApplication(null);
      setEarnings(null);
      setLoading(false);
    }
  }), [loadDashboard]);

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || submitting) return;
    setSubmitting(true);
    setNotice("");
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/teachers/verification", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          qualification: qualification.trim(),
          subjects: subjects.split(",").map((item) => item.trim()).filter(Boolean),
          experienceYears: Number(experienceYears),
          bio: bio.trim(),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success !== true) throw new Error(result.message || "Application submit नहीं हुई।");
      setNotice("Teacher verification application जमा हो गई है। Admin review के बाद status अपडेट होगा।");
      await loadDashboard(user, true);
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "Application submit नहीं हुई।");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#080d18] text-white"><Loader2 className="animate-spin" size={28}/></main>;
  if (!user) return <main className="grid min-h-screen place-items-center bg-[#080d18] p-6 text-white"><section className="max-w-md text-center"><GraduationCap className="mx-auto text-cyan-300" size={42}/><h1 className="mt-4 text-2xl font-black">Teacher Dashboard</h1><p className="mt-2 text-sm text-slate-300">अपना teacher dashboard देखने के लिए login करें।</p><Link href="/login?redirect=%2Fteacher%2Fdashboard" className="mt-5 inline-flex rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">Login करें</Link></section></main>;

  const teacherStatus = application?.status || "not_submitted";
  const pendingPaise = Math.max(0, Number(earnings?.reconciledCommissionPaise) || 0);

  return (
    <main className="min-h-screen bg-[#080d18] px-4 pb-12 pt-[env(safe-area-inset-top)] text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-3 py-5">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="Home" className="rounded-full bg-white/10 p-3"><ArrowLeft size={19}/></Link>
            <div><p className="text-xs font-bold uppercase tracking-widest text-cyan-300">JEMBEE PLAY</p><h1 className="text-2xl font-black">Teacher Dashboard</h1></div>
          </div>
          <button type="button" onClick={() => void loadDashboard(user, true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold disabled:opacity-50"><RefreshCw size={16} className={refreshing ? "animate-spin" : ""}/> Refresh</button>
        </header>

        {error && <div role="alert" className="mb-4 rounded-xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">{error}</div>}
        {notice && <div role="status" className="mb-4 rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-cyan-100">{notice}</div>}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Recent uploads sampled" value={String(creator?.sampledVideos ?? "—")} icon={<PlayCircle/>} />
          <Stat label="Published" value={String(creator?.published ?? "—")} icon={<CheckCircle2/>} />
          <Stat label="Pending review" value={String(creator?.pending ?? "—")} icon={<Clock3/>} />
          <Stat label="Rejected" value={String(creator?.rejected ?? "—")} icon={<BookOpen/>} />
        </section>
        <p className="mt-2 text-xs text-slate-500">Upload counts API की अधिकतम 100 recent records वाली sample window पर आधारित हैं; ये lifetime totals नहीं हैं।</p>

        <section className="mt-5 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-3"><GraduationCap className="text-cyan-300" size={25}/><h2 className="text-lg font-bold">Teacher Verification</h2></div>
            <p className="mt-3 text-sm text-slate-300">Status: <strong className="text-white">{statusText[teacherStatus] || teacherStatus}</strong></p>
            {teacherStatus === "verified" ? <p className="mt-2 text-sm text-emerald-200">आपका teacher profile verify है। आप school learning के लिए answer videos upload कर सकते हैं।</p>
              : teacherStatus === "pending" ? <p className="mt-2 text-sm text-amber-200">आपका आवेदन Admin review में है। अभी दूसरा आवेदन जमा करने की जरूरत नहीं है।</p>
              : teacherStatus === "suspended" ? <p className="mt-2 text-sm text-rose-200">Teacher access फिलहाल suspended है। Admin से संपर्क करें।</p>
              : <p className="mt-2 text-sm text-slate-300">Teacher verification के लिए अपनी qualification और पढ़ाए जाने वाले subjects भेजें।</p>}
            {teacherStatus === "rejected" && application?.rejectionReason ? <p className="mt-3 rounded-lg bg-rose-300/10 p-3 text-sm text-rose-100">Admin note: {application.rejectionReason}</p> : null}
            {(teacherStatus === "not_submitted" || teacherStatus === "rejected") && (
              <form onSubmit={submitApplication} className="mt-4 space-y-3">
                <label className="block text-sm">पूरा नाम<input required minLength={2} maxLength={80} value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5"/></label>
                <label className="block text-sm">Qualification<input required minLength={2} maxLength={120} value={qualification} onChange={(e) => setQualification(e.target.value)} placeholder="जैसे B.Ed, M.Sc, Graduate" className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5"/></label>
                <label className="block text-sm">Subjects (comma separated)<input required value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="Science, Maths, English" className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5"/></label>
                <label className="block text-sm">Teaching experience (years)<input required type="number" min="0" max="60" step="1" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5"/></label>
                <label className="block text-sm">Teaching introduction<textarea required minLength={1} maxLength={1000} rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="अपना teaching experience और पढ़ाने का तरीका लिखें" className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5"/></label>
                <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 disabled:opacity-50">{submitting ? <Loader2 className="animate-spin" size={17}/> : <CheckCircle2 size={17}/>} Verification submit करें</button>
              </form>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-3"><Wallet className="text-cyan-300" size={23}/><h2 className="text-lg font-bold">Teacher Referral Earnings</h2></div>
              <p className="mt-3 text-2xl font-black tabular-nums">₹{(pendingPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="mt-1 text-xs text-slate-400">Pending settlement commission; यह paid/payout amount नहीं है।</p>
              <Link href="/earnings/teacher" className="mt-4 inline-flex text-sm font-semibold text-cyan-200">पूरा earnings record देखें →</Link>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-lg font-bold">Teaching workspace</h2>
              <Link href="/learn/school" className="mt-3 flex items-center gap-3 rounded-xl bg-black/20 p-3 text-sm font-semibold"><BookOpen className="text-cyan-300"/> Learning Library खोलें</Link>
              <Link href="/videos/upload" className="mt-2 flex items-center gap-3 rounded-xl bg-black/20 p-3 text-sm font-semibold"><UploadCloud className="text-cyan-300"/> Answer / Lesson video upload करें</Link>
              <p className="mt-3 text-xs text-slate-500">School → Class → Subject/Book → Chapter → Question चुनकर upload form में answer video जोड़ें।</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><div className="flex items-center justify-between text-slate-400"><span className="text-xs">{label}</span>{icon}</div><p className="mt-3 text-2xl font-black tabular-nums">{value}</p></div>;
}
