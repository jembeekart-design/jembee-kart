"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/firebase/config";
import { doc, onSnapshot, collection, getDoc, DocumentData } from "firebase/firestore";
import { useTheme } from "@/context/ThemeContext";
import { unfollowUser } from "@/lib/social/followService";
import Link from "next/link";
import Avatar from "@/components/user/Avatar";

interface FollowedUser {
  id: string;
  name: string;
  username: string;
  photoUrl: string;
  followedAt: any;
}

export default function FollowersPage() {
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [following, setFollowing] = useState<FollowedUser[]>([]);
  const [activeTab, setActiveTab] = useState<'history' | 'list'>('history');

  useEffect(() => {
    if (!auth.currentUser) return;

    const userUnsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (doc) => {
      const data = doc.data();
      if (data) setUserData(data);
    });

    const followingRef = collection(db, "users", auth.currentUser.uid, "following");
    const followingUnsub = onSnapshot(followingRef, async (snapshot) => {
      const results = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const followedUserRef = doc(db, "users", docSnap.id);
        const followedUserSnap = await getDoc(followedUserRef);
        if (!followedUserSnap.exists()) return null;

        const data = followedUserSnap.data();
        return {
          id: docSnap.id,
          name: data.name || "User",
          username: data.username || `user_${docSnap.id.slice(0, 4)}`,
          photoUrl: data.photoUrl || "/default-avatar.png",
          followedAt: docSnap.data().timestamp
        } as FollowedUser;
      }));
      setFollowing(results.filter((user): user is FollowedUser => user !== null));
    });

    return () => {
      userUnsub();
      followingUnsub();
    };
  }, []);

  const handleUnfollow = async (targetUid: string) => {
    if (!auth.currentUser) return;
    try {
      await unfollowUser(auth.currentUser.uid, targetUid);
    } catch (error) {
      console.error("Unfollow error:", error);
      alert("Failed to unfollow");
    }
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 p-4 pt-8">
      <h1 className="text-2xl font-black mb-6">Followers</h1>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-teal-50 border border-teal-100 p-4 rounded-2xl text-center shadow-sm">
          <div className="text-2xl font-black text-teal-800">{userData?.followersCount || 0}</div>
          <div className="text-sm text-teal-600">Followers</div>
        </div>
        <div className="bg-teal-50 border border-teal-100 p-4 rounded-2xl text-center shadow-sm">
          <div className="text-2xl font-black text-teal-800">{userData?.followingCount || 0}</div>
          <div className="text-sm text-teal-600">Following</div>
        </div>
      </div>
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`flex-1 py-2 text-sm font-bold ${activeTab === 'history' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('history')}
        >
          Follow History
        </button>
        <button
          className={`flex-1 py-2 text-sm font-bold ${activeTab === 'list' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('list')}
        >
          Followers List
        </button>
      </div>

      <div className="space-y-4">
        {following.map((user) => (
          <div key={user.id} className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar name={user.name} photoUrl={user.photoUrl} size="w-12 h-12" />
              <div>
                <div className="font-bold">{user.name}</div>
                <div className="text-xs text-gray-500">@{user.username}</div>
                {activeTab === 'history' && (
                  <div className="text-xs text-teal-600">
                    Followed: {user.followedAt?.toDate().toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/profile/${user.id}`} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">View</Link>
              <button onClick={() => handleUnfollow(user.id)} className="px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-sm font-medium hover:bg-teal-100">Unfollow</button>
            </div>
          </div>
        ))}
        {following.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            <p>No users followed yet.</p>
            <Link href="/explore" className="text-teal-600 font-bold mt-2 inline-block">Explore Users</Link>
          </div>
        )}
      </div>
    </main>
  );
}
