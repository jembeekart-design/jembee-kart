"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { WatchVideo } from "@/lib/mlm/watch-earn/fetchWatchVideos";
import { ArrowLeft } from "lucide-react";
import VideoCard from "@/app/mlm/watch-earn/components/VideoCard";

export default function OriginalPage() {
  const params = useParams();
  const originalVideoId = params.videoId as string;
  const router = useRouter();
  
  const [originalVideo, setOriginalVideo] = useState<WatchVideo | null>(null);
  const [derivedVideos, setDerivedVideos] = useState<WatchVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Fetch original video
      const origDoc = await getDoc(doc(db, "watchEarnVideos", originalVideoId));
      if (origDoc.exists()) {
        setOriginalVideo({ id: origDoc.id, ...origDoc.data() } as WatchVideo);
      }

      // Fetch derived videos
      const q = query(collection(db, "watchEarnVideos"), where("originalVideoId", "==", originalVideoId));
      const snapshot = await getDocs(q);
      setDerivedVideos(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as WatchVideo)));
      setLoading(false);
    }
    fetchData();
  }, [originalVideoId]);

  if (loading) return <main className="min-h-screen bg-black p-4 text-white">Loading...</main>;

  return (
    <main className="min-h-screen bg-black p-4 text-white">
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-2 text-sm text-gray-400">
        <ArrowLeft size={16} /> Back
      </button>
      
      {originalVideo && (
        <div className="mb-8">
          <h1 className="text-xl font-bold mb-2">Original Video</h1>
          <video src={originalVideo.video} className="w-full rounded-xl" controls />
        </div>
      )}

      <h2 className="text-lg font-bold mb-4">Videos created from this original</h2>
      <div className="grid grid-cols-2 gap-2">
        {derivedVideos.map(v => (
          <div key={v.id} className="aspect-[9/16] rounded-lg overflow-hidden">
            <VideoCard 
              video={v as any} 
              isMuted={true} 
              toggleMute={() => {}} 
              watchProgress={0} 
              active={false} 
              onComment={() => {}} 
              onShare={() => {}} 
              coins={v.coins} 
            />
          </div>
        ))}
      </div>
    </main>
  );
}
