"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchCreatorVideos, getCreatorInfo } from "@/lib/mlm/watch-earn/fetchWatchVideos";
import type { WatchVideo, CreatorInfo } from "@/lib/mlm/watch-earn/fetchWatchVideos";
import { ArrowLeft } from "lucide-react";

export default function PublicUploaderPage() {
  const params = useParams();
  const creatorId = params.creatorId as string;
  const router = useRouter();

  const [creatorInfo, setCreatorInfo] = useState<CreatorInfo | null>(null);
  const [videos, setVideos] = useState<WatchVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!creatorId) return;

      // 1. Resolve creator info using production logic
      const info = await getCreatorInfo(creatorId, "");
      setCreatorInfo(info);

      // 2. Fetch sanitized videos using production logic
      const result = await fetchCreatorVideos(creatorId);
      if (result.success) {
        setVideos(result.videos);
      }

      setLoading(false);
    }
    fetchData();
  }, [creatorId]);

  if (loading) return <main className="min-h-screen bg-black p-4 text-white">Loading...</main>;

  return (
    <main className="min-h-screen bg-black p-4 text-white">
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-2 text-sm text-gray-400">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">@{creatorInfo?.username || "User"}</h1>
      </div>

      <div className="grid grid-cols-3 gap-1">
        {videos.map(v => (
          <div key={v.id} className="aspect-[9/16] bg-neutral-800 overflow-hidden" onClick={() => router.push(`/mlm/watch-earn/original/${v.id}`)}>
            <img src={v.thumbnail} className="w-full h-full object-cover" alt="Video thumbnail" />
          </div>
        ))}
      </div>
    </main>
  );
}
