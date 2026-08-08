"use client";

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { followUser, unfollowUser, isFollowing } from '@/lib/social/followService';
import { auth, db } from '@/firebase/config';

interface FollowButtonProps {
  targetUid: string;
}

export default function FollowButton({ targetUid }: FollowButtonProps) {
  const { requireAuth } = useRequireAuth();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      if (auth.currentUser && auth.currentUser.uid !== targetUid) {
        const status = await isFollowing(auth.currentUser.uid, targetUid);
        setFollowing(status);
      }
      setLoading(false);
    };
    checkStatus();
  }, [targetUid]);

  const handleToggleFollow = async () => {
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      if (following) {
        await unfollowUser(auth.currentUser.uid, targetUid);
        setFollowing(false);
      } else {
        // Fetch follower's name before following
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const followerName = userDoc.data()?.name || "Someone";

        await followUser(auth.currentUser.uid, targetUid, followerName);
        setFollowing(true);
      }
    } catch (error) {
      console.error("Follow error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <button className="px-4 py-2 rounded-full bg-gray-200 text-gray-500">Loading...</button>;
  if (auth.currentUser?.uid === targetUid) return null;

  return (
    <button 
      onClick={() => requireAuth(handleToggleFollow)}
      className={`px-4 py-2 rounded-full font-black text-sm ${following ? 'bg-gray-200 text-black' : 'bg-[var(--color-primary-button)] text-[var(--button-text-color)]'}`}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  );
}
