"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/firebase/config";
import { doc, onSnapshot, collection, getDoc, DocumentData } from "firebase/firestore";
import Header from "@/components/navigation/Header";
import BottomNavbar from "@/components/navigation/BottomNavbar";
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
  const { theme } = useTheme();
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [following, setFollowing] = useState<FollowedUser[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Listen to user doc for counts
    const userUnsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (doc) => {
      const data = doc.data();
      if (data) setUserData(data);
    });

    // Listen to following list
    const followingRef = collection(db, "users", auth.currentUser.uid, "following");
    const followingUnsub = onSnapshot(followingRef, async (snapshot) => {
      const results = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const followedUserRef = doc(db, "users", docSnap.id);
        const followedUserSnap = await getDoc(followedUserRef);
        if (!followedUserSnap.exists()) {
          return null;
        }

        const data = followedUserSnap.data();

        // Robust fallback for name and username to avoid 'Anonymous' or '@unknown'
        const displayName = data.name || "User";
        const displayUsername = data.username || (data.name ? data.name.replace(/\s+/g, '').toLowerCase() : `user_${docSnap.id.slice(0, 4)}`);

        return {
          id: docSnap.id,
          name: displayName,
          username: displayUsername,
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
    <main
      className="min-h-screen pb-20 pt-[130px]"
      style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
    >
      <Header />
      <div className="px-4">
        <h1 className="text-2xl font-black mb-6">Followers</h1>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[var(--card-color)] p-4 rounded-xl text-center">
                <div className="text-2xl font-black">{userData?.followersCount || 0}</div>
                <div className="text-sm text-[var(--muted-text-color)]">Followers</div>
            </div>
            <div className="bg-[var(--card-color)] p-4 rounded-xl text-center">
                <div className="text-2xl font-black">{userData?.followingCount || 0}</div>
                <div className="text-sm text-[var(--muted-text-color)]">Following</div>
            </div>
        </div>

        <h2 className="text-xl font-bold mb-4">Follow History</h2>
        <div className="space-y-4">
          {following.map((user) => (
            <div key={user.id} className="flex items-center justify-between bg-[var(--card-color)] p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Avatar name={user.name} photoUrl={user.photoUrl} size="w-12 h-12" />
                <div>
                  <div className="font-bold">{user.name}</div>
                  <div className="text-xs text-[var(--muted-text-color)]">@{user.username}</div>
                  <div className="text-xs text-[var(--muted-text-color)]">
                    Followed: {user.followedAt?.toDate().toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/profile/${user.id}`} className="px-3 py-1 bg-[var(--primary-color)] text-white rounded-lg text-sm">View</Link>
                <button onClick={() => handleUnfollow(user.id)} className="px-3 py-1 bg-[var(--danger-color)] text-white rounded-lg text-sm">Unfollow</button>
              </div>
            </div>
          ))}
          {following.length === 0 && (
              <div className="text-center text-[var(--muted-text-color)] py-10">No users followed yet.</div>
          )}
        </div>
      </div>
      <BottomNavbar />
    </main>
  );
}
