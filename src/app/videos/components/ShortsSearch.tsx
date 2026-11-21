"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, Play } from "lucide-react";
import Avatar from "@/components/user/Avatar";

interface CreatorSearchResult {
  id: string;
  name: string;
  username: string;
  photoURL: string;
}
interface VideoSearchResult {
  id: string;
  caption: string;
  thumbnail: string;
  videoFormat: "short" | "long";
}

export default function ShortsSearch({ onClose }: { onClose: () => void }) {
  const [queryText, setQueryText] = useState("");
  const [results, setResults] = useState<{ videos: VideoSearchResult[]; creators: CreatorSearchResult[] }>({ videos: [], creators: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const term = queryText.trim();
    if (term.length < 2) {
      setResults({ videos: [], creators: [] });
      setLoading(false);
      setError("");
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/app/search?q=${encodeURIComponent(term)}`, {
          cache: "no-store",
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        const result = await response.json() as {
          success?: boolean;
          creators?: CreatorSearchResult[];
          videos?: VideoSearchResult[];
          message?: string;
        };
        if (!response.ok || result.success !== true) throw new Error(result.message || "Search is temporarily unavailable.");
        if (!cancelled) setResults({
          creators: Array.isArray(result.creators) ? result.creators : [],
          videos: Array.isArray(result.videos) ? result.videos : [],
        });
      } catch (searchError) {
        if (!cancelled && !(searchError instanceof DOMException && searchError.name === "AbortError")) {
          setError(searchError instanceof Error ? searchError.message : "Search is temporarily unavailable.");
          setResults({ creators: [], videos: [] });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [queryText]);

  return (
    <div className="fixed inset-0 z-[100000] overflow-y-auto bg-[#07080d] p-4 pt-[max(1rem,env(safe-area-inset-top))] text-white">
      <div className="mx-auto flex w-full max-w-2xl items-center gap-2 border-b border-white/10 pb-4">
        <button type="button" onClick={onClose} aria-label="Close search" className="rounded-full p-2 hover:bg-white/10"><X size={24} /></button>
        <div className="flex flex-1 items-center gap-2 rounded-full bg-white/10 px-4 py-3">
          <Search size={20} className="shrink-0 text-gray-400" />
          <input
            autoFocus
            value={queryText}
            onChange={(event) => setQueryText(event.target.value)}
            placeholder="Search creators, videos, hashtags..."
            aria-label="Search creators, videos and hashtags"
            className="w-full bg-transparent text-base text-white outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl py-5">
        {queryText.trim().length < 2 && <p className="text-sm text-white/60">Search ke liye kam se kam 2 characters type karein.</p>}
        {loading && <div className="flex justify-center p-10"><Loader2 className="animate-spin text-cyan-400" /></div>}
        {error && <p role="alert" className="rounded-xl bg-red-950/50 p-4 text-sm text-red-200">{error}</p>}
        {!loading && !error && queryText.trim().length >= 2 && results.creators.length === 0 && results.videos.length === 0 && (
          <p className="text-sm text-white/60">Koi creator ya video nahi mila.</p>
        )}

        {results.creators.length > 0 && (
          <section className="mb-7">
            <h2 className="mb-3 text-sm font-bold text-gray-400">Creators</h2>
            <div className="space-y-3">
              {results.creators.map((creator) => (
                <button type="button" key={creator.id} onClick={() => { onClose(); router.push(`/profile/${encodeURIComponent(creator.id)}`); }} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-white/10">
                  <Avatar name={creator.name || creator.username || "Creator"} photoUrl={creator.photoURL} size="w-11 h-11" />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{creator.name}</span>
                    <span className="block truncate text-xs text-gray-400">@{creator.username}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {results.videos.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-bold text-gray-400">Videos</h2>
            <div className="grid grid-cols-3 gap-2">
              {results.videos.map((video) => (
                <button type="button" key={video.id} onClick={() => { onClose(); router.push(video.videoFormat === "short" ? `/shorts?v=${encodeURIComponent(video.id)}` : `/videos/original/${encodeURIComponent(video.id)}`); }} className="relative aspect-[9/16] overflow-hidden rounded-lg bg-gray-800 text-left">
                  <img src={video.thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/10"><Play size={25} fill="white" /></span>
                  <span className="absolute inset-x-0 bottom-0 line-clamp-2 bg-gradient-to-t from-black/90 to-transparent p-2 pt-7 text-xs">{video.caption}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
