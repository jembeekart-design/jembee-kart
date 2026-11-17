"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import toast, { Toaster } from "react-hot-toast";
import {
  AlertCircle, Download, FileText, Folder, HardDrive, Image as ImageIcon,
  Loader2, Play, RefreshCw, Search, Trash2, Video, X,
} from "lucide-react";
import { db } from "@/firebase/config";

type MediaVideo = {
  id: string;
  title: string;
  status: string;
  active: boolean;
  moderation: string;
  videoAccess: string;
  driveFileId: string;
  thumbnailUrl: string;
  sizeBytes: number | null;
  createdAt: Date | null;
};

const formatBytes = (bytes: number | null) => {
  if (bytes === null) return "Size not recorded";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const toDate = (value: unknown): Date | null => {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate();
  }
  if (value instanceof Date) return value;
  return null;
};

export default function MediaLibraryPage() {
  const [search, setSearch] = useState("");
  const [videos, setVideos] = useState<MediaVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<MediaVideo | null>(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const auth = getAuth();
      if (!auth.currentUser) throw new Error("Admin session नहीं मिला। दोबारा login करें।");
      const snapshot = await getDocs(query(
        collection(db, "watchEarnVideos"),
        orderBy("createdAt", "desc"),
        limit(250),
      ));
      const rows = snapshot.docs.map((doc) => {
        const data = doc.data();
        const rawSize = data.sizeBytes ?? data.fileSizeBytes ?? data.fileSize;
        return {
          id: doc.id,
          title: typeof data.title === "string" && data.title.trim() ? data.title.trim() : "Untitled video",
          status: typeof data.status === "string" ? data.status : "unknown",
          active: data.active === true,
          moderation: typeof data.moderation === "string" ? data.moderation : "unknown",
          videoAccess: typeof data.videoAccess === "string" ? data.videoAccess : "free",
          driveFileId: typeof data.driveFileId === "string" ? data.driveFileId : "",
          thumbnailUrl: typeof data.thumbnailUrl === "string" ? data.thumbnailUrl : typeof data.thumbnail === "string" ? data.thumbnail : "",
          sizeBytes: typeof rawSize === "number" && Number.isSafeInteger(rawSize) && rawSize >= 0 ? rawSize : null,
          createdAt: toDate(data.createdAt),
        } satisfies MediaVideo;
      });
      setVideos(rows);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Media list load नहीं हो सकी।";
      setError(message);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchVideos(); }, [fetchVideos]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? videos.filter((video) => video.title.toLowerCase().includes(term) || video.id.toLowerCase().includes(term)) : videos;
  }, [videos, search]);

  const knownSizes = videos.filter((video) => video.sizeBytes !== null);
  const totalKnownBytes = knownSizes.reduce((sum, video) => sum + (video.sizeBytes || 0), 0);
  const canShowStorage = knownSizes.length > 0;
  const approvedFreeCount = videos.filter((video) => video.status === "approved" && video.active && video.moderation === "safe" && video.videoAccess !== "paid").length;

  const handleDelete = async (video: MediaVideo) => {
    if (!window.confirm(`“${video.title}” को permanently delete करना है? यह action वापस नहीं होगा।`)) return;
    setDeletingId(video.id);
    try {
      const token = await getAuth().currentUser?.getIdToken();
      if (!token) throw new Error("Admin session समाप्त हो गया। दोबारा login करें।");
      const response = await fetch("/api/admin/delete-video", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ videoId: video.id }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success !== true) throw new Error(typeof result.message === "string" ? result.message : "Video delete नहीं हुआ।");
      toast.success("Video और उससे जुड़े records delete कर दिए गए।");
      setVideos((current) => current.filter((item) => item.id !== video.id));
      if (preview?.id === video.id) setPreview(null);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Delete असफल रहा।");
    } finally {
      setDeletingId(null);
    }
  };

  const canPreview = (video: MediaVideo) => video.status === "approved" && video.active && video.moderation === "safe" && Boolean(video.driveFileId);

  return (
    <main className="min-h-screen bg-[var(--color-page-background)] p-4 text-[var(--button-text-color)] md:p-6">
      <Toaster position="top-center" />
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-color)]"><Folder size={28} /></div>
            <div>
              <h1 className="text-2xl font-black md:text-3xl">Media Library</h1>
              <p className="text-sm text-[var(--muted-text-color)]">Firestore में दर्ज video assets का live admin view</p>
            </div>
          </div>
          <button type="button" onClick={() => void fetchVideos()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-color)] px-4 py-3 font-semibold disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />} Refresh
          </button>
        </header>

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat title="Videos loaded" value={loading ? "…" : String(videos.length)} note="अधिकतम 250 नवीन records" icon={<Video />} />
          <Stat title="Approved & safe" value={loading ? "…" : String(approvedFreeCount)} note="सुरक्षित free playback records" icon={<Play />} />
          <Stat title="Images" value="Not connected" note="Image collection अभी जोड़ी नहीं गई" icon={<ImageIcon />} />
          <Stat title="Storage usage" value={canShowStorage ? formatBytes(totalKnownBytes) : "Unknown"} note={canShowStorage ? `${knownSizes.length} videos का recorded size` : "Drive metadata से size अभी उपलब्ध नहीं"} icon={<HardDrive />} />
        </section>

        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] px-4 py-3">
          <Search size={20} className="shrink-0" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Video title या ID खोजें…" className="w-full bg-transparent outline-none" />
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--muted-text-color)]">
          <span>{filtered.length} result(s) · {videos.length} loaded</span>
          <span>Upload / image / document manager अभी उपलब्ध नहीं है</span>
        </div>

        {error ? (
          <div role="alert" className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5">
            <div className="flex items-center gap-2 font-bold"><AlertCircle size={19} /> Media Library load नहीं हुई</div>
            <p className="mt-2 text-sm">{error}</p>
            <p className="mt-2 text-xs text-[var(--muted-text-color)]">Admin role, Firebase project configuration और Firestore read permission जाँचें। कोई demo count नहीं दिखाया गया है।</p>
            <button type="button" onClick={() => void fetchVideos()} className="mt-4 rounded-lg bg-[var(--primary-color)] px-4 py-2 font-semibold">Retry</button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-[var(--border-color)] p-12"><Loader2 className="animate-spin" /> Real video records load हो रहे हैं…</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-color)] p-12 text-center">
            <Video className="mx-auto mb-3 opacity-60" size={36} />
            <h2 className="font-bold">{videos.length ? "कोई matching video नहीं मिला" : "अभी कोई video record नहीं मिला"}</h2>
            <p className="mt-2 text-sm text-[var(--muted-text-color)]">यह सूची Firestore के watchEarnVideos collection से आती है।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((video) => (
              <article key={video.id} className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)]">
                <div className="relative flex aspect-video items-center justify-center bg-black/80">
                  {video.thumbnailUrl ? <img src={video.thumbnailUrl} alt="" className="h-full w-full object-cover" loading="lazy" /> : <Video size={42} className="text-white/70" />}
                  <span className="absolute bottom-2 left-2 rounded-md bg-black/75 px-2 py-1 text-xs text-white">{video.status}</span>
                </div>
                <div className="p-4">
                  <h2 className="truncate font-bold" title={video.title}>{video.title}</h2>
                  <p className="mt-1 text-xs text-[var(--muted-text-color)]">ID: {video.id}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-[var(--primary-color)]/15 px-2 py-1">{video.moderation}</span>
                    <span className="rounded-full bg-[var(--primary-color)]/15 px-2 py-1">{video.active ? "Active" : "Inactive"}</span>
                    <span className="rounded-full bg-[var(--primary-color)]/15 px-2 py-1">{video.videoAccess}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted-text-color)]">
                    <span>{formatBytes(video.sizeBytes)}</span>
                    <span>{video.createdAt ? video.createdAt.toLocaleDateString() : "Date unavailable"}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <button type="button" onClick={() => setPreview(video)} disabled={!canPreview(video)} title={canPreview(video) ? "Preview video" : "केवल approved, active और safe video preview हो सकता है"} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--primary-color)] px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"><Play size={16} /> Preview</button>
                    <button type="button" onClick={() => void handleDelete(video)} disabled={deletingId === video.id} className="inline-flex items-center justify-center rounded-lg border border-red-500/40 px-3 py-2 text-red-500 disabled:opacity-50" aria-label={`Delete ${video.title}`}>
                      {deletingId === video.id ? <Loader2 className="animate-spin" size={17} /> : <Trash2 size={17} />}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <section className="mt-8 rounded-2xl border border-[var(--border-color)] p-5">
          <div className="flex items-center gap-2 font-bold"><FileText size={19} /> Media coverage status</div>
          <p className="mt-2 text-sm text-[var(--muted-text-color)]">यह release केवल Firestore video records को live दिखाती है। Images, documents, complete Drive inventory, upload और full-file download को तब तक उपलब्ध नहीं बताया जाएगा जब तक उनके लिए सुरक्षित backend और storage metadata integration तैयार व test न हो जाए।</p>
        </section>
      </div>

      {preview && canPreview(preview) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" role="dialog" aria-modal="true" aria-label="Video preview">
          <div className="w-full max-w-3xl rounded-2xl bg-[var(--card-color)] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="truncate font-bold">{preview.title}</h2>
              <button type="button" onClick={() => setPreview(null)} aria-label="Close preview" className="rounded-lg p-2"><X /></button>
            </div>
            <video key={preview.id} controls playsInline className="max-h-[70vh] w-full bg-black" src={`/api/shorts/video-stream/${encodeURIComponent(preview.id)}`} />
            <p className="mt-2 text-xs text-[var(--muted-text-color)]">Preview approved, active, safe video stream के माध्यम से चलता है।</p>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({ title, value, note, icon }: { title: string; value: string; note: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] p-4">
      <div className="flex items-center justify-between gap-2 text-[var(--muted-text-color)]"><span className="text-sm">{title}</span>{icon}</div>
      <p className="mt-3 break-words text-xl font-black md:text-2xl">{value}</p>
      <p className="mt-1 text-xs text-[var(--muted-text-color)]">{note}</p>
    </div>
  );
}
