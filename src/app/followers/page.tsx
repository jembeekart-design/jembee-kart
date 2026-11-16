"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot, type DocumentData } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { unfollowUser } from "@/lib/social/followService";
import Link from "next/link";
import Avatar from "@/components/user/Avatar";

interface FollowedUser {
  id: string;
  name: string;
  username: string;
  photoUrl: string;
  followedAt: string | null;
}

type ListType = "followers" | "following";

export default function FollowersPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [users, setUsers] = useState<FollowedUser[]>([]);
  const [activeTab, setActiveTab] = useState<ListType>("followers");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyUid, setBusyUid] = useState("");

  useEffect(() => onAuthStateChanged(auth, setCurrentUser), []);

  useEffect(() => {
    if (!currentUser) {
      setUserData(null);
      return;
    }
    return onSnapshot(doc(db, "users", currentUser.uid), (snapshot) => {
      setUserData(snapshot.exists() ? snapshot.data() : null);
    }, (cause) => {
      console.error("Follow counts load failed:", cause);
      setError("Follow counts could not be loaded.");
    });
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setUsers([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError("");
    void (async () => {
      try {
        const token = await currentUser.getIdToken();
        const response = await fetch(`/api/social/follow-list?type=${activeTab}&limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || result.success !== true || !Array.isArray(result.users)) {
          throw new Error(typeof result.message === "string" ? result.message : "Unable to load this list.");
        }
        if (active) setUsers(result.users as FollowedUser[]);
      } catch (cause) {
        console.error("Follow list load failed:", cause);
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load this list.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [currentUser, activeTab]);

  const handleUnfollow = async (targetUid: string) => {
    if (!currentUser || activeTab !== "following") return;
    setBusyUid(targetUid);
    setError("");
    try {
      await unfollowUser(currentUser.uid, targetUid);
      setUsers((previous) => previous.filter((item) => item.id !== targetUid));
    } catch (cause) {
      console.error("Unfollow error:", cause);
      setError(cause instanceof Error ? cause.message : "Failed to unfollow.");
    } finally {
      setBusyUid("");
    }
  };

  if (!currentUser) {
    return <main className="min-h-screen bg-slate-950 p-6 text-white">Please log in to view your follow lists.</main>;
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 pt-8 text-white sm:p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-black">Followers & Following</h1>
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <div className="text-2xl font-black">{Number(userData?.followersCount || 0)}</div>
            <div className="text-sm text-slate-300">Followers</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <div className="text-2xl font-black">{Number(userData?.followingCount || 0)}</div>
            <div className="text-sm text-slate-300">Following</div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-xl border border-white/10 bg-white/5 p-1">
          {(["followers", "following"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              aria-pressed={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-3 py-3 text-sm font-bold capitalize transition ${activeTab === tab ? "bg-violet-600 text-white" : "text-slate-300 hover:bg-white/10"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {error && <p role="alert" className="mb-4 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}
        {loading ? (
          <p className="py-10 text-center text-slate-300">Loading {activeTab}…</p>
        ) : users.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 py-12 text-center text-slate-300">
            <p>No {activeTab} yet.</p>
            <Link href="/explore" className="mt-3 inline-block font-bold text-violet-300">Explore creators</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <Link href={`/profile/${item.id}`} className="flex min-w-0 items-center gap-3">
                  <Avatar name={item.name} photoUrl={item.photoUrl} size="w-12 h-12" />
                  <span className="min-w-0">
                    <span className="block truncate font-bold">{item.name}</span>
                    <span className="block truncate text-xs text-slate-400">@{item.username}</span>
                    {item.followedAt && <span className="block text-xs text-slate-500">Since {new Date(item.followedAt).toLocaleDateString()}</span>}
                  </span>
                </Link>
                {activeTab === "following" && (
                  <button
                    type="button"
                    disabled={busyUid === item.id}
                    onClick={() => void handleUnfollow(item.id)}
                    className="shrink-0 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-slate-200 disabled:opacity-50"
                  >
                    {busyUid === item.id ? "Please wait…" : "Unfollow"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
