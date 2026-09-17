"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, User, Play, Hash } from "lucide-react";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";
import { WatchVideo } from "@/lib/mlm/watch-earn/fetchWatchVideos";
import Avatar from "@/components/user/Avatar";

export default function ShortsSearch({ onClose }: { onClose: () => void }) {
  const [queryText, setQueryText] = useState("");
  const [results, setResults] = useState<{
    videos: WatchVideo[];
    users: any[];
    loading: boolean;
  }>({ videos: [], users: [], loading: false });
  
  const router = useRouter();

  useEffect(() => {
    if (!queryText.trim()) {
      setResults({ videos: [], users: [], loading: false });
      return;
    }

    const timer = setTimeout(async () => {
      setResults(prev => ({ ...prev, loading: true }));
      
      try {
        // Simple search logic based on requirements
        const videosRef = collection(db, "watchEarnVideos");
        
        // Search Videos by Caption (partial match not supported in firestore simple query)
        const vQuery = query(videosRef, orderBy("createdAt", "desc"), limit(20));
        const vSnap = await getDocs(vQuery);
        
        const allVideos = vSnap.docs.map(d => ({ id: d.id, ...d.data() } as WatchVideo));
        const filteredVideos = allVideos.filter(v => 
          v.caption.toLowerCase().includes(queryText.toLowerCase()) ||
          v.hashtags.some(h => h.toLowerCase().includes(queryText.toLowerCase()))
        );

        // Search Users
        const usersRef = collection(db, "users");
        const uQuery = query(usersRef, limit(20));
        const uSnap = await getDocs(uQuery);
        const filteredUsers = uSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter((u: any) => 
                u.name?.toLowerCase().includes(queryText.toLowerCase()) || 
                u.username?.toLowerCase().includes(queryText.toLowerCase())
            );

        setResults({ videos: filteredVideos, users: filteredUsers, loading: false });
      } catch (err) {
        console.error("Search error:", err);
        setResults({ videos: [], users: [], loading: false });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [queryText]);

  return (
    <div className="fixed inset-0 z-[60] bg-black p-4 pt-[env(safe-area-inset-top)]">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={onClose} className="p-2"><X size={24} /></button>
        <div className="flex-1 flex items-center bg-white/10 rounded-full px-4 py-2 gap-2">
          <Search size={20} className="text-gray-400" />
          <input 
            autoFocus
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Search creators, videos, hashtags..."
            className="w-full bg-transparent outline-none text-white"
          />
        </div>
      </div>

      {results.loading && <div className="flex justify-center p-10"><Loader2 className="animate-spin text-cyan-400" /></div>}
      
      {!results.loading && (
        <div className="space-y-6">
          {results.users.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-400 mb-3">Creators</h3>
              {results.users.map(u => (
                <div key={u.id} className="flex items-center gap-3 mb-3" onClick={() => router.push(`/profile/${u.id}`)}>
                  <Avatar name={u.name} photoUrl={u.photoURL} size="w-10 h-10" />
                  <div>
                    <div className="font-bold">{u.name}</div>
                    <div className="text-xs text-gray-400">@{u.username}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.videos.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-400 mb-3">Videos</h3>
              <div className="grid grid-cols-3 gap-2">
                {results.videos.map(v => (
                  <div key={v.id} className="aspect-[9/16] bg-gray-800 rounded-lg overflow-hidden relative" onClick={() => router.push(`/mlm/watch-earn/original/${v.id}`)}>
                    <img src={v.thumbnail} className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 right-1"><Play size={16} /></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
