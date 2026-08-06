"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { WatchVideo } from "@/lib/mlm/watch-earn/fetchWatchVideos";
import { Music, Play, Heart, Users, ArrowLeft } from "lucide-react";
import VideoCard from "@/app/mlm/watch-earn/components/VideoCard";

export default function AudioPage() {
  const params = useParams();
  const audioId = decodeURIComponent(params.audioId as string);
  const router = useRouter();
  const [videos, setVideos] = useState<WatchVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideosByAudio() {
      const q = query(collection(db, "watchEarnVideos"), where("music", "==", audioId));
      const snapshot = await getDocs(q);
      const fetchedVideos: WatchVideo[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as WatchVideo));
      setVideos(fetchedVideos);
      setLoading(false);
    }
    fetchVideosByAudio();
  }, [audioId]);

  if (loading) return <main className="min-h-screen bg-black p-4 text-white">Loading...</main>;

  const totalVideos = videos.length;
  const totalPlays = videos.reduce((acc, v) => acc + (v.views || 0), 0);
  const totalLikes = videos.reduce((acc, v) => acc + (v.likes || 0), 0);
  const firstVideo = videos[0];

  return (
    <main className="min-h-screen bg-black p-4 text-white">
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-2 text-sm text-gray-400">
        <ArrowLeft size={16} /> Back
      </button>
      
      {/* Audio Info */}
      <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl mb-4">
        {firstVideo?.thumbnail && <img src={firstVideo.thumbnail} alt={audioId} className="w-16 h-16 rounded-lg object-cover" />}
        <div>
          <h1 className="text-xl font-bold">{audioId.startsWith('original-') ? 'Original Audio' : audioId}</h1>
          <p className="text-sm text-gray-400">Popular Creator: {firstVideo?.username || "Unknown"}</p>
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex justify-around p-4 bg-white/5 rounded-xl mb-4">
        <div className="text-center text-sm"><Users className="mx-auto mb-1" size={20}/> {totalVideos} Videos</div>
        <div className="text-center text-sm"><Play className="mx-auto mb-1" size={20}/> {totalPlays} Plays</div>
        <div className="text-center text-sm"><Heart className="mx-auto mb-1" size={20}/> {totalLikes} Likes</div>
      </div>

      <button 
        onClick={() => router.push(`/mlm/watch-earn/create?audio=${encodeURIComponent(audioId)}&url=${encodeURIComponent(firstVideo?.video || "")}`)}
        className="w-full py-3 bg-pink-600 rounded-lg font-bold mb-6"
      >
        Use this Audio
      </button>

      {/* Videos List */}
      <h2 className="text-lg font-bold mb-4">Videos using this audio</h2>
      <div className="grid grid-cols-2 gap-2">
        {videos.map(v => (
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
