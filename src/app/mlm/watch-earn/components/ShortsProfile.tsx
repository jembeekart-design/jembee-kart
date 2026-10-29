"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { Play, Settings, Wallet, LogOut, Heart, Bookmark, Video, UserPlus } from "lucide-react";
import Avatar from "@/components/user/Avatar";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { WatchVideo } from "@/lib/mlm/watch-earn/fetchWatchVideos";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";

export default function ShortsProfile() {
  const router = useRouter();
  const [user, setUser] = useState(auth.currentUser);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'my' | 'liked' | 'saved'>('my');
  const [videos, setVideos] = useState<{ my: WatchVideo[], liked: WatchVideo[], saved: WatchVideo[] }>({ my: [], liked: [], saved: [] });
  const [adEarnings, setAdEarnings] = useState(0);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
      return;
    }

    setUploadingPhoto(true);
    try {
      const result = await uploadToCloudinary(file, "image");
      const photoURL = result.secure_url;
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Please log in again.");

      const token = await currentUser.getIdToken();
      const response = await fetch("/api/profile/photo", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ photoURL }),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to save profile photo.");
      }
      setProfile((prev: any) => ({
        ...prev,
        photoURL,
        photoUrl: photoURL,
      }));
    } catch (error) {
      console.error("Shorts profile photo upload failed:", error);
      alert(error instanceof Error ? error.message : "Failed to upload profile photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleLogout = async () => { await signOut(auth); router.push("/login"); };

  if (!user) return <button onClick={() => router.push("/login")} className="p-4 text-white">Login</button>;

  return (
    <div className="min-h-screen bg-[#070816] text-white p-4 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6 rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-[#17152f] via-[#101326] to-[#111827] p-4 shadow-xl shadow-purple-950/30">
        <div className="relative">
          <Avatar
            name={profile?.name || profile?.displayName}
            photoUrl={profile?.photoURL || profile?.photoUrl || profile?.photo}
            size="w-20 h-20"
          />
          <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-white px-2 py-1 text-xs font-semibold text-black shadow">
            {uploadingPhoto ? "..." : "Edit"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingPhoto}
              onChange={handlePhotoChange}
            />
          </label>
        </div>
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
      <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-lg font-bold">
        {profile?.name || profile?.displayName || "User"}{" "}
        <span className="text-gray-400">
          @{profile?.username || profile?.userName || "User"}
        </span>
      </div>
      
      <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-amber-300/20 bg-gradient-to-r from-amber-950/60 via-[#241b29] to-[#15162c] p-4 shadow-lg shadow-amber-950/20">
        <div className="flex items-center gap-2"><Wallet className="text-cyan-400" /> <span>Available Ad Earnings</span></div>
        <div className="font-black text-xl">₹{adEarnings.toFixed(2)}</div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-[#111326] p-2">
        {(['my', 'liked', 'saved'] as const).map(tab => (
            <button key={tab} className={`flex min-h-16 flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all duration-200 ${activeTab === tab ? (tab === 'my' ? 'border-fuchsia-400 bg-gradient-to-br from-fuchsia-600 to-violet-700 text-white shadow-lg shadow-fuchsia-900/40' : tab === 'liked' ? 'border-rose-400/60 bg-rose-500/15 text-rose-300' : 'border-teal-400/60 bg-teal-500/15 text-teal-300') : 'border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.07]'}`} onClick={() => setActiveTab(tab)}>
                {tab === 'my' && <Video size={20} />}
                {tab === 'liked' && <Heart size={20} />}
                {tab === 'saved' && <Bookmark size={20} />}
            </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-indigo-400/15 bg-[#101222] p-2">
        {videos[activeTab].map(v => (
          <div key={v.id} className="aspect-[9/16] overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-indigo-950 to-slate-900 shadow-md shadow-black/30 transition-transform duration-200 active:scale-95" onClick={() => router.push(`/mlm/watch-earn/original/${v.id}`)}>
            <img src={v.thumbnail} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
          </div>
        ))}
      </div>
      
      <button onClick={handleLogout} className="mt-8 flex items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-rose-300 transition hover:bg-rose-500/20"><LogOut size={20} /> Logout</button>
    </div>
  );
}
