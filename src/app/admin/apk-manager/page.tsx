"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytesResumable } from "firebase/storage";
import { AlertCircle, CheckCircle2, Download, FileArchive, Smartphone, Tv, UploadCloud } from "lucide-react";
import { auth, storage } from "@/firebase/config";

type Platform = "mobile" | "tv";
type Release = { available: boolean; versionName?: string; versionCode?: number; sha256?: string; sizeBytes?: number; downloadUrl?: string; releaseNotes?: string };
const packageNames: Record<Platform, string> = { mobile: "in.jembeeplay.mobile", tv: "in.jembeeplay.tv" };

export default function ApkManagerPage() {
  const [token, setToken] = useState("");
  const [platform, setPlatform] = useState<Platform>("mobile");
  const [versionName, setVersionName] = useState("");
  const [versionCode, setVersionCode] = useState("");
  const [minimumVersionName, setMinimumVersionName] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [release, setRelease] = useState<Release | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => onAuthStateChanged(auth, async (user) => {
    if (!user) { setError("Admin login required."); return; }
    try { setToken(await user.getIdToken()); }
    catch { setError("Admin session verify nahi hua. Dobara login karein."); }
  }), []);

  useEffect(() => {
    let active = true;
    void fetch("/api/app/releases/" + platform, { cache: "no-store" })
      .then(async (response) => response.json())
      .then((data) => { if (active && data.success) setRelease(data.available ? data : { available: false }); })
      .catch(() => { if (active) setRelease({ available: false }); });
    return () => { active = false; };
  }, [platform, status]);

  async function publish() {
    setError(""); setStatus("");
    if (!token) { setError("Admin login required."); return; }
    if (!file || !file.name.toLowerCase().endsWith(".apk")) { setError("Valid .apk file select karein."); return; }
    if (file.size < 1 || file.size > 250 * 1024 * 1024) { setError("APK size 1 byte se 250 MB ke beech honi chahiye."); return; }
    if (!/^\d{1,4}\.\d{1,4}\.\d{1,4}$/.test(versionName) || !/^\d{1,4}\.\d{1,4}\.\d{1,4}$/.test(minimumVersionName)) { setError("Version format 1.2.3 jaisa hona chahiye."); return; }
    const code = Number(versionCode);
    if (!Number.isSafeInteger(code) || code < 1) { setError("Valid positive version code enter karein."); return; }

    setBusy(true); setProgress(0);
    try {
      const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
      const sha256 = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
      const storagePath = "app-releases/" + platform + "/" + code + "/" + platform + "-" + code + ".apk";
      const uploadRef = ref(storage, storagePath);
      await new Promise<void>((resolve, reject) => {
        const task = uploadBytesResumable(uploadRef, file, {
          contentType: "application/vnd.android.package-archive",
          customMetadata: { platform, versionCode: String(code), packageName: packageNames[platform], sha256, uploadedByUid: auth.currentUser?.uid || "" },
        });
        task.on("state_changed", (snapshot) => setProgress(Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100)), reject, () => resolve());
      });
      const response = await fetch("/api/admin/app-releases", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ platform, versionName, versionCode: code, minimumVersionName, releaseNotes, storagePath, sha256 }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "APK publish nahi hua.");
      setStatus("Version " + versionName + " successfully published. SHA-256 verified.");
      setRelease({ available: true, versionName, versionCode: code, sha256, sizeBytes: file.size, releaseNotes });
      setFile(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "APK upload/publish failed.");
    } finally { setBusy(false); }
  }

  const formatSize = (size?: number) => typeof size === "number" ? (size / 1024 / 1024).toFixed(1) + " MB" : "—";

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-700">JEMBEE PLAY · RELEASE OPERATIONS</p><h1 className="mt-2 text-3xl font-black">APK Update Manager</h1><p className="mt-2 text-sm text-slate-600">Signed Android APK upload, checksum verification and controlled website download publishing.</p></header>
        <section className="grid gap-4 md:grid-cols-2">
          {(["mobile", "tv"] as Platform[]).map((item) => <button key={item} type="button" onClick={() => setPlatform(item)} className={"rounded-2xl border p-5 text-left " + (platform === item ? "border-cyan-500 bg-cyan-50 ring-2 ring-cyan-100" : "border-slate-200 bg-white")}><div className="flex items-center gap-3">{item === "mobile" ? <Smartphone/> : <Tv/>}<span className="font-bold">{item === "mobile" ? "Android Mobile" : "Android TV / Google TV"}</span></div><p className="mt-2 text-xs text-slate-500">{packageNames[item]}</p></button>)}
        </section>
        <section className="rounded-2xl border bg-white p-5 md:p-7">
          <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold">Current published release</h2>{release?.available ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">Published</span> : <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">No release</span>}</div>
          {release?.available ? <div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Version</p><p className="mt-1 text-xl font-black">{release.versionName}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Version code</p><p className="mt-1 text-xl font-black">{release.versionCode}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">APK size</p><p className="mt-1 text-xl font-black">{formatSize(release.sizeBytes)}</p></div></div> : <p className="mt-3 text-sm text-slate-600">Is platform ke liye abhi koi verified APK release publish nahi hai.</p>}
          {release?.available && release.downloadUrl && <a href={release.downloadUrl} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white"><Download size={16}/> Download current APK</a>}
        </section>
        <section className="rounded-2xl border bg-white p-5 md:p-7">
          <div className="flex items-center gap-2"><UploadCloud className="text-cyan-700"/><h2 className="text-xl font-bold">Publish new APK</h2></div>
          <p className="mt-1 text-sm text-slate-500">Har release ko same permanent Android signing key se sign karein. Debug APK production update ke liye valid nahi hai.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">Version name<input value={versionName} onChange={(e) => setVersionName(e.target.value)} placeholder="0.3.0" className="mt-2 w-full rounded-xl border p-3 font-normal"/></label>
            <label className="text-sm font-semibold">Version code<input type="number" min="1" value={versionCode} onChange={(e) => setVersionCode(e.target.value)} placeholder="3" className="mt-2 w-full rounded-xl border p-3 font-normal"/></label>
            <label className="text-sm font-semibold">Minimum supported version<input value={minimumVersionName} onChange={(e) => setMinimumVersionName(e.target.value)} placeholder="0.2.0" className="mt-2 w-full rounded-xl border p-3 font-normal"/></label>
            <label className="text-sm font-semibold">Release notes<textarea value={releaseNotes} onChange={(e) => setReleaseNotes(e.target.value)} maxLength={2000} rows={3} placeholder="Bug fixes and improvements" className="mt-2 w-full rounded-xl border p-3 font-normal"/></label>
          </div>
          <label className="mt-4 block rounded-xl border-2 border-dashed border-slate-300 p-5"><span className="flex items-center gap-2 font-bold"><FileArchive size={20}/> Select signed APK</span><input type="file" accept=".apk,application/vnd.android.package-archive" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-3 block w-full text-sm"/><span className="mt-2 block text-xs text-slate-500">Maximum 250 MB · APK only · uploaded to a private Firebase Storage path</span></label>
          {file && <p className="mt-3 text-sm text-slate-600">{file.name} · {formatSize(file.size)}</p>}
          {busy && <div className="mt-4"><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-cyan-600 transition-all" style={{width: progress + "%"}}/></div><p className="mt-2 text-xs text-slate-500">Upload progress: {progress}% {progress === 100 ? "· checksum verification and publish…" : ""}</p></div>}
          {error && <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800"><AlertCircle size={17}/>{error}</p>}
          {status && <p role="status" className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 size={17}/>{status}</p>}
          <button type="button" onClick={publish} disabled={busy || !token || !file} className="mt-5 rounded-xl bg-slate-950 px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{busy ? "Publishing…" : "Upload & Publish Release"}</button>
        </section>
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">Direct APK updates open the official JEMBEE PLAY download page. Android still requires the user to approve installation and, when prompted, allow installs from that browser. Never upload debug APKs or change the signing key. Rollback must use a new higher version code; Android will reject a lower version code.</p>
      </div>
    </main>
  );
}
