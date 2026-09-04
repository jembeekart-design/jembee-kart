"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { auth } from "@/firebase/config";
import { Upload, Loader2, Music2, BadgeCheck, ShieldCheck } from "lucide-react";
import { uploadWatchVideo } from "@/lib/mlm/watch-earn/uploadWatchVideo";

export default function UploadWatchVideoPage() {
  const searchParams = useSearchParams();
  const videoUrlFromParams = searchParams.get('url');
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [music, setMusic] = useState("");
  
  useEffect(() => {
    async function loadBlob() {
        if (videoUrlFromParams && videoUrlFromParams.startsWith('blob:')) {
            try {
                const response = await fetch(videoUrlFromParams);
                const blob = await response.blob();
                const file = new File([blob], 'recording.webm', { type: 'video/webm' });
                setFile(file);
            } catch (err) {
                console.error("Failed to load blob", err);
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

  async function handleUpload() {
    try {
      if (!file) {
        alert("Select video first");
        return;
      }

      console.log("[UPLOAD_DEBUG] PAGE_UPLOAD_START", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      setLoading(true);
      setUploadProgress(0);

      const result = await uploadWatchVideo({
        file,
        creatorId: auth.currentUser?.uid || "",
        displayName: auth.currentUser?.displayName || undefined,
        photoURL: auth.currentUser?.photoURL || undefined,
        username: auth.currentUser?.displayName || auth.currentUser?.email || "Unknown User",
        caption,
        hashtags: hashtags.split(",").map((tag) => tag.trim()).filter(Boolean),
        music,
        isEnhanced,
        onProgress: (uploadedBytes, totalBytes) => {
          console.log("[UPLOAD_DEBUG] PAGE_PROGRESS", {
            uploadedBytes,
            totalBytes,
            percent: totalBytes > 0
              ? Math.round((uploadedBytes / totalBytes) * 100)
              : 0,
          });

          setUploadProgress(
            totalBytes > 0
              ? Math.round((uploadedBytes / totalBytes) * 100)
              : 0
          );
        },
      });
      console.log("[UPLOAD_DEBUG] PAGE_RESULT", result);

      if (result.success) {
        alert("Video submitted for moderation. It will be published after approval.");
        setCaption("");
        setHashtags("");
        setMusic("");
        setFile(null);
      } else {
        alert(result.message || "Upload failed");
      }
    } catch (error) {
      console.error("[UPLOAD_DEBUG] PAGE_ERROR", {
        name: error instanceof Error ? error.name : typeof error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      alert("Something went wrong");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-page-background)] px-4 py-6">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--color-secondary-button)]/20">
            <Upload size={28} className="text-[var(--color-primary-button)]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--button-text-color)]">Upload Video</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Upload videos for Jembee Shorts</p>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-3xl border border-[var(--color-primary-button)]/20 bg-[var(--color-secondary-button)]/10 p-5">
        <div className="flex items-start gap-4">
          <ShieldCheck size={24} className="mt-1 text-[var(--color-primary-button)]" />
          <div>
            <h2 className="text-lg font-black text-[var(--button-text-color)]">Video Rules</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-primary-button)]">
              <li>• Only original videos allowed</li>
              <li>• Spam & copied videos rejected</li>
              <li>• Admin automatically sets rewards</li>
              <li>• Viral videos may get featured</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <Link href="/mlm/watch-earn/history" className="block text-center text-sm font-bold text-[var(--color-primary-button)] mb-4">
          My Upload History
        </Link>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-[var(--color-border)]/10 bg-gradient-to-b from-white/5 to-white/[0.02] px-5 py-14 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-secondary-button)]/20">
            <Upload size={42} className="text-[var(--color-primary-button)]" />
          </div>
          <p className="mt-5 text-2xl font-black text-[var(--button-text-color)]">Upload Video</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">MP4, MOV supported</p>
          <input
            type="file"
            accept="video/*"
            hidden
            onChange={(e) => {
              const selected = e.target.files?.[0] || null;
              if (!selected) return;
              if (!selected.type.startsWith("video/")) {
                alert("Only video files are allowed");
                e.target.value = "";
                return;
              }
              if (selected.size > 100 * 1024 * 1024) {
                alert("Video exceeds the 100MB limit");
                e.target.value = "";
                return;
              }
              setFile(selected);
            }}
          />
        </label>

        {file && (
          <div className="rounded-3xl border border-[var(--color-primary-button)]/20 bg-[var(--color-secondary-button)]/10 px-5 py-5">
            {previewUrl && (
              <div className="mb-4">
                  <video src={previewUrl} controls className="w-full rounded-2xl" />
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-button)]">Selected Video</p>
                <p className="mt-2 text-sm font-black text-[var(--button-text-color)]">{file.name}</p>
                <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-[var(--button-text-color)]">
                  <input
                    type="checkbox"
                    checked={isEnhanced}
                    onChange={(e) => setIsEnhanced(e.target.checked)}
                  />
                  Use Enhanced Delivery (Cloudinary)
                </label>
              </div>
              <BadgeCheck size={24} className="text-[var(--color-primary-button)]" />
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-[var(--color-border)]/10 bg-[var(--color-card-background)]/5 p-5">
          <p className="mb-3 text-sm font-black text-[var(--button-text-color)]">Caption</p>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write your video caption..."
            className="h-32 w-full resize-none bg-transparent text-[var(--button-text-color)] outline-none placeholder:text-[var(--text-secondary)]"
          />
        </div>

        <div className="rounded-3xl border border-[var(--color-border)]/10 bg-[var(--color-card-background)]/5 p-5">
          <p className="mb-3 text-sm font-black text-[var(--button-text-color)]">Hashtags</p>
          <input
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="fashion,viral,trending"
            className="w-full bg-transparent text-[var(--button-text-color)] outline-none placeholder:text-[var(--text-secondary)]"
          />
        </div>

        <div className="flex items-center gap-4 rounded-3xl border border-[var(--color-border)]/10 bg-[var(--color-card-background)]/5 px-5 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-button)]/20">
            <Music2 size={22} className="text-[var(--color-primary-button)]" />
          </div>
          <input
            value={music}
            onChange={(e) => setMusic(e.target.value)}
            placeholder="Music name"
            className="flex-1 bg-transparent text-[var(--button-text-color)] outline-none placeholder:text-[var(--text-secondary)]"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-[30px] bg-gradient-to-r from-[var(--color-primary-button)] to-[var(--color-primary-button)] px-5 py-5 text-lg font-black text-[var(--button-text-color)] shadow-2xl"
        >
          {loading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <Upload size={24} />
          )}
          {loading ? `Uploading ${uploadProgress}%...` : "Upload Video"}
        </button>
      </div>
    </main>
  );
}
