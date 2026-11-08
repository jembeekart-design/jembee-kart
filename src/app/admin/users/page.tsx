"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { auth, db } from "@/firebase/config";

type UserRow = { id: string; name: string; email: string; role: string; creator: boolean };
export default function AdminUsersPage(){
 const [rows,setRows]=useState<UserRow[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
 useEffect(()=>{let active=true;(async()=>{try{const user=auth.currentUser;if(!user)throw new Error("Admin sign-in required");const token=await user.getIdToken();const check=await fetch("/api/auth/admin-check",{headers:{Authorization:`Bearer ${token}`},cache:"no-store"});if(!check.ok)throw new Error("Admin access required");const snap=await getDocs(query(collection(db,"users"),limit(200)));if(!active)return;setRows(snap.docs.map(d=>{const x=d.data();return{id:d.id,name:String(x.displayName||x.name||"User"),email:String(x.email||""),role:String(x.role||"user"),creator:x.creator===true||x.isCreator===true}}));}catch(e){if(active)setError(e instanceof Error?e.message:"Could not load users");}finally{if(active)setLoading(false)}})();return()=>{active=false}},[]);
 return <main className="min-h-screen bg-[#0b1220] p-5 text-white"><div className="mx-auto max-w-5xl"><h1 className="text-3xl font-black">Users & Creators</h1><p className="mt-2 text-sm text-white/60">Account and creator access overview. Account and creator access overview.</p>{loading?<p className="mt-8">Loading users…</p>:error?<p role="alert" className="mt-8 text-amber-200">{error}</p>:<div className="mt-6 overflow-hidden rounded-2xl border border-white/10">{rows.map(row=><div key={row.id} className="grid gap-1 border-b border-white/10 p-4 sm:grid-cols-[1fr_1.2fr_auto] sm:items-center"><div><p className="font-bold">{row.name}</p><p className="text-xs text-white/45">{row.id}</p></div><p className="break-all text-sm text-white/65">{row.email}</p><span className="text-xs font-bold text-cyan-300">{row.creator?"CREATOR":row.role.toUpperCase()}</span></div>)}{rows.length===0&&<p className="p-5 text-white/60">No users found.</p>}</div>}</div></main>
}
