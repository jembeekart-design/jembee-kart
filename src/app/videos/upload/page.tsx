"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  FileVideo,
  GraduationCap,
  HelpCircle,
  House,
  Lightbulb,
  Loader2,
  Pause,
  Play,
  Plus,
  Upload,
  WalletCards,
  X,
} from "lucide-react";
import { auth, db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { uploadWatchVideo } from "@/lib/videos/watch-earn/uploadWatchVideo";

const MAX_VIDEO_BYTES = 500 * 1024 * 1024;

function inspectVideoDuration(selectedFile: File, onRead: (duration: number | undefined) => void) {
  const objectUrl = URL.createObjectURL(selectedFile);
  const metadataVideo = document.createElement("video");
  metadataVideo.preload = "metadata";
  metadataVideo.onloadedmetadata = () => {
    const duration = metadataVideo.duration;
    onRead(Number.isFinite(duration) && duration > 0 ? Math.round(duration) : undefined);
    URL.revokeObjectURL(objectUrl);
  };
  metadataVideo.onerror = () => {
    onRead(undefined);
    URL.revokeObjectURL(objectUrl);
  };
  metadataVideo.src = objectUrl;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(0, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadWatchVideoContent() {
  const searchParams = useSearchParams();
  const videoUrlFromParams = searchParams.get("url");

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadPaused, setUploadPaused] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [videoAccess, setVideoAccess] = useState<"free" | "paid">("free");
  const [videoFormat, setVideoFormat] = useState<"short" | "long">("short");
  const [videoDurationSeconds, setVideoDurationSeconds] = useState<number | undefined>(undefined);
  const [videoPrice, setVideoPrice] = useState("49");
  const uploadControllerRef = useRef<AbortController | null>(null);
  const pausedRef = useRef(false);
  const resumePausedUploadRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    async function loadBlob() {
      if (!videoUrlFromParams?.startsWith("blob:")) return;

      try {
        const response = await fetch(videoUrlFromParams);
        const blob = await response.blob();
        const recording = new File([blob], "recording.webm", {
          type: blob.type || "video/webm",
        });
        setFile(recording);
        inspectVideoDuration(recording, setVideoDurationSeconds);
      } catch (error) {
        console.error("Failed to load blob", error);
      }
    }

    loadBlob();
  }, [videoUrlFromParams]);

  const previewUrl = useMemo(() => {
    return file ? URL.createObjectURL(file) : null;
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function selectVideo(selected: File | null) {
    if (!selected) return;

    if (!selected.type.startsWith("video/")) {
      alert("कृपया केवल वीडियो चुनें");
      return;
    }

    if (selected.size > MAX_VIDEO_BYTES) {
      alert("वीडियो का आकार 500 MB से अधिक नहीं होना चाहिए।");
      return;
    }

    setUploadError(null);
    setUploadProgress(0);
    setFile(selected);
    setVideoDurationSeconds(undefined);
    inspectVideoDuration(selected, setVideoDurationSeconds);
  }

  function removeVideo() {
    if (loading) return;
    setFile(null);
    setVideoDurationSeconds(undefined);
    setUploadError(null);
    setUploadProgress(0);
  }

  function pauseUpload() {
    pausedRef.current = true;
    setUploadPaused(true);
  }

  function resumeUpload() {
    pausedRef.current = false;
    setUploadPaused(false);
    resumePausedUploadRef.current?.();
    resumePausedUploadRef.current = null;
  }

  function cancelUpload() {
    const controller = uploadControllerRef.current;
    if (!controller) return;
    controller.abort();
    resumePausedUploadRef.current?.();
    resumePausedUploadRef.current = null;
    pausedRef.current = false;
    setUploadPaused(false);
  }

  async function waitWhilePaused(signal: AbortSignal): Promise<void> {
    if (!pausedRef.current) return;
    if (signal.aborted) throw new DOMException("Upload cancelled", "AbortError");

    await new Promise<void>((resolve, reject) => {
      const cleanup = () => signal.removeEventListener("abort", onAbort);
      const onAbort = () => {
        cleanup();
        resumePausedUploadRef.current = null;
        reject(new DOMException("Upload cancelled", "AbortError"));
      };
      resumePausedUploadRef.current = () => {
        cleanup();
        resolve();
      };
      signal.addEventListener("abort", onAbort, { once: true });
    });
  }

  async function handleUpload() {
    try {
      if (!file) {
        alert("पहले अपना वीडियो चुनें");
        return;
      }
      if (videoAccess === "paid" && (!Number.isFinite(Number(videoPrice)) || Number(videoPrice) < 1 || Number(videoPrice) > 100000)) {
        alert("Paid वीडियो की कीमत ₹1 से ₹100000 के बीच रखें।");
        return;
      }

      const currentUser = auth.currentUser;
      if (!currentUser?.uid) {
        alert("कृपया पहले लॉगिन करें");
        return;
      }

      let username = currentUser.displayName || currentUser.email || "Unknown User";
      try {
        const userSnap = await getDoc(doc(db, "users", currentUser.uid));
        if (userSnap.exists()) {
          const userData = userSnap.data();
          username =
            (typeof userData.username === "string" && userData.username.trim()) ||
            (typeof userData.userName === "string" && userData.userName.trim()) ||
            username;
        }
      } catch (error) {
        console.warn("Failed to load username:", error);
      }

      setUploadError(null);
      setLoading(true);
      setUploadPaused(false);
      pausedRef.current = false;
      setUploadProgress(0);

      const controller = new AbortController();
      uploadControllerRef.current = controller;

      const result = await uploadWatchVideo({
        file,
        creatorId: currentUser.uid,
        displayName: currentUser.displayName || undefined,
        photoURL: currentUser.photoURL || undefined,
        username,
        caption,
        videoAccess,
        videoPrice: videoAccess === "paid" ? Number(videoPrice) : 0,
        videoFormat,
        durationSeconds: videoDurationSeconds,
        hashtags: [],
        music: "",
        isEnhanced: false,
        control: {
          signal: controller.signal,
          waitWhilePaused: () => waitWhilePaused(controller.signal),
        },
        onProgress: (uploadedBytes, totalBytes) => {
          const percent = totalBytes > 0 ? Math.round((uploadedBytes / totalBytes) * 100) : 0;
          setUploadProgress(percent);
        },
      });

      if (result.success) {
        alert("वीडियो सफलतापूर्वक भेज दिया गया है। मंजूरी के बाद यह प्रकाशित होगा।");
        setCaption("");
        setFile(null);
        setUploadProgress(0);
      } else {
        setUploadError(result.message || "वीडियो अपलोड नहीं हो पाया");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[UPLOAD_DEBUG] PAGE_ERROR", error);
      setUploadError(message);
    } finally {
      uploadControllerRef.current = null;
      pausedRef.current = false;
      resumePausedUploadRef.current = null;
      setUploadPaused(false);
      setLoading(false);
    }
  }

  const uploadedBytes = file ? Math.min(file.size, Math.round(file.size * uploadProgress / 100)) : 0;
  const durationLabel = videoDurationSeconds
    ? `${Math.floor(videoDurationSeconds / 60)}:${String(videoDurationSeconds % 60).padStart(2, "0")}`
    : "Duration will be detected during playback";

  return (
    <main className="min-h-screen bg-[#080a0f] pb-[calc(6.5rem+env(safe-area-inset-bottom))] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#080a0f]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <Link href="/" aria-label="Back to home" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white">
            <ArrowLeft size={22} />
          </Link>
          <Link href="/" className="flex items-center gap-2 text-lg font-black tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-600"><Play size={17} fill="currentColor" /></span>
            JEMBEE <span className="text-blue-400">PLAY</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/videos/history" aria-label="My uploads" className="rounded-full p-2 text-slate-300 hover:bg-white/10"><Bell size={19} /></Link>
            <button type="button" aria-label="Upload help" onClick={() => alert("वीडियो चुनें → जानकारी भरें → Google Drive पर भेजें → Admin approval के बाद प्रकाशित होगा।")} className="rounded-full p-2 text-slate-300 hover:bg-white/10"><HelpCircle size={20} /></button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-4 px-3 pb-7 pt-4 sm:px-4">
        <section className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-[#0d1b35] p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="relative">
            <p className="text-2xl font-black leading-tight sm:text-3xl">वीडियो अपलोड करें</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-300 sm:text-base">अपना ज्ञान, अनुभव या क्रिएटिव वीडियो JEMBEE PLAY पर साझा करें</p>
          </div>
        </section>

        <section aria-label="Upload steps" className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-[#11151e] p-3">
          {[
            ["1", "वीडियो चुनें", "अपने डिवाइस से"],
            ["2", "जानकारी भरें", "शीर्षक और प्रकार"],
            ["3", "अपलोड करें", "Google Drive पर सुरक्षित"],
          ].map(([number, title, detail], index) => (
            <div key={number} className="flex min-w-0 items-center gap-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-600 text-base font-black">{number}</span>
              <div className="min-w-0"><p className="truncate text-xs font-bold sm:text-sm">{title}</p><p className="mt-0.5 truncate text-[10px] text-slate-400 sm:text-xs">{detail}</p></div>
              {index < 2 ? <span className="ml-auto hidden text-slate-500 sm:inline">›</span> : null}
            </div>
          ))}
        </section>

        {!file ? (
          <label className="block cursor-pointer rounded-3xl border-2 border-dashed border-blue-500/70 bg-[#10141d] px-4 py-8 text-center transition hover:border-blue-400 hover:bg-[#111a2a]">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-600/15 text-blue-400"><Upload size={36} /></span>
            <h2 className="mt-4 text-lg font-extrabold sm:text-xl">वीडियो चुनें या यहाँ ड्रैग और ड्रॉप करें</h2>
            <p className="mt-2 text-xs text-slate-400 sm:text-sm">MP4, MOV, WEBM · अधिकतम 500 MB</p>
            <span className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-base font-bold text-white transition hover:bg-blue-500">
              <FileVideo size={19} /> वीडियो चुनें
            </span>
            <input type="file" accept="video/*" hidden onChange={(event) => { selectVideo(event.target.files?.[0] || null); event.currentTarget.value = ""; }} />
          </label>
        ) : (
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#11151e]">
            {previewUrl ? <div className="bg-black"><video src={previewUrl} controls playsInline preload="metadata" className="max-h-64 w-full object-contain" /></div> : null}
            <div className="flex items-center gap-3 p-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-600/15 text-blue-400"><FileVideo size={25} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{file.name}</p>
                <p className="mt-1 text-xs text-slate-400">{formatBytes(file.size)} · {durationLabel}</p>
              </div>
              <button type="button" onClick={removeVideo} disabled={loading} aria-label="Remove selected video" className="rounded-xl border border-white/10 p-2 text-slate-300 disabled:opacity-40"><X size={19} /></button>
            </div>
          </section>
        )}

        {loading || uploadProgress > 0 ? (
          <section className="rounded-3xl border border-white/10 bg-[#11151e] p-4" aria-live="polite" aria-label="Upload progress">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-sm font-bold"><Upload size={18} className="text-blue-400" /> अपलोड प्रगति</h2>
              <span className="text-sm font-extrabold tabular-nums">{uploadProgress}%</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-600 text-white"><FileVideo size={24} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold">{file?.name || "Video upload"}</p>
                <p className="mt-1 text-[11px] text-slate-400">{uploadPaused ? "अपलोड रोका गया है" : "Google Drive पर अपलोड हो रहा है…"}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-blue-500 transition-[width] duration-300" style={{ width: `${uploadProgress}%` }} /></div>
                <p className="mt-1 text-[11px] text-slate-400">{formatBytes(uploadedBytes)} / {formatBytes(file?.size || 0)}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <button type="button" onClick={uploadPaused ? resumeUpload : pauseUpload} disabled={!loading} className="rounded-lg border border-white/20 p-2 text-white disabled:opacity-40" aria-label={uploadPaused ? "Resume upload" : "Pause upload"}>{uploadPaused ? <Play size={18} /> : <Pause size={18} />}</button>
                <button type="button" onClick={cancelUpload} disabled={!loading} className="rounded-lg border border-red-400/50 p-2 text-red-300 disabled:opacity-40" aria-label="Cancel upload"><X size={18} /></button>
              </div>
            </div>
          </section>
        ) : null}

        {file ? (
          <section className="rounded-3xl border border-white/10 bg-[#11151e] p-4 sm:p-5">
            <h2 className="flex items-center gap-2 text-base font-extrabold"><FileVideo size={19} className="text-blue-400" /> वीडियो की जानकारी</h2>
            <label className="mt-4 block text-xs font-bold text-slate-200">शीर्षक / कैप्शन <span className="text-red-400">*</span>
              <textarea value={caption} onChange={(event) => setCaption(event.target.value.slice(0, 200))} maxLength={200} placeholder="वीडियो का शीर्षक लिखें…" className="mt-2 min-h-24 w-full resize-y rounded-xl border border-white/15 bg-[#090d14] px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500" />
            </label>
            <p className="mt-1 text-right text-[11px] text-slate-500">{caption.length}/200</p>

            <div className="mt-4">
              <p className="text-xs font-bold text-slate-200">वीडियो का प्रकार</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setVideoFormat("short")} className={`rounded-xl border p-3 text-left ${videoFormat === "short" ? "border-blue-500 bg-blue-600/15" : "border-white/10 bg-[#0b0f16]"}`}>
                  <span className="block text-sm font-bold">Shorts</span><span className="mt-1 block text-[11px] text-slate-400">Vertical · 9:16</span>
                </button>
                <button type="button" onClick={() => setVideoFormat("long")} className={`rounded-xl border p-3 text-left ${videoFormat === "long" ? "border-blue-500 bg-blue-600/15" : "border-white/10 bg-[#0b0f16]"}`}>
                  <span className="block text-sm font-bold">Long Video</span><span className="mt-1 block text-[11px] text-slate-400">Landscape · 16:9</span>
                </button>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-bold text-slate-200">वीडियो की पहुँच</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setVideoAccess("free")} className={`rounded-xl border p-3 text-sm font-bold ${videoAccess === "free" ? "border-blue-500 bg-blue-600/15" : "border-white/10 bg-[#0b0f16]"}`}>Free · मुफ़्त</button>
                <button type="button" onClick={() => setVideoAccess("paid")} className={`rounded-xl border p-3 text-sm font-bold ${videoAccess === "paid" ? "border-blue-500 bg-blue-600/15" : "border-white/10 bg-[#0b0f16]"}`}>Paid · सशुल्क</button>
              </div>
              {videoAccess === "paid" ? <label className="mt-3 block text-xs font-bold">कीमत (₹)<input type="number" min="1" max="100000" step="1" value={videoPrice} onChange={(event) => setVideoPrice(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#090d14] px-3 py-3 text-sm text-white outline-none focus:border-blue-500" /></label> : null}
            </div>
          </section>
        ) : null}

        <section className="rounded-3xl border border-white/10 bg-[#11151e] p-4">
          <h2 className="flex items-center gap-2 text-sm font-extrabold"><Lightbulb size={19} className="text-amber-300" /> अच्छी वीडियो के लिए सुझाव</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              ["वीडियो साफ और स्पष्ट हो", "camera"],
              ["छोटी और उपयोगी वीडियो", "clock"],
              ["अच्छा और गुणवत्तापूर्ण कंटेंट", "people"],
              ["कॉपीराइट व गलत कंटेंट न डालें", "safe"],
            ].map(([label, id]) => (
              <div key={id} className="flex min-h-20 items-center gap-2 rounded-xl bg-[#090d14] p-3">
                <CheckCircle2 size={18} className="shrink-0 text-green-400" />
                <span className="text-xs font-semibold leading-5 text-slate-200">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {uploadError ? (
          <section className="rounded-2xl border border-red-400/40 bg-red-950/30 p-4 text-red-200" role="alert">
            <p className="font-bold">वीडियो अपलोड नहीं हुआ</p>
            <p className="mt-1 break-words text-sm">{uploadError}</p>
            {!loading ? <p className="mt-2 text-xs text-red-300">जहां तक पहुंचा: {uploadProgress}%</p> : null}
          </section>
        ) : null}

        <button type="button" onClick={handleUpload} disabled={loading || !file} className="flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 py-4 text-base font-extrabold text-white transition hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400">
          {loading ? <><Loader2 size={22} className="animate-spin" />{uploadPaused ? "अपलोड रुका हुआ है" : `वीडियो अपलोड हो रहा है ${uploadProgress}%`}</> : <><Upload size={22} />वीडियो अपलोड करें</>}
        </button>
        <p className="text-center text-xs text-slate-500">वीडियो पहले Google Drive पर जांच के लिए भेजा जाएगा। मंजूरी के बाद प्रकाशित होगा।</p>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-white/10 bg-[#090b10]/95 px-1 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur">
        <Link href="/" className="flex flex-col items-center gap-1 py-1 text-[10px] font-semibold text-slate-300"><House size={20} /><span>होम</span></Link>
        <Link href="/videos" className="flex flex-col items-center gap-1 py-1 text-[10px] font-semibold text-slate-300"><Play size={20} /><span>वीडियो देखें</span></Link>
        <div className="flex flex-col items-center gap-1 text-[10px] font-extrabold text-blue-400"><span className="-mt-5 grid h-11 w-11 place-items-center rounded-full border-4 border-[#090b10] bg-blue-600 text-white"><Plus size={23} /></span><span>वीडियो डालें</span></div>
        <Link href="/learn/school" className="flex flex-col items-center gap-1 py-1 text-[10px] font-semibold text-slate-300"><GraduationCap size={20} /><span>सीखें</span></Link>
        <Link href="/videos/history" className="flex flex-col items-center gap-1 py-1 text-[10px] font-semibold text-slate-300"><WalletCards size={20} /><span>मेरी कमाई</span></Link>
      </nav>
    </main>
  );
}

export default function UploadWatchVideoPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#080a0f] p-6 text-white">Loading upload…</div>}><UploadWatchVideoContent /></Suspense>;
}
