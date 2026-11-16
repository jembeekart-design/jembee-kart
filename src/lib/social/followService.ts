import {
  doc,
  runTransaction,
  getDoc,
  collection,
} from "firebase/firestore";

import { db } from "@/firebase/config";
import { sendFollowNotification } from "./notificationService";

/**
 * Follow a user
 */
export const followUser = async (
  followerUid: string,
  targetUid: string,
  followerName: string
) => {
  if (!followerUid) {
    throw new Error("Follower user ID is missing");
  }

  if (!targetUid) {
    throw new Error("Target user ID is missing");
  }

  if (followerUid === targetUid) {
    throw new Error("Cannot follow yourself");
  }

  const followerRef = doc(
    db,
    "users",
    followerUid
  );

  const followRef = doc(
    collection(
      db,
      "users",
      targetUid,
      "followers"
    ),
    followerUid
  );

  const followingRef = doc(
    collection(
      db,
      "users",
      followerUid,
      "following"
    ),
    targetUid
  );

  await runTransaction(
    db,
    async (transaction) => {
      // -----------------------------------------
      // ALL READS FIRST
      // -----------------------------------------

      const [followSnap, followingSnap, followerSnap] = await Promise.all([
        transaction.get(followRef),
        transaction.get(followingRef),
        transaction.get(followerRef),
      ]);

      if (!followerSnap.exists()) {
        throw new Error("Follower user document not found");
      }

      const hasFollowerEdge = followSnap.exists();
      const hasFollowingEdge = followingSnap.exists();
      if (hasFollowerEdge && hasFollowingEdge) {
        throw new Error("Already following");
      }

      const followerData = followerSnap.data();
      const rawFollowingCount = Number(followerData.followingCount ?? 0);
      const currentFollowingCount = Number.isFinite(rawFollowingCount)
        ? Math.max(0, Math.floor(rawFollowingCount))
        : 0;
      const isNewRelationship = !hasFollowerEdge && !hasFollowingEdge;

      // -----------------------------------------
      // WRITES AFTER ALL READS
      // -----------------------------------------

      if (!hasFollowerEdge) {
        transaction.set(followRef, { uid: followerUid, timestamp: new Date() });
      }
      if (!hasFollowingEdge) {
        transaction.set(followingRef, { uid: targetUid, timestamp: new Date() });
      }
      if (isNewRelationship) {
        transaction.update(followerRef, { followingCount: currentFollowingCount + 1 });
      }

    }
  );

  // -----------------------------------------
  // Notification should NOT undo a successful
  // follow if notification fails.
  // -----------------------------------------

  try {
    // Repairing a one-sided legacy edge must not emit a second follow notification.
    // Only a newly-created relationship is announced.
    if (isNewRelationship) {
      await sendFollowNotification(followerUid, targetUid, followerName);
    }
  } catch (notificationError) {
    console.error(
      "Follow notification failed:",
      notificationError
    );
  }

  return {
    success: true,
  };
};

/**
 * Unfollow a user
 */
export const unfollowUser = async (
  followerUid: string,
  targetUid: string
) => {
  if (!followerUid) {
    throw new Error("Follower user ID is missing");
  }

  if (!targetUid) {
    throw new Error("Target user ID is missing");
  }

  if (followerUid === targetUid) {
    throw new Error("Cannot unfollow yourself");
  }

  const followerRef = doc(
    db,
    "users",
    followerUid
  );

  const followRef = doc(
    collection(
      db,
      "users",
      targetUid,
      "followers"
    ),
    followerUid
  );

  const followingRef = doc(
    collection(
      db,
      "users",
      followerUid,
      "following"
    ),
    targetUid
  );

  await runTransaction(
    db,
    async (transaction) => {
      // -----------------------------------------
      // ALL READS FIRST
      // -----------------------------------------

      const [followSnap, followingSnap, followerSnap] = await Promise.all([
        transaction.get(followRef),
        transaction.get(followingRef),
        transaction.get(followerRef),
      ]);

      if (!followerSnap.exists()) {
        throw new Error("Follower user document not found");
      }

      // -----------------------------------------
      // WRITES
      // -----------------------------------------

      const hasFollowerEdge = followSnap.exists();
      const hasFollowingEdge = followingSnap.exists();

      // A repeated unfollow is a no-op. Never decrement the counter
      // unless at least one persisted relationship edge existed.
      if (!hasFollowerEdge && !hasFollowingEdge) {
        return;
      }

      if (hasFollowerEdge) transaction.delete(followRef);
      if (hasFollowingEdge) transaction.delete(followingRef);

      const followerData = followerSnap.data();
      const currentFollowingCount =
        typeof followerData.followingCount === "number" &&
        Number.isFinite(followerData.followingCount)
          ? Math.max(0, Math.floor(followerData.followingCount))
          : 0;

      transaction.update(followerRef, {
        followingCount: Math.max(0, currentFollowingCount - 1),
      });

    }
  );

  return {
    success: true,
  };
};

/**
 * Check whether current user follows target user
 */
export const isFollowing = async (
  followerUid: string,
  targetUid: string
): Promise<boolean> => {
  if (!followerUid || !targetUid) {
    return false;
  }

  if (followerUid === targetUid) {
    return false;
  }

  const followRef = doc(
    db,
    "users",
    targetUid,
    "followers",
    followerUid
  );

  const followSnap =
    await getDoc(followRef);

  return followSnap.exists();
};
