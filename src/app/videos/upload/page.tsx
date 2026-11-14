"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, Suspense, type FormEvent } from "react";
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
  BookOpen,
  GraduationCap as SchoolCap,
} from "lucide-react";
import { auth, db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { uploadWatchVideo } from "@/lib/videos/watch-earn/uploadWatchVideo";
import { DEFAULT_EXPLORE_CATEGORIES, type ExploreCategoryRecord } from "@/lib/catalog/defaultExploreCategories";

const MAX_VIDEO_BYTES = 500 * 1024 * 1024;
type SchoolNode = { id: string; type: string; name: string; parentId?: string | null };
type SchoolNodeType = "board" | "school" | "class" | "subject" | "book" | "chapter" | "question";
const SCHOOL_NODE_TYPES: { value: SchoolNodeType; label: string; parent?: SchoolNodeType }[] = [
  { value: "board", label: "Board / Curriculum" },
  { value: "school", label: "School", parent: "board" },
  { value: "class", label: "Class", parent: "school" },
  { value: "subject", label: "Subject", parent: "class" },
  { value: "book", label: "Book", parent: "class" },
  { value: "chapter", label: "Chapter", parent: "subject" },
  { value: "question", label: "Question number", parent: "chapter" },
];

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
  const requestedCategoryId = searchParams.get("category");
  const requestedQuestionId = searchParams.get("question");

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadPaused, setUploadPaused] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [categories, setCategories] = useState<ExploreCategoryRecord[]>(DEFAULT_EXPLORE_CATEGORIES);
  const [schoolNodes, setSchoolNodes] = useState<SchoolNode[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [categoryTopic, setCategoryTopic] = useState("");
  const [schoolBoardId, setSchoolBoardId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [schoolClassId, setSchoolClassId] = useState("");
  const [schoolSubjectId, setSchoolSubjectId] = useState("");
  const [schoolBookId, setSchoolBookId] = useState("");
  const [schoolChapterId, setSchoolChapterId] = useState("");
  const [schoolQuestionId, setSchoolQuestionId] = useState("");
  const [savingCatalog, setSavingCatalog] = useState(false);
  const [catalogNotice, setCatalogNotice] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryTopics, setNewCategoryTopics] = useState("");
  const [newNodeType, setNewNodeType] = useState<SchoolNodeType>("board");
  const [newNodeName, setNewNodeName] = useState("");
  const [newNodeParentId, setNewNodeParentId] = useState("");
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

  useEffect(() => {
    let active = true;
    fetch("/api/content-categories", { cache: "no-store" })
      .then(async (response) => { if (!response.ok) throw new Error("Catalog unavailable"); return response.json(); })
      .then((data) => {
        if (!active || data.success !== true) return;
        const merged = new Map(DEFAULT_EXPLORE_CATEGORIES.map((item) => [item.id, item]));
        for (const item of (Array.isArray(data.categories) ? data.categories : []) as ExploreCategoryRecord[]) {
          if (item && typeof item.id === "string" && typeof item.name === "string") merged.set(item.id, { ...merged.get(item.id), ...item, topics: Array.isArray(item.topics) ? item.topics : [] });
        }
        setCategories([...merged.values()]);
        const loadedNodes = (Array.isArray(data.schoolNodes) ? data.schoolNodes : []) as SchoolNode[];
        setSchoolNodes(loadedNodes);
        if (requestedCategoryId && merged.has(requestedCategoryId)) setCategoryId(requestedCategoryId);
        if (requestedQuestionId) {
          const question = loadedNodes.find((item) => item.id === requestedQuestionId && item.type === "question");
          const chapter = question ? loadedNodes.find((item) => item.id === question.parentId && item.type === "chapter") : undefined;
          const subjectOrBook = chapter ? loadedNodes.find((item) => item.id === chapter.parentId && (item.type === "subject" || item.type === "book")) : undefined;
          const klass = subjectOrBook ? loadedNodes.find((item) => item.id === subjectOrBook.parentId && item.type === "class") : undefined;
          const school = klass ? loadedNodes.find((item) => item.id === klass.parentId && item.type === "school") : undefined;
          const board = school ? loadedNodes.find((item) => item.id === school.parentId && item.type === "board") : undefined;
          if (question && chapter && subjectOrBook && klass && school && board) {
            setSchoolQuestionId(question.id); setSchoolChapterId(chapter.id); setSchoolClassId(klass.id); setSchoolId(school.id); setSchoolBoardId(board.id);
            if (subjectOrBook.type === "subject") setSchoolSubjectId(subjectOrBook.id); else setSchoolBookId(subjectOrBook.id);
          }
        }
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [requestedCategoryId, requestedQuestionId]);

  const selectedCategory = categories.find((item) => item.id === categoryId);
  const isSchoolCategory = selectedCategory?.id === "school" || selectedCategory?.schoolSpecial === true;
  const schoolBoards = schoolNodes.filter((item) => item.type === "board");
  const schoolOptions = schoolNodes.filter((item) => item.type === "school" && item.parentId === schoolBoardId);
  const classOptions = schoolNodes.filter((item) => item.type === "class" && item.parentId === schoolId);
  const subjectOptions = schoolNodes.filter((item) => item.type === "subject" && item.parentId === schoolClassId);
  const bookOptions = schoolNodes.filter((item) => item.type === "book" && item.parentId === schoolClassId);
  const chapterParentId = schoolBookId || schoolSubjectId;
  const chapterOptions = schoolNodes.filter((item) => item.type === "chapter" && item.parentId === chapterParentId);
  const questionOptions = schoolNodes.filter((item) => item.type === "question" && item.parentId === schoolChapterId);
  const newNodeTypeConfig = SCHOOL_NODE_TYPES.find((item) => item.value === newNodeType)!;
  const newNodeParentOptions = newNodeType === "school" ? schoolBoards
    : newNodeType === "class" ? schoolNodes.filter((item) => item.type === "school")
    : newNodeType === "subject" || newNodeType === "book" ? schoolNodes.filter((item) => item.type === "class")
    : newNodeType === "chapter" ? schoolNodes.filter((item) => item.type === "subject" || item.type === "book")
    : newNodeType === "question" ? schoolNodes.filter((item) => item.type === "chapter") : [];

  async function creatorCatalogRequest(payload: Record<string, unknown>) {
    const user = auth.currentUser;
    if (!user) throw new Error("पहले JEMBEE PLAY में login करें।");
    const token = await user.getIdToken();
    const response = await fetch("/api/content-categories", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok || data.success !== true) throw new Error(data.message || "Catalog save नहीं हो पाया।");
    const catalogResponse = await fetch("/api/content-categories", { cache: "no-store" });
    const catalogData = await catalogResponse.json();
    if (catalogResponse.ok && catalogData.success === true) {
      const merged = new Map(DEFAULT_EXPLORE_CATEGORIES.map((item) => [item.id, item]));
      for (const item of (Array.isArray(catalogData.categories) ? catalogData.categories : []) as ExploreCategoryRecord[]) {
        if (item && typeof item.id === "string" && typeof item.name === "string") merged.set(item.id, { ...merged.get(item.id), ...item, topics: Array.isArray(item.topics) ? item.topics : [] });
      }
      setCategories([...merged.values()]);
      setSchoolNodes(Array.isArray(catalogData.schoolNodes) ? catalogData.schoolNodes as SchoolNode[] : []);
    }
    return data as { id?: string };
  }

  async function createCreatorCategory(event: FormEvent) {
    event.preventDefault();
    setSavingCatalog(true);
    setCatalogNotice("");
    try {
      const result = await creatorCatalogRequest({
        action: "save-category",
        name: newCategoryName,
        description: newCategoryDescription,
        topics: newCategoryTopics.split(/[，,\n]/).map((value) => value.trim()).filter(Boolean),
      });
      if (result.id) setCategoryId(result.id);
      setNewCategoryName(""); setNewCategoryDescription(""); setNewCategoryTopics("");
      setCatalogNotice("आपकी Category जोड़ दी गई है। अब इसे चुनकर वीडियो upload कर सकते हैं।");
    } catch (error) {
      setCatalogNotice(error instanceof Error ? error.message : "Category save नहीं हो पाई।");
    } finally { setSavingCatalog(false); }
  }

  async function createCreatorSchoolNode(event: FormEvent) {
    event.preventDefault();
    setSavingCatalog(true);
    setCatalogNotice("");
    try {
      const result = await creatorCatalogRequest({
        action: "save-school-node",
        type: newNodeType,
        name: newNodeName,
        parentId: newNodeParentId || undefined,
      });
      const id = result.id || "";
      if (newNodeType === "board") { setSchoolBoardId(id); setSchoolId(""); setSchoolClassId(""); }
      if (newNodeType === "school") { setSchoolId(id); setSchoolClassId(""); }
      if (newNodeType === "class") { setSchoolClassId(id); setSchoolSubjectId(""); setSchoolBookId(""); }
      if (newNodeType === "subject") { setSchoolSubjectId(id); setSchoolBookId(""); }
      if (newNodeType === "book") { setSchoolBookId(id); setSchoolSubjectId(""); }
      if (newNodeType === "chapter") setSchoolChapterId(id);
      if (newNodeType === "question") setSchoolQuestionId(id);
      setNewNodeName(""); setNewNodeParentId("");
      setCatalogNotice("आपकी School learning entry जोड़ दी गई है और अब चुनी जा सकती है।");
    } catch (error) {
      setCatalogNotice(error instanceof Error ? error.message : "School entry save नहीं हो पाई।");
    } finally { setSavingCatalog(false); }
  }

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
      if (!categoryId) { alert("कृपया वीडियो की Category चुनें।"); return; }
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
        categoryId,
        categoryName: selectedCategory?.name,
        categoryTopic,
        schoolBoardId,
        schoolId,
        schoolClassId,
        schoolSubjectId,
        schoolBookId,
        schoolChapterId,
        schoolQuestionId,
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

            <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.04] p-4">
              <h3 className="flex items-center gap-2 text-sm font-extrabold"><BookOpen size={18} className="text-cyan-300"/> Category & Learning Details</h3>
              <label className="mt-3 block text-xs font-bold text-slate-200">Category <span className="text-red-400">*</span>
                <select required value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setCategoryTopic(""); setSchoolBoardId(""); setSchoolId(""); setSchoolClassId(""); setSchoolSubjectId(""); setSchoolBookId(""); setSchoolChapterId(""); setSchoolQuestionId(""); }} className="mt-2 w-full rounded-xl border border-white/15 bg-[#090d14] px-3 py-3 text-sm text-white outline-none focus:border-cyan-400">
                  <option value="">Category चुनें</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <details className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
                <summary className="cursor-pointer text-xs font-bold text-cyan-200">अपनी नई Category / Topic जोड़ें</summary>
                <form onSubmit={createCreatorCategory} className="mt-3 space-y-2">
                  <input required maxLength={80} value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} placeholder="Category name" className="w-full rounded-lg border border-white/15 bg-[#090d14] px-3 py-2 text-sm"/>
                  <input maxLength={240} value={newCategoryDescription} onChange={(event) => setNewCategoryDescription(event.target.value)} placeholder="Description (optional)" className="w-full rounded-lg border border-white/15 bg-[#090d14] px-3 py-2 text-sm"/>
                  <textarea required rows={2} value={newCategoryTopics} onChange={(event) => setNewCategoryTopics(event.target.value)} placeholder="Topics / subcategories (comma separated)" className="w-full rounded-lg border border-white/15 bg-[#090d14] px-3 py-2 text-sm"/>
                  <button disabled={savingCatalog} className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-bold text-slate-950 disabled:opacity-50"><Plus size={14} className="mr-1 inline"/> Add my Category</button>
                </form>
              </details>
              {selectedCategory?.topics?.length ? <label className="mt-3 block text-xs font-bold text-slate-200">Topic / Subcategory
                <select value={categoryTopic} onChange={(event) => setCategoryTopic(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#090d14] px-3 py-3 text-sm text-white outline-none focus:border-cyan-400"><option value="">Topic चुनें (optional)</option>{selectedCategory.topics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}</select>
              </label> : null}
              {isSchoolCategory ? <div className="mt-4 space-y-3 rounded-xl border border-cyan-300/15 bg-[#081421] p-3">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-cyan-200"><SchoolCap size={16}/> School Special: Board → School → Class → Subject / Book → Chapter → Question</p>
                <label className="block text-xs font-bold">Board / Curriculum<select value={schoolBoardId} onChange={(e) => { setSchoolBoardId(e.target.value); setSchoolId(""); setSchoolClassId(""); setSchoolSubjectId(""); setSchoolBookId(""); setSchoolChapterId(""); setSchoolQuestionId(""); }} className="mt-2 w-full rounded-xl border border-white/15 bg-[#090d14] px-3 py-3 text-sm"><option value="">Board चुनें</option>{schoolBoards.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                <label className="block text-xs font-bold">School<select value={schoolId} onChange={(e) => { setSchoolId(e.target.value); setSchoolClassId(""); setSchoolSubjectId(""); setSchoolBookId(""); setSchoolChapterId(""); setSchoolQuestionId(""); }} disabled={!schoolBoardId} className="mt-2 w-full rounded-xl border border-white/15 bg-[#090d14] px-3 py-3 text-sm disabled:opacity-50"><option value="">School चुनें</option>{schoolOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                <label className="block text-xs font-bold">Class<select value={schoolClassId} onChange={(e) => { setSchoolClassId(e.target.value); setSchoolSubjectId(""); setSchoolBookId(""); setSchoolChapterId(""); setSchoolQuestionId(""); }} disabled={!schoolId} className="mt-2 w-full rounded-xl border border-white/15 bg-[#090d14] px-3 py-3 text-sm disabled:opacity-50"><option value="">Class चुनें</option>{classOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                <div className="grid gap-3 sm:grid-cols-2"><label className="block text-xs font-bold">Subject<select value={schoolSubjectId} onChange={(e) => { setSchoolSubjectId(e.target.value); setSchoolBookId(""); setSchoolChapterId(""); setSchoolQuestionId(""); }} disabled={!schoolClassId} className="mt-2 w-full rounded-xl border border-white/15 bg-[#090d14] px-3 py-3 text-sm disabled:opacity-50"><option value="">Subject चुनें</option>{subjectOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                  <label className="block text-xs font-bold">Book (optional)<select value={schoolBookId} onChange={(e) => { setSchoolBookId(e.target.value); setSchoolSubjectId(""); setSchoolChapterId(""); setSchoolQuestionId(""); }} disabled={!schoolClassId} className="mt-2 w-full rounded-xl border border-white/15 bg-[#090d14] px-3 py-3 text-sm disabled:opacity-50"><option value="">Book चुनें</option>{bookOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
                <label className="block text-xs font-bold">Chapter<select value={schoolChapterId} onChange={(e) => { setSchoolChapterId(e.target.value); setSchoolQuestionId(""); }} disabled={!chapterParentId} className="mt-2 w-full rounded-xl border border-white/15 bg-[#090d14] px-3 py-3 text-sm disabled:opacity-50"><option value="">Chapter चुनें</option>{chapterOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                <label className="block text-xs font-bold">Question Number (optional)<select value={schoolQuestionId} onChange={(e) => setSchoolQuestionId(e.target.value)} disabled={!schoolChapterId} className="mt-2 w-full rounded-xl border border-white/15 bg-[#090d14] px-3 py-3 text-sm disabled:opacity-50"><option value="">Question चुनें</option>{questionOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                <details className="rounded-xl border border-cyan-300/20 bg-black/20 p-3">
                  <summary className="cursor-pointer text-xs font-bold text-cyan-200">जानकारी नहीं मिली? अपनी School entry जोड़ें</summary>
                  <form onSubmit={createCreatorSchoolNode} className="mt-3 grid gap-2">
                    <select value={newNodeType} onChange={(event) => { setNewNodeType(event.target.value as SchoolNodeType); setNewNodeParentId(""); }} className="w-full rounded-lg border border-white/15 bg-[#090d14] px-3 py-2 text-sm">
                      {SCHOOL_NODE_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                    {newNodeTypeConfig.parent ? <select required value={newNodeParentId} onChange={(event) => setNewNodeParentId(event.target.value)} className="w-full rounded-lg border border-white/15 bg-[#090d14] px-3 py-2 text-sm"><option value="">Parent चुनें ({newNodeTypeConfig.parent})</option>{newNodeParentOptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select> : <p className="text-[11px] text-slate-400">Board एक top-level entry है।</p>}
                    <input required maxLength={120} value={newNodeName} onChange={(event) => setNewNodeName(event.target.value)} placeholder={`${newNodeTypeConfig.label} का नाम`} className="w-full rounded-lg border border-white/15 bg-[#090d14] px-3 py-2 text-sm"/>
                    <button disabled={savingCatalog || (Boolean(newNodeTypeConfig.parent) && !newNodeParentId)} className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-bold text-slate-950 disabled:opacity-50"><Plus size={14} className="mr-1 inline"/> Add School Information</button>
                  </form>
                </details>
                {catalogNotice && <p role="status" className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-2 text-xs text-cyan-100">{catalogNotice}</p>}
                {schoolBoards.length === 0 && <p className="text-xs text-amber-200">अभी School Board नहीं है। Teacher / uploader ऊपर से Board जोड़ सकता है।</p>}
              </div> : null}
            </div>

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
