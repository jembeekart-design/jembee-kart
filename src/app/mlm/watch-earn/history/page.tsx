"use client";

import { useState, useEffect, useCallback } from "react";
import { auth, db } from "@/firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { Loader2, Trash2, Play, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface HistoryVideo {
  id: string;
  caption: string;
  thumbnail: string;
  createdAt: any;
  status: string;
  isEnhanced: boolean;
  video: string;
}

export default function MyUploadHistoryPage() {
  const [videos, setVideos] = useState<HistoryVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const fetchHistory = useCallback(async () => {
    if (!auth.currentUser) return;
    
    setLoading(true);
    setError(null);
    try {
      const collectionRef = collection(db, "watchEarnVideos");
      
      const q1 = query(
        collectionRef,
        where("creatorId", "==", auth.currentUser.uid)
      );
      
      const q2 = query(
        collectionRef,
        where("userId", "==", auth.currentUser.uid)
      );
      
      const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      
      const videosMap = new Map();
      [...snapshot1.docs, ...snapshot2.docs].forEach(doc => {
        videosMap.set(doc.id, { id: doc.id, ...doc.data() });
      });
      
      const historyVideos = Array.from(videosMap.values()).sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      }) as HistoryVideo[];
      
      setVideos(historyVideos);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Failed to load upload history. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    setDeletingId(videoId);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch("/api/creator/delete-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, token }),
      });

      if (!response.ok) throw new Error("Deletion failed");

      setVideos(prev => prev.filter(v => v.id !== videoId));
      alert("Video deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Unable to delete video. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
  if (error) return <div className="p-10 text-center text-red-500">{error} <button onClick={fetchHistory} className="underline">Retry</button></div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Upload History</h1>
      {videos.length === 0 ? (
        <p className="text-center">You haven't uploaded any videos yet.</p>
      ) : (
        <div className="space-y-4">
          {videos.map(video => (
            <div key={video.id} className="flex gap-4 p-4 bg-white rounded-lg border">
              <img src={video.thumbnail} alt="Thumbnail" className="w-20 h-20 object-cover rounded" />
              <div className="flex-1">
                <h3 className="font-semibold line-clamp-1">{video.caption || "No title"}</h3>
                <p className="text-sm text-gray-500">
                    {video.createdAt?.toDate 
                        ? video.createdAt.toDate().toLocaleDateString() 
                        : new Date(video.createdAt || Date.now()).toLocaleDateString()}
                </p>
                <div className="flex gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${video.isEnhanced ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {video.isEnhanced ? 'Enhanced' : 'Original'}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700">{video.status}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => router.push(`/mlm/watch-earn/original/${video.id}`)} className="p-2 bg-gray-100 rounded"><Play size={16}/></button>
                <button 
                    onClick={() => handleDelete(video.id)} 
                    disabled={deletingId === video.id}
                    className="p-2 bg-red-100 text-red-600 rounded"
                >
                    {deletingId === video.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
