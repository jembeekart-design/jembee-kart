"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, PlayCircle } from "lucide-react";
import { getWatchVideos, type WatchVideo } from "../services/watchVideos.service";

export default function WatchExplorePage() {
  const router = useRouter();
  const [videos, setVideos] = useState<WatchVideo[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    getWatchVideos()
      .then((result) => {
        if (!active) return;
        setVideos(result.success ? result.videos : []);
        setFailed(!result.success);
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term) return videos;
    return videos.filter((video) =>
      [video.caption, video.username, video.displayName, ...(video.hashtags || [])]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase().includes(term))
    );
  }, [videos, search]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 pb-10 pt-[env(safe-area-inset-top)] text-white">
      <header className="mx-auto flex w-full max-w-5xl items-center gap-3 py-5">
        <button type="button" onClick={() => router.push("/mlm/watch-earn")} aria-label="वापस जाएँ"
          className="rounded-full bg-white/10 p-3 hover:bg-white/15">
          <ArrowLeft size={21} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">वीडियो एक्सप्लोर करें</h1>
          <p className="mt-1 text-sm text-white/65">नए वीडियो खोजें और पसंदीदा वीडियो देखें।</p>
        </div>
      </header>

      <label className="mx-auto flex max-w-5xl items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
        <Search size={20} className="shrink-0 text-white/60" />
        <input value={search} onChange={(event) => setSearch(event.target.value)}
          placeholder="वीडियो, कैप्शन या निर्माता खोजें"
          aria-label="वीडियो खोजें"
          className="w-full bg-transparent text-base outline-none placeholder:text-white/45" />
      </label>

      <section className="mx-auto mt-6 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {loading && <p className="col-span-full py-12 text-center text-white/70">वीडियो लोड हो रहे हैं…</p>}
        {!loading && failed && <div className="col-span-full py-12 text-center">
          <p>वीडियो लोड नहीं हो सके। कृपया कुछ समय बाद पुनः प्रयास करें।</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-3 rounded-xl bg-white px-4 py-2 font-semibold text-slate-950">पुनः प्रयास करें</button>
        </div>}
        {!loading && !failed && filtered.length === 0 && <p className="col-span-full py-12 text-center text-white/70">
          {search ? "आपकी खोज से मेल खाने वाला कोई वीडियो नहीं मिला।" : "अभी कोई वीडियो उपलब्ध नहीं है।"}
        </p>}
        {!loading && !failed && filtered.map((video) => (
          <button key={video.id} type="button"
            onClick={() => router.push("/mlm/watch-earn")}
            className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left">
            {video.thumbnail ? <img src={video.thumbnail} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105" /> :
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950"><PlayCircle size={42} className="text-white/70" /></div>}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 pt-10">
              <p className="line-clamp-2 text-sm font-semibold">{video.caption || "वीडियो"}</p>
              <p className="mt-1 truncate text-xs text-white/70">{video.displayName || video.username || "निर्माता"}</p>
            </div>
          </button>
        ))}
      </section>
    </main>
  );
}
