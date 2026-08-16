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

  const targetRef = doc(
    db,
    "users",
    targetUid
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

      const [
        followSnap,
        followerSnap,
        targetSnap,
      ] = await Promise.all([
        transaction.get(followRef),
        transaction.get(followerRef),
        transaction.get(targetRef),
      ]);

      if (followSnap.exists()) {
        throw new Error("Already following");
      }

      if (!followerSnap.exists()) {
        throw new Error(
          "Follower user document not found"
        );
      }

      if (!targetSnap.exists()) {
        throw new Error(
          "Target user document not found"
        );
      }

      const followerData =
        followerSnap.data();

      const targetData =
        targetSnap.data();

      const currentFollowingCount =
        typeof followerData.followingCount ===
        "number"
          ? followerData.followingCount
          : 0;

      const currentFollowersCount =
        typeof targetData.followersCount ===
        "number"
          ? targetData.followersCount
          : 0;

      // -----------------------------------------
      // WRITES AFTER ALL READS
      // -----------------------------------------

      transaction.set(followRef, {
        uid: followerUid,
        timestamp: new Date(),
      });

      transaction.set(followingRef, {
        uid: targetUid,
        timestamp: new Date(),
      });

      transaction.update(followerRef, {
        followingCount:
          currentFollowingCount + 1,
      });

      transaction.update(targetRef, {
        followersCount:
          currentFollowersCount + 1,
      });
    }
  );

  // -----------------------------------------
  // Notification should NOT undo a successful
  // follow if notification fails.
  // -----------------------------------------

  try {
    await sendFollowNotification(
      followerUid,
      targetUid,
      followerName
    );
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

  const targetRef = doc(
    db,
    "users",
    targetUid
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

      const [
        followSnap,
        followerSnap,
        targetSnap,
      ] = await Promise.all([
        transaction.get(followRef),
        transaction.get(followerRef),
        transaction.get(targetRef),
      ]);

      if (!followerSnap.exists()) {
        throw new Error(
          "Follower user document not found"
        );
      }

      if (!targetSnap.exists()) {
        throw new Error(
          "Target user document not found"
        );
      }

      // -----------------------------------------
      // WRITES
      // -----------------------------------------

      if (followSnap.exists()) {
        transaction.delete(followRef);
      }

      transaction.delete(followingRef);

      const followerData =
        followerSnap.data();

      const targetData =
        targetSnap.data();

      const currentFollowingCount =
        typeof followerData.followingCount ===
        "number"
          ? followerData.followingCount
          : 0;

      const currentFollowersCount =
        typeof targetData.followersCount ===
        "number"
          ? targetData.followersCount
          : 0;

      transaction.update(followerRef, {
        followingCount: Math.max(
          0,
          currentFollowingCount - 1
        ),
      });

      transaction.update(targetRef, {
        followersCount: Math.max(
          0,
          currentFollowersCount - 1
        ),
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
