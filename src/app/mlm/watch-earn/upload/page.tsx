"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Loader2,
  Video,
  Play,
  X,
  CheckCircle2,
  Lightbulb,
  Clock3,
  Users,
  Ban,
  HelpCircle,
} from "lucide-react";
import { auth, db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { uploadWatchVideo } from "@/lib/mlm/watch-earn/uploadWatchVideo";

function UploadWatchVideoContent() {
  const searchParams = useSearchParams();
  const videoUrlFromParams = searchParams.get("url");

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [caption, setCaption] = useState("");

  useEffect(() => {
    async function loadBlob() {
      if (!videoUrlFromParams?.startsWith("blob:")) return;

      try {
        const response = await fetch(videoUrlFromParams);
        const blob = await response.blob();
        setFile(
          new File([blob], "recording.webm", {
            type: blob.type || "video/webm",
          })
        );
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

    if (selected.size > 100 * 1024 * 1024) {
      alert("वीडियो 100 MB से ज्यादा नहीं होना चाहिए");
      return;
    }

    setUploadError(null);
    setFile(selected);
  }

  function removeVideo() {
    if (loading) return;
    setFile(null);
    setUploadError(null);
    setUploadProgress(0);
  }

  async function handleUpload() {
    try {
      if (!file) {
        alert("पहले अपना वीडियो चुनें");
        return;
      }

      const currentUser = auth.currentUser;

      if (!currentUser?.uid) {
        alert("कृपया पहले लॉगिन करें");
        return;
      }

      let username =
        currentUser.displayName ||
        currentUser.email ||
        "Unknown User";

      try {
        const userSnap = await getDoc(
          doc(db, "users", currentUser.uid)
        );

        if (userSnap.exists()) {
          const userData = userSnap.data();

          username =
            (typeof userData.username === "string" &&
              userData.username.trim()) ||
            (typeof userData.userName === "string" &&
              userData.userName.trim()) ||
            username;
        }
      } catch (error) {
        console.warn(
          "Failed to load username:",
          error
        );
      }

      setUploadError(null);
      setLoading(true);
      setUploadProgress(0);

      const result = await uploadWatchVideo({
        file,
        creatorId: currentUser.uid,
        displayName: currentUser.displayName || undefined,
        photoURL: currentUser.photoURL || undefined,
        username,
        caption,
        hashtags: [],
        music: "",
        isEnhanced: false,
        onProgress: (uploadedBytes, totalBytes) => {
          const percent =
            totalBytes > 0
              ? Math.round((uploadedBytes / totalBytes) * 100)
              : 0;

          setUploadProgress(percent);
        },
      });

      if (result.success) {
        alert(
          "वीडियो सफलतापूर्वक भेज दिया गया है। मंजूरी के बाद यह प्रकाशित होगा।"
        );

        setCaption("");
        setFile(null);
        setUploadProgress(0);
      } else {
        setUploadError(result.message || "वीडियो अपलोड नहीं हो पाया");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);

      console.error("[UPLOAD_DEBUG] PAGE_ERROR", error);
      setUploadError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link
            href="/mlm/watch-earn"
            className="flex h-11 w-11 items-center justify-center rounded-full"
          >
            <ArrowLeft size={30} />
          </Link>

          <div className="text-center">
            <h1 className="text-xl font-black">
              Watch & <span className="text-blue-600">Earn</span>
            </h1>
            <p className="text-sm font-bold">👑 वीडियो डालें</p>
          </div>

          <button
            type="button"
            onClick={() =>
              alert(
                "वीडियो चुनें → जानकारी लिखें → वीडियो अपलोड करें"
              )
            }
            className="flex h-11 w-11 items-center justify-center rounded-full text-blue-600"
            aria-label="सहायता"
          >
            <HelpCircle size={30} />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 pb-10">
        {/* Hero */}
        <section className="relative mt-4 overflow-hidden rounded-[28px] bg-gradient-to-r from-blue-50 to-cyan-50 p-5 shadow-sm">
          <div className="relative z-10">
            <p className="text-3xl font-black leading-tight">
              अपना वीडियो डालें
            </p>

            <p className="mt-2 text-lg font-semibold text-slate-600">
              वीडियो अपलोड करें और कमाई शुरू करें
            </p>

            {/* Steps */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                ["1", "🎥", "वीडियो चुनें"],
                ["2", "✏️", "जानकारी भरें"],
                ["3", "☁️", "अपलोड करें"],
              ].map(([number, icon, text]) => (
                <div
                  key={number}
                  className="rounded-2xl bg-white px-2 py-3 text-center shadow-sm"
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-black text-white">
                    {number}
                  </div>
                  <div className="mt-1 text-xl">{icon}</div>
                  <p className="text-xs font-bold">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* History */}
        <Link
          href="/mlm/watch-earn/history"
          className="mt-4 block rounded-2xl bg-white px-5 py-4 text-center text-base font-black text-blue-600 shadow-sm"
        >
          📋 मेरे अपलोड देखें
        </Link>

        {/* Video picker */}
        {!file ? (
          <label className="mt-5 block cursor-pointer rounded-[28px] border-2 border-dashed border-blue-400 bg-white p-7 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
              <Upload size={42} className="text-blue-600" />
            </div>

            <h2 className="mt-4 text-2xl font-black">
              यहां वीडियो चुनें
            </h2>

            <p className="mt-2 text-base font-semibold text-slate-500">
              या यहां टैप करके वीडियो चुनें
            </p>

            <div className="mt-5 rounded-2xl bg-blue-600 px-6 py-4 text-xl font-black text-white shadow-lg">
              🎬 वीडियो चुनें
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-500">
              MP4 • MOV • AVI &nbsp; | &nbsp; अधिकतम 100 MB
            </p>

            <input
              type="file"
              accept="video/*"
              hidden
              onChange={(e) => {
                selectVideo(e.target.files?.[0] || null);
                e.currentTarget.value = "";
              }}
            />
          </label>
        ) : (
          /* Selected video */
          <section className="mt-5 overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-sm">
            {previewUrl && (
              <div className="relative bg-black">
                <video
                  src={previewUrl}
                  controls
                  playsInline
                  className="max-h-[360px] w-full object-contain"
                />
                <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-2 text-sm font-black">
                  <CheckCircle2
                    size={18}
                    className="mr-1 inline text-green-600"
                  />
                  वीडियो चुना गया
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 p-5">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase text-blue-600">
                  आपका वीडियो
                </p>
                <p className="mt-1 truncate text-lg font-black">
                  {file.name}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {(file.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>

              <button
                type="button"
                onClick={removeVideo}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100"
                aria-label="वीडियो हटाएं"
              >
                <X size={26} />
              </button>
            </div>
          </section>
        )}

        {/* Caption */}
        {file && (
          <section className="mt-5 rounded-[28px] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                ✏️
              </div>

              <div>
                <h2 className="text-lg font-black">
                  वीडियो के बारे में लिखें
                </h2>
                <p className="text-sm font-semibold text-slate-500">
                  चाहें तो कुछ शब्द लिखें
                </p>
              </div>
            </div>

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, 200))}
              placeholder="जैसे: मेरी पहली वीडियो, गांव का सुंदर दृश्य..."
              className="mt-4 min-h-28 w-full resize-none rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 text-base font-semibold outline-none focus:border-blue-500"
            />

            <p className="mt-1 text-right text-xs font-bold text-slate-400">
              {caption.length}/200
            </p>
          </section>
        )}

        {/* Tips */}
        <section className="mt-5 rounded-[28px] bg-green-50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-yellow-100">
              <Lightbulb size={27} className="text-yellow-600" />
            </div>

            <h2 className="text-xl font-black text-green-800">
              अच्छी वीडियो के लिए सुझाव
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white p-4 text-center">
              <Video className="mx-auto" size={30} />
              <p className="mt-2 text-sm font-black">
                वीडियो साफ और स्पष्ट हो
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 text-center">
              <Clock3 className="mx-auto" size={30} />
              <p className="mt-2 text-sm font-black">
                छोटी और अच्छी वीडियो
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 text-center">
              <Users className="mx-auto" size={30} />
              <p className="mt-2 text-sm font-black">
                अच्छा कंटेंट डालें
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 text-center">
              <Ban className="mx-auto" size={30} />
              <p className="mt-2 text-sm font-black">
                गलत कंटेंट न डालें
              </p>
            </div>
          </div>
        </section>

        {/* Error */}
        {uploadError && (
          <section className="mt-5 rounded-2xl border-2 border-red-300 bg-red-50 p-4 text-red-700">
            <p className="font-black">❌ वीडियो अपलोड नहीं हुआ</p>
            <p className="mt-2 break-words text-sm font-semibold">
              {uploadError}
            </p>
            {loading === false && (
              <p className="mt-2 text-xs font-bold">
                जहां तक पहुंचा: {uploadProgress}%
              </p>
            )}
          </section>
        )}

        {/* Upload button */}
        <button
          type="button"
          onClick={handleUpload}
          disabled={loading || !file}
          className={`mt-5 flex w-full items-center justify-center gap-3 rounded-[28px] px-5 py-5 text-xl font-black text-white shadow-xl transition ${
            file && !loading
              ? "bg-gradient-to-r from-blue-600 to-blue-500 active:scale-[0.98]"
              : "cursor-not-allowed bg-slate-300"
          }`}
        >
          {loading ? (
            <>
              <Loader2 size={28} className="animate-spin" />
              वीडियो अपलोड हो रहा है {uploadProgress}%
            </>
          ) : (
            <>
              <Upload size={28} />
              वीडियो अपलोड करें
            </>
          )}
        </button>

        <p className="mt-4 text-center text-sm font-semibold text-slate-500">
          ☁️ वीडियो पहले जांच के लिए भेजा जाएगा
        </p>

        {/* Bottom navigation */}
        <nav className="mt-8 grid grid-cols-4 rounded-[28px] border border-slate-200 bg-white p-3 shadow-lg">
          <Link
            href="/mlm/watch-earn"
            className="flex flex-col items-center gap-1 py-2 text-xs font-bold"
          >
            🏠
            <span>होम</span>
          </Link>

          <Link
            href="/mlm/watch-earn"
            className="flex flex-col items-center gap-1 py-2 text-xs font-bold"
          >
            ▶️
            <span>वीडियो देखें</span>
          </Link>

          <div className="flex flex-col items-center gap-1 py-2 text-xs font-black text-blue-600">
            <div className="flex h-12 w-12 -mt-8 items-center justify-center rounded-full bg-blue-600 text-2xl text-white shadow-lg">
              +
            </div>
            <span>वीडियो डालें</span>
          </div>

          <Link
            href="/mlm/watch-earn/history"
            className="flex flex-col items-center gap-1 py-2 text-xs font-bold"
          >
            💰
            <span>मेरी कमाई</span>
          </Link>
        </nav>
      </div>
    </main>
  );
}

export default function UploadWatchVideoPage() {
  return (
    <Suspense fallback={<div>Loading upload...</div>}>
      <UploadWatchVideoContent />
    </Suspense>
  );
}
