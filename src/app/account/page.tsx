"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/firebase/config";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => onAuthStateChanged(auth, (current) => { setUser(current); setLoading(false); }), []);
  async function logout() { await signOut(auth); router.replace("/login"); }
  if (loading) return <main className="grid min-h-screen place-items-center bg-black text-white">Loading profile…</main>;
  if (!user) return <main className="grid min-h-screen place-items-center bg-black p-6 text-white"><div className="text-center"><h1 className="text-2xl font-bold">Your JEMBEE PLAY account</h1><p className="mt-2 text-white/70">Sign in to upload videos, follow creators and manage your profile.</p><Link className="mt-5 inline-block rounded-xl bg-cyan-400 px-5 py-3 font-bold text-black" href="/login">Sign in</Link></div></main>;
  return <main className="min-h-screen bg-[#0b0b0b] p-5 pb-24 text-white"><div className="mx-auto max-w-2xl"><Link href="/" className="text-sm text-cyan-300">← JEMBEE PLAY</Link><section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6"><div className="flex items-center gap-4">{user.photoURL ? <img src={user.photoURL} alt="Profile" className="h-16 w-16 rounded-full object-cover"/> : <div className="grid h-16 w-16 place-items-center rounded-full bg-cyan-400 text-2xl font-black text-black">{(user.displayName || user.email || "J").slice(0,1).toUpperCase()}</div>}<div className="min-w-0"><h1 className="text-2xl font-black">{user.displayName || "JEMBEE PLAY User"}</h1><p className="truncate text-sm text-white/60">{user.email}</p></div></div><p className="mt-5 text-sm text-white/70">Manage your video and learning experience.</p></section><div className="mt-5 grid gap-3 sm:grid-cols-2">{[{label:"Watch Shorts",href:"/shorts"},{label:"Explore videos",href:"/explore"},{label:"Upload a video",href:"/videos/upload"},{label:"School Learning",href:"/learn/school"},{label:"My creator profile",href:`/profile/${user.uid}`},{label:"Followers",href:"/followers"},{label:"Notifications",href:"/videos/notifications"}].map((item)=><Link key={item.href} href={item.href} className="rounded-2xl border border-white/10 bg-white/5 p-4 font-semibold hover:bg-white/10">{item.label} →</Link>)}</div><button onClick={logout} className="mt-6 rounded-xl border border-red-400/40 px-5 py-3 font-bold text-red-300">Sign out</button></div></main>;
}
