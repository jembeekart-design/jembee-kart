"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import Header from "@/components/navigation/Header";
import BottomNavbar from "@/components/navigation/BottomNavbar";
import FollowButton from "@/components/social/FollowButton";
import { User } from "lucide-react";

interface UserProfile {
  uid: string;
  name: string;
  photo?: string;
  username?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
}

export default function UserProfilePage() {
  const { uid } = useParams() as { uid: string };
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    const docRef = doc(db, "users", uid);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUser({
            uid: docSnap.id,
            name: data.name || data.displayName || "User",
            photo: data.photoUrl || data.photo || "",
            username: data.username || "",
            bio: data.bio || "",
            followersCount: data.followersCount || 0,
            followingCount: data.followingCount || 0,
          });
          setNotFound(false);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching user profile:", error);
        setNotFound(true);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-page-background)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary-button)]"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-page-background)] p-4 text-center">
        <h1 className="text-2xl font-black text-[var(--text-primary)]">User Not Found</h1>
        <p className="mt-2 text-[var(--text-secondary)]">The requested user profile does not exist.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-page-background)] pb-32 pt-[115px]">
      <Header />
      
      <section className="px-4">
        <div className="rounded-[35px] bg-[var(--color-card-background)] p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-card-background)]/20 overflow-hidden text-3xl font-black">
              {user?.photo ? (
                <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-[var(--text-secondary)]" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-black text-[var(--text-primary)]">{user?.name}</h2>
              {user?.username && (
                <p className="text-sm text-[var(--text-secondary)]">@{user.username}</p>
              )}
              
              <div className="flex gap-4 mt-3">
                <p className="text-sm font-semibold">
                  <span className="font-black">{user?.followersCount || 0}</span> Followers
                </p>
                <p className="text-sm font-semibold">
                  <span className="font-black">{user?.followingCount || 0}</span> Following
                </p>
              </div>
            </div>
            
            <FollowButton targetUid={uid} />
          </div>

          {user?.bio && (
            <p className="mt-6 text-[var(--text-secondary)]">{user.bio}</p>
          )}
        </div>
      </section>

      {/* Public user content placeholder */}
      <section className="mt-6 px-4">
        <h3 className="text-xl font-black text-[var(--text-primary)] mb-4">Content</h3>
        <div className="rounded-[35px] bg-[var(--color-card-background)] p-6 shadow-sm text-center">
            <p className="text-[var(--text-secondary)]">No public content available yet.</p>
        </div>
      </section>

      <BottomNavbar />
    </main>
  );
}
