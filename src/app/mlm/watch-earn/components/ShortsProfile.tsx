"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { BadgeCheck, Bookmark, CreditCard, Eye, Heart, History, LogOut, MessageCircle, Play, Sparkles, Video, Wallet } from "lucide-react";
import Avatar from "@/components/user/Avatar";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { WatchVideo } from "@/lib/mlm/watch-earn/fetchWatchVideos";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";

export type ProfileSection = "videos" | "liked" | "saved" | "earnings" | "history" | "payments";
type Props = { activeSection: ProfileSection; onSectionChange: (section: ProfileSection) => void };
type VideoTab = "videos" | "liked" | "saved";

const sections: { id: ProfileSection; label: string; icon: React.ElementType; tone: string }[] = [
  { id: "videos", label: "Videos", icon: Video, tone: "from-fuchsia-500 to-violet-600" },
  { id: "liked", label: "Liked", icon: Heart, tone: "from-rose-500 to-pink-600" },
  { id: "saved", label: "Saved", icon: Bookmark, tone: "from-teal-400 to-cyan-600" },
  { id: "earnings", label: "Earnings", icon: Wallet, tone: "from-amber-400 to-orange-500" },
  { id: "history", label: "History", icon: History, tone: "from-sky-400 to-blue-600" },
  { id: "payments", label: "Payments", icon: CreditCard, tone: "from-violet-400 to-indigo-600" },
];

export default function ShortsProfile({ activeSection, onSectionChange }: Props) {
  const router = useRouter();
  const [user, setUser] = useState(auth.currentUser);
  const [profile, setProfile] = useState<any>(null);
  const [videos, setVideos] = useState<{ videos: WatchVideo[]; liked: WatchVideo[]; saved: WatchVideo[] }>({ videos: [], liked: [], saved: [] });
  const [adEarnings, setAdEarnings] = useState(0);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => setUser(currentUser));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const load = async () => {
      try {
        const [profileSnap, earningsSnap, ownSnap, likedSnap, savedSnap] = await Promise.all([
          getDoc(doc(db, "users", user.uid)),
          getDocs(query(collection(db, "creatorAdEarnings"), where("creatorId", "==", user.uid), where("status", "==", "AVAILABLE"))),
          getDocs(query(collection(db, "watchEarnVideos"), where("creatorId", "==", user.uid))),
          getDocs(query(collection(db, "watchVideoLikes"), where("userId", "==", user.uid))),
          getDocs(query(collection(db, FIRESTORE_PATHS.WATCH_EARN.SAVED_VIDEOS), where("userId", "==", user.uid))),
        ]);
        if (!active) return;
        if (profileSnap.exists()) setProfile({ id: profileSnap.id, ...profileSnap.data() });
        setAdEarnings(earningsSnap.docs.reduce((total, item) => total + Number(item.data().creatorAmount || 0), 0));
        setVideos((prev) => ({ ...prev, videos: ownSnap.docs.map((item) => ({ id: item.id, ...item.data() } as WatchVideo)) }));

        const fetchVideosByIds = async (ids: string[]) => {
          const uniqueIds = [...new Set(ids.filter((id): id is string => typeof id === "string" && id.length > 0))];
          const results = await Promise.all(uniqueIds.map(async (id) => {
            const snapshot = await getDoc(doc(db, "watchEarnVideos", id));
            return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as WatchVideo) : null;
          }));
          return results.filter((item): item is WatchVideo => item !== null);
        };
        const [likedVideos, savedVideos] = await Promise.all([
          fetchVideosByIds(likedSnap.docs.map((item) => item.data().videoId)),
          fetchVideosByIds(savedSnap.docs.map((item) => item.data().videoId)),
        ]);
        if (active) setVideos((prev) => ({ ...prev, liked: likedVideos, saved: savedVideos }));
      } catch (error) {
        console.error("Failed to load creator profile:", error);
      }
    };
    void load();
    return () => { active = false; };
  }, [user]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) { alert("Please select an image."); return; }
    setUploadingPhoto(true);
    try {
      const result = await uploadToCloudinary(file, "image");
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Please log in again.");
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/profile/photo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ photoURL: result.secure_url }),
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || "Failed to save profile photo.");
      setProfile((prev: any) => ({ ...prev, photoURL: result.secure_url, photoUrl: result.secure_url }));
    } catch (error) {
      console.error("Shorts profile photo upload failed:", error);
      alert(error instanceof Error ? error.message : "Failed to upload profile photo.");
    } finally { setUploadingPhoto(false); }
  };

  const handleLogout = async () => { await signOut(auth); router.push("/login"); };
  if (!user) return <button onClick={() => router.push("/login")} className="p-4 text-white">Login</button>;

  const currentVideoTab: VideoTab | null = activeSection === "videos" || activeSection === "liked" || activeSection === "saved" ? activeSection : null;
  const currentVideos = currentVideoTab ? videos[currentVideoTab] : [];
  const name = profile?.name || profile?.displayName || user.displayName || "Creator";
  const username = profile?.username || profile?.userName || user.email?.split("@")[0] || "creator";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070816] px-4 pb-8 pt-5 text-white sm:px-6">
      <div className="pointer-events-none absolute -left-24 top-12 h-64 w-64 rounded-full bg-fuchsia-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-64 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-5xl">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#21163e] via-[#11162e] to-[#101827] p-5 shadow-2xl shadow-purple-950/30 sm:p-7">
          <div className="absolute -right-10 -top-14 h-44 w-44 rounded-full bg-fuchsia-500/15 blur-2xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative w-fit shrink-0">
              <div className="rounded-full bg-gradient-to-br from-fuchsia-400 via-violet-500 to-cyan-400 p-[3px] shadow-lg shadow-fuchsia-900/30">
                <div className="rounded-full bg-[#111326] p-1"><Avatar name={name} photoUrl={profile?.photoURL || profile?.photoUrl || profile?.photo} size="w-24 h-24" /></div>
              </div>
              <label className="absolute -bottom-1 -right-2 cursor-pointer rounded-full border border-white/20 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 shadow-lg">
                {uploadingPhoto ? "Saving…" : "Edit photo"}
                <input type="file" accept="image/*" className="hidden" disabled={uploadingPhoto} onChange={handlePhotoChange} />
              </label>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-black tracking-tight sm:text-3xl">{name}</h1><span className="inline-flex items-center gap-1 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 text-xs font-bold text-cyan-200"><BadgeCheck size={14} /> Creator</span></div>
              <p className="mt-1 break-all text-sm text-slate-300">@{username}</p>
              <p className="mt-3 flex items-center gap-2 text-xs text-slate-400"><Sparkles size={14} className="text-fuchsia-300" /> Your videos, community and creator earnings in one place</p>
            </div>
            <button onClick={handleLogout} className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-rose-300/20 bg-rose-400/10 px-4 py-2.5 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/20 sm:self-center"><LogOut size={17} /> Logout</button>
          </div>
          <div className="relative mt-7 grid grid-cols-3 gap-2 border-t border-white/10 pt-5">
            <div className="rounded-2xl bg-white/[0.045] p-3 text-center"><p className="text-xl font-black">{videos.videos.length}</p><p className="mt-1 text-xs text-slate-400">Videos</p></div>
            <button onClick={() => router.push("/followers")} className="rounded-2xl bg-white/[0.045] p-3 text-center transition hover:bg-white/[0.08]"><p className="text-xl font-black">{Number(profile?.followersCount || 0)}</p><p className="mt-1 text-xs text-slate-400">Followers</p></button>
            <button onClick={() => router.push("/followers")} className="rounded-2xl bg-white/[0.045] p-3 text-center transition hover:bg-white/[0.08]"><p className="text-xl font-black">{Number(profile?.followingCount || 0)}</p><p className="mt-1 text-xs text-slate-400">Following</p></button>
          </div>
        </header>

        <button onClick={() => onSectionChange("earnings")} className="mt-4 flex w-full items-center justify-between gap-4 rounded-2xl border border-amber-300/20 bg-gradient-to-r from-[#38251e] via-[#231b30] to-[#141a30] p-4 text-left shadow-lg shadow-amber-950/10 transition hover:border-amber-200/40">
          <span className="flex items-center gap-3"><span className="rounded-xl bg-cyan-300/10 p-2.5 text-cyan-300"><Wallet size={22} /></span><span><span className="block text-sm font-bold">Available Ad Earnings</span><span className="mt-1 block text-xs text-slate-400">Your available creator earnings</span></span></span><span className="text-xl font-black text-amber-200">₹{adEarnings.toFixed(2)}</span>
        </button>

        <nav aria-label="Profile sections" className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {sections.map(({ id, label, icon: Icon, tone }) => {
            const selected = activeSection === id;
            return <button key={id} aria-pressed={selected} onClick={() => onSectionChange(id)} className={`group flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-2xl border p-3 transition duration-200 ${selected ? `border-white/25 bg-gradient-to-br ${tone} text-white shadow-lg` : "border-white/10 bg-[#111326]/90 text-slate-400 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"}`}><Icon size={21} /><span className="text-xs font-bold">{label}</span></button>;
          })}
        </nav>

        {currentVideoTab && <section className="mt-6">
          <div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="text-xl font-black">{sections.find((item) => item.id === activeSection)?.label}</h2><p className="mt-1 text-xs text-slate-400">{currentVideos.length} {currentVideos.length === 1 ? "video" : "videos"}</p></div><span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300">Tap a video to watch</span></div>
          {currentVideos.length === 0 ? <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.025] px-5 py-12 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-400/10 text-violet-300"><Video size={26} /></span><h3 className="mt-4 font-bold">No videos here yet</h3><p className="mt-1 text-sm text-slate-400">Videos saved to this section will appear here.</p></div> : <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-5">
            {currentVideos.map((video) => <button key={video.id} type="button" aria-label={`Play ${video.caption || "video"}`} onClick={() => router.push(`/mlm/watch-earn/original/${video.id}`)} className="group min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#111326] text-left shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-fuchsia-300/40">
              <div className="relative aspect-[9/16] overflow-hidden bg-gradient-to-br from-violet-950 to-slate-900">{video.thumbnail ? <img src={video.thumbnail} alt={video.caption || "Video thumbnail"} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-white/50"><Play size={28} /></div>}<span className="absolute bottom-2 right-2 rounded-lg bg-black/65 p-1.5 text-white"><Play size={14} fill="currentColor" /></span></div>
              <div className="p-2"><p className="line-clamp-2 min-h-8 text-[11px] font-semibold text-slate-100">{video.caption || "Untitled video"}</p><div className="mt-2 flex items-center justify-between gap-1 text-[10px] text-slate-400"><span className="flex items-center gap-1"><Eye size={11} /> {Number(video.views || 0)}</span><span className="flex items-center gap-1"><Heart size={11} /> {Number(video.likes || 0)}</span><span className="flex items-center gap-1"><MessageCircle size={11} /> {Number(video.comments || 0)}</span></div></div>
            </button>)}
          </div>}
        </section>}
      </div>
    </main>
  );
}
