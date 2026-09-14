"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  Home,
  Wallet,
  User,
  ClipboardList,
  Pencil,
  CloudUpload,
} from "lucide-react";
import { auth } from "@/firebase/config";
import { uploadWatchVideo } from "@/lib/mlm/watch-earn/uploadWatchVideo";

export default function UploadWatchVideoPage() {
  const searchParams = useSearchParams();
  const videoUrlFromParams = searchParams.get("url");

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [caption, setCaption] = useState("");

  useEffect(() => {
    async function loadBlob() {
      if (
        videoUrlFromParams &&
        videoUrlFromParams.startsWith("blob:")
      ) {
        try {
          const response = await fetch(videoUrlFromParams);
          const blob = await response.blob();

          const recordedFile = new File(
            [blob],
            "recording.webm",
            { type: "video/webm" }
          );

          setFile(recordedFile);
        } catch (error) {
          console.error("Failed to load blob", error);
        }
      }
    }

    loadBlob();
  }, [videoUrlFromParams]);

  const previewUrl = useMemo(() => {
    return file ? URL.createObjectURL(file) : null;
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selected = event.target.files?.[0];

    if (!selected) return;

    setUploadError(null);

    if (!selected.type.startsWith("video/")) {
      alert("सिर्फ वीडियो फाइल चुनें");
      event.target.value = "";
      return;
    }

    if (selected.size > 100 * 1024 * 1024) {
      alert("वीडियो 100 MB से ज्यादा नहीं होना चाहिए");
      event.target.value = "";
      return;
    }

    setFile(selected);
  }

  function removeFile() {
    setFile(null);
    setUploadError(null);
    setUploadProgress(0);
  }

  async function handleUpload() {
    try {
      if (!file) {
        alert("पहले वीडियो चुनें");
        return;
      }

      const currentUser = auth.currentUser;

      if (!currentUser) {
        setUploadError("कृपया पहले लॉगिन करें");
        return;
      }

      setUploadError(null);
      setLoading(true);
      setUploadProgress(0);

      const result = await uploadWatchVideo({
        file,
        creatorId: currentUser.uid,
        displayName: currentUser.displayName || undefined,
        photoURL: currentUser.photoURL || undefined,
        username:
          currentUser.displayName ||
          currentUser.email ||
          "Unknown User",
        caption,
        hashtags: [],
        music: "",
        isEnhanced: false,
        onProgress: (uploadedBytes, totalBytes) => {
          const percent =
            totalBytes > 0
              ? Math.round(
                  (uploadedBytes / totalBytes) * 100
                )
              : 0;

          setUploadProgress(percent);
        },
      });

      if (result.success) {
        alert(
          "वीडियो सफलतापूर्वक भेज दिया गया है। Approval के बाद वीडियो प्रकाशित होगा।"
        );

        setCaption("");
        setFile(null);
        setUploadProgress(0);
      } else {
        setUploadError(
          result.message || "वीडियो अपलोड नहीं हो पाया"
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      console.error("VIDEO UPLOAD ERROR", error);
      setUploadError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900 pb-28">

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="relative flex h-[82px] items-center justify-center px-4">

          <Link
            href="/mlm/watch-earn"
            className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-full"
          >
            <ArrowLeft size={38} strokeWidth={2.2} />
          </Link>

          <div className="text-center">
            <h1 className="text-[29px] font-black leading-none">
              Watch &{" "}
              <span className="text-blue-600">
                Earn
              </span>
            </h1>

            <div className="mt-2 flex items-center justify-center gap-1 text-[19px] font-black">
              <span>👑</span>
              <span>वीडियो डालें</span>
            </div>
          </div>

          <div className="absolute right-4 top-3 flex flex-col items-center">
            <HelpCircle
              size={38}
              className="text-blue-600"
              strokeWidth={2.3}
            />
            <span className="text-[14px] font-black text-blue-700">
              सहायता
            </span>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-50 via-sky-50 to-cyan-50 px-5 py-7">

        <h2 className="text-center text-[42px] font-black leading-tight text-slate-900">
          अपना वीडियो डालें
        </h2>

        <p className="mt-2 text-center text-[22px] font-bold text-slate-600">
          वीडियो अपलोड करें और कमाई शुरू करें
        </p>

        {/* STEPS */}
        <div className="mt-6 grid grid-cols-3 gap-3">

          <div className="rounded-[25px] bg-white px-2 py-5 text-center shadow-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-3xl font-black text-white">
              1
            </div>
            <Video
              size={32}
              className="mx-auto mt-3"
              strokeWidth={2.5}
            />
            <p className="mt-2 text-[17px] font-black">
              वीडियो चुनें
            </p>
          </div>

          <div className="rounded-[25px] bg-white px-2 py-5 text-center shadow-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-3xl font-black text-white">
              2
            </div>
            <Pencil
              size={32}
              className="mx-auto mt-3"
              strokeWidth={2.5}
            />
            <p className="mt-2 text-[17px] font-black">
              जानकारी भरें
            </p>
          </div>

          <div className="rounded-[25px] bg-white px-2 py-5 text-center shadow-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-3xl font-black text-white">
              3
            </div>
            <CloudUpload
              size={32}
              className="mx-auto mt-3"
              strokeWidth={2.5}
            />
            <p className="mt-2 text-[17px] font-black">
              अपलोड करें
            </p>
          </div>

        </div>
      </section>

      {/* HISTORY */}
      <div className="px-5 pt-6">
        <Link
          href="/mlm/watch-earn/history"
          className="flex h-[78px] items-center justify-center gap-3 rounded-[25px] bg-white text-[24px] font-black text-blue-600 shadow-md"
        >
          <ClipboardList size={30} />
          मेरे अपलोड देखें
        </Link>
      </div>

      {/* SELECT VIDEO */}
      <section className="px-5 pt-7">

        {!file ? (
          <label className="block cursor-pointer rounded-[32px] border-[3px] border-dashed border-blue-400 bg-white px-5 py-12 text-center shadow-sm">

            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-blue-50">
              <Upload
                size={72}
                className="text-blue-600"
                strokeWidth={2.2}
              />
            </div>

            <h3 className="mt-7 text-[32px] font-black">
              यहाँ वीडियो चुनें
            </h3>

            <p className="mt-3 text-[20px] font-bold text-slate-500">
              या यहाँ टैप करके वीडियो चुनें
            </p>

            <div className="mt-7 flex h-[76px] items-center justify-center gap-3 rounded-[25px] bg-blue-600 text-[27px] font-black text-white shadow-lg">
              <span>🎬</span>
              <span>वीडियो चुनें</span>
            </div>

            <p className="mt-6 text-[18px] font-bold text-slate-500">
              MP4 • MOV • AVI&nbsp;&nbsp;|&nbsp;&nbsp;
              अधिकतम 100 MB
            </p>

            <input
              type="file"
              accept="video/*"
              hidden
              onChange={handleFileChange}
            />
          </label>
        ) : (
          <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-md">

            <div className="relative bg-black">
              {previewUrl && (
                <video
                  src={previewUrl}
                  controls
                  playsInline
                  className="max-h-[390px] w-full"
                />
              )}

              <button
                type="button"
                onClick={removeFile}
                className="absolute right-4 top-4 flex h-14 w-14 items-center justify-center rounded-full bg-black/70 text-white"
                aria-label="वीडियो हटाएं"
              >
                <X size={32} />
              </button>
            </div>

            <div className="flex items-center gap-4 px-5 py-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <CheckCircle2
                  size={32}
                  className="text-blue-600"
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-500">
                  चुना गया वीडियो
                </p>
                <p className="truncate text-[20px] font-black">
                  {file.name}
                </p>
                <p className="text-sm font-semibold text-slate-500">
                  {(file.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
            </div>
          </div>
        )}

      </section>

      {/* CAPTION */}
      {file && (
        <section className="px-5 pt-6">

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-100">
              <Pencil
                size={27}
                className="text-fuchsia-600"
              />
            </div>

            <h3 className="text-[21px] font-black">
              वीडियो का शीर्षक / विवरण
              <span className="text-slate-500">
                {" "}(Caption)
              </span>
            </h3>
          </div>

          <div className="mt-3 rounded-[25px] border-2 border-slate-300 bg-white p-4">
            <textarea
              value={caption}
              maxLength={200}
              onChange={(event) =>
                setCaption(event.target.value)
              }
              placeholder={
                "यहाँ कुछ लिखें...\nजैसे: मेरी पहली वीडियो, मजेदार वीडियो, गाँव का दृश्य आदि..."
              }
              className="h-32 w-full resize-none text-[19px] font-semibold outline-none placeholder:text-slate-400"
            />

            <div className="text-right text-sm font-bold text-slate-500">
              {caption.length}/200
            </div>
          </div>

        </section>
      )}

      {/* TIPS */}
      {file && (
        <section className="px-5 pt-5">

          <div className="rounded-[25px] bg-green-50 px-4 py-5">

            <div className="flex items-center gap-2">
              <Lightbulb
                size={31}
                className="text-yellow-500"
                fill="currentColor"
              />
              <h3 className="text-[21px] font-black text-green-800">
                अच्छी वीडियो के लिए सुझाव
              </h3>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2">

              <div className="text-center">
                <Video
                  size={31}
                  className="mx-auto"
                  strokeWidth={2.5}
                />
                <p className="mt-2 text-[13px] font-bold leading-tight">
                  वीडियो साफ
                  <br />
                  और स्पष्ट हो
                </p>
              </div>

              <div className="border-l border-green-200 text-center">
                <Clock3
                  size={31}
                  className="mx-auto"
                  strokeWidth={2.5}
                />
                <p className="mt-2 text-[13px] font-bold leading-tight">
                  छोटी वीडियो
                  <br />
                  (1-5 मिनट)
                </p>
              </div>

              <div className="border-l border-green-200 text-center">
                <Users
                  size={31}
                  className="mx-auto"
                  strokeWidth={2.5}
                />
                <p className="mt-2 text-[13px] font-bold leading-tight">
                  अच्छा और
                  <br />
                  सकारात्मक कंटेंट
                </p>
              </div>

              <div className="border-l border-green-200 text-center">
                <Ban
                  size={31}
                  className="mx-auto"
                  strokeWidth={2.5}
                />
                <p className="mt-2 text-[13px] font-bold leading-tight">
                  गलत या आपत्तिजनक
                  <br />
                  कंटेंट न डालें
                </p>
              </div>

            </div>
          </div>

        </section>
      )}

      {/* ERROR */}
      {uploadError && (
        <section className="px-5 pt-5">
          <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-4 text-red-700">
            <p className="font-black">
              ❌ वीडियो अपलोड में समस्या
            </p>
            <p className="mt-2 break-words text-sm font-semibold">
              {uploadError}
            </p>
            {loading && (
              <p className="mt-2 text-xs font-bold">
                अपलोड: {uploadProgress}%
              </p>
            )}
          </div>
        </section>
      )}

      {/* UPLOAD BUTTON */}
      {file && (
        <section className="px-5 pt-5">

          <button
            type="button"
            onClick={handleUpload}
            disabled={loading}
            className="flex min-h-[82px] w-full items-center justify-center gap-4 rounded-[28px] bg-blue-600 px-5 text-[27px] font-black text-white shadow-xl disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2
                  size={35}
                  className="animate-spin"
                />
                वीडियो अपलोड हो रहा है {uploadProgress}%
              </>
            ) : (
              <>
                <Upload
                  size={35}
                  strokeWidth={2.5}
                />
                वीडियो अपलोड करें
              </>
            )}
          </button>

        </section>
      )}

      {/* BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="mx-auto grid max-w-xl grid-cols-5">

          <Link
            href="/mlm/watch-earn"
            className="flex min-h-[92px] flex-col items-center justify-center gap-1"
          >
            <Home size={31} strokeWidth={2.2} />
            <span className="text-[14px] font-bold">
              होम
            </span>
          </Link>

          <Link
            href="/mlm/watch-earn"
            className="flex min-h-[92px] flex-col items-center justify-center gap-1"
          >
            <Play size={31} strokeWidth={2.2} />
            <span className="text-[14px] font-bold">
              वीडियो देखें
            </span>
          </Link>

          <div className="relative flex min-h-[92px] flex-col items-center justify-center">
            <div className="absolute -top-7 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg">
              <Upload size={34} strokeWidth={2.5} />
            </div>
            <span className="mt-8 text-[14px] font-black text-blue-700">
              वीडियो डालें
            </span>
          </div>

          <Link
            href="/mlm/watch-earn/earnings"
            className="flex min-h-[92px] flex-col items-center justify-center gap-1"
          >
            <Wallet size={31} strokeWidth={2.2} />
            <span className="text-[14px] font-bold">
              कमाई
            </span>
          </Link>

          <Link
            href="/mlm/profile"
            className="flex min-h-[92px] flex-col items-center justify-center gap-1"
          >
            <User size={31} strokeWidth={2.2} />
            <span className="text-[14px] font-bold">
              मेरा प्रोफाइल
            </span>
          </Link>

        </div>
      </nav>

    </main>
  );
}
