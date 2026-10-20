"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc, orderBy } from "firebase/firestore";
import { Play, Settings, Wallet, LogOut, Heart, Bookmark, Video, UserPlus } from "lucide-react";
import Avatar from "@/components/user/Avatar";
import { WatchVideo } from "@/lib/mlm/watch-earn/fetchWatchVideos";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";

export default function ShortsProfile() {
  const router = useRouter();
  const [user, setUser] = useState(auth.currentUser);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'my' | 'liked' | 'saved'>('my');
  const [videos, setVideos] = useState<{ my: WatchVideo[], liked: WatchVideo[], saved: WatchVideo[] }>({ my: [], liked: [], saved: [] });
  const [adEarnings, setAdEarnings] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Fetch Profile
    getDoc(doc(db, "users", user.uid)).then(snap => {
      if (snap.exists()) {
        setProfile({ id: snap.id, ...snap.data() });
      }
    });

    // Fetch Earnings (Available only)
    const earningsQuery = query(collection(db, "creatorAdEarnings"), 
        where("creatorId", "==", user.uid), 
        where("status", "==", "AVAILABLE"));
    getDocs(earningsQuery).then(snap => {
        let total = 0;
        snap.docs.forEach(d => total += d.data().creatorAmount || 0);
        setAdEarnings(total);
    });

    // Fetch My Shorts
    getDocs(query(collection(db, "watchEarnVideos"), where("creatorId", "==", user.uid))).then(snap => {
        setVideos(prev => ({ ...prev, my: snap.docs.map(d => ({ id: d.id, ...d.data() } as WatchVideo)) }));
    });

    // Fetch Liked
    getDocs(query(collection(db, "watchVideoLikes"), where("userId", "==", user.uid))).then(async snap => {
        const likedIds = snap.docs.map(d => d.data().videoId);
        const likedVideos: WatchVideo[] = [];
        for (const id of likedIds) {
            const vSnap = await getDoc(doc(db, "watchEarnVideos", id));
            if (vSnap.exists()) likedVideos.push({ id: vSnap.id, ...vSnap.data() } as WatchVideo);
        }
        setVideos(prev => ({ ...prev, liked: likedVideos }));
    });

    // Fetch Saved
    getDocs(query(collection(db, FIRESTORE_PATHS.WATCH_EARN.SAVED_VIDEOS), where("userId", "==", user.uid))).then(async snap => {
        const savedIds = snap.docs.map(d => d.data().videoId);
        const savedVideos: WatchVideo[] = [];
        for (const id of savedIds) {
            const vSnap = await getDoc(doc(db, "watchEarnVideos", id));
            if (vSnap.exists()) savedVideos.push({ id: vSnap.id, ...vSnap.data() } as WatchVideo);
        }
        setVideos(prev => ({ ...prev, saved: savedVideos }));
    });
  }, [user]);

  const handleLogout = async () => { await signOut(auth); router.push("/login"); };

  if (!user) return <button onClick={() => router.push("/login")} className="p-4 text-white">Login</button>;

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="flex justify-between items-center mb-6">
        <Avatar name={profile?.name} photoUrl={profile?.photoUrl} size="w-20 h-20" />
        <div className="flex gap-4">
          <div className="text-center" onClick={() => router.push("/followers")}>
            <div className="font-bold">{profile?.followersCount || 0}</div>
            <div className="text-xs text-gray-400">Followers</div>
          </div>
          <div className="text-center" onClick={() => router.push("/followers")}>
            <div className="font-bold">{profile?.followingCount || 0}</div>
            <div className="text-xs text-gray-400">Following</div>
          </div>
        </div>
      </div>
      <div className="mb-6 font-bold">
        {profile?.name || profile?.displayName || "User"}{" "}
        <span className="text-gray-400">
          @{profile?.username || profile?.userName || "User"}
        </span>
      </div>
      
      <div className="bg-neutral-900 p-4 rounded-xl mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2"><Wallet className="text-cyan-400" /> <span>Available Ad Earnings</span></div>
        <div className="font-black text-xl">₹{adEarnings.toFixed(2)}</div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-neutral-800">
        {(['my', 'liked', 'saved'] as const).map(tab => (
            <button key={tab} className={`pb-2 ${activeTab === tab ? 'border-b-2 border-white' : 'text-gray-500'}`} onClick={() => setActiveTab(tab)}>
                {tab === 'my' && <Video size={20} />}
                {tab === 'liked' && <Heart size={20} />}
                {tab === 'saved' && <Bookmark size={20} />}
            </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-1">
        {videos[activeTab].map(v => (
          <div key={v.id} className="aspect-[9/16] bg-neutral-800 overflow-hidden" onClick={() => router.push(`/mlm/watch-earn/original/${v.id}`)}>
            <img src={v.thumbnail} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      
      <button onClick={handleLogout} className="flex items-center gap-2 mt-10 text-red-500"><LogOut size={20} /> Logout</button>
    </div>
  );
}
