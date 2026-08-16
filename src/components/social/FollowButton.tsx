"use client";

import { useState, useEffect, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import {
  followUser,
  unfollowUser,
  isFollowing,
} from "@/lib/social/followService";
import { auth, db } from "@/firebase/config";

interface FollowButtonProps {
  targetUid: string;
}

export default function FollowButton({
  targetUid,
}: FollowButtonProps) {
  const { requireAuth } = useRequireAuth();

  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Check whether current user is already following target user.
   */
  const checkFollowingStatus = useCallback(async () => {
    try {
      setErrorMessage(null);

      const currentUser = auth.currentUser;

      if (!currentUser) {
        setFollowing(false);
        setLoading(false);
        return;
      }

      // Don't show Follow button for yourself.
      if (currentUser.uid === targetUid) {
        setLoading(false);
        return;
      }

      const status = await isFollowing(
        currentUser.uid,
        targetUid
      );

      setFollowing(status);
    } catch (error: any) {
      console.error(
        "CHECK FOLLOW STATUS ERROR:",
        error
      );

      setErrorMessage(
        error?.code
          ? `Follow status error: ${error.code}`
          : error?.message || "Failed to check follow status."
      );

      setFollowing(false);
    } finally {
      setLoading(false);
    }
  }, [targetUid]);

  /**
   * Follow / Unfollow handler.
   */
  const handleToggleFollow = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setErrorMessage("Please login first.");
      return;
    }

    if (currentUser.uid === targetUid) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      if (following) {
        // UNFOLLOW
        await unfollowUser(
          currentUser.uid,
          targetUid
        );

        setFollowing(false);
      } else {
        // Get current user's name
        const userDoc = await getDoc(
          doc(db, "users", currentUser.uid)
        );

        const userData = userDoc.exists()
          ? userDoc.data()
          : {};

        const followerName =
          userData?.displayName ||
          userData?.name ||
          userData?.username ||
          "Someone";

        // FOLLOW
        await followUser(
          currentUser.uid,
          targetUid,
          followerName
        );

        setFollowing(true);
      }
    } catch (error: any) {
      console.error(
        "FOLLOW ACTION ERROR:",
        error
      );

      const code = error?.code;
      const message =
        error?.message || "Unable to follow user.";

      setErrorMessage(
        code
          ? `${code}: ${message}`
          : message
      );

      // Important:
      // Don't change following state when Firebase fails.
    } finally {
      setLoading(false);
    }
  }, [following, targetUid]);

  /**
   * Initial status check.
   */
  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      try {
        setLoading(true);

        const currentUser = auth.currentUser;

        if (!currentUser) {
          if (!cancelled) {
            setFollowing(false);
            setLoading(false);
          }
          return;
        }

        if (currentUser.uid === targetUid) {
          if (!cancelled) {
            setLoading(false);
          }
          return;
        }

        /**
         * Check pending follow action after login.
         */
        const pendingAction = localStorage.getItem(
          "jbk_pending_action_type"
        );

        const pendingData = localStorage.getItem(
          "jbk_pending_action_data"
        );

        if (
          pendingAction === "follow" &&
          pendingData === targetUid
        ) {
          localStorage.removeItem(
            "jbk_pending_action_type"
          );

          localStorage.removeItem(
            "jbk_pending_action_data"
          );

          /**
           * First check current status.
           */
          const alreadyFollowing =
            await isFollowing(
              currentUser.uid,
              targetUid
            );

          if (!alreadyFollowing) {
            try {
              const userDoc = await getDoc(
                doc(
                  db,
                  "users",
                  currentUser.uid
                )
              );

              const userData = userDoc.exists()
                ? userDoc.data()
                : {};

              const followerName =
                userData?.displayName ||
                userData?.name ||
                userData?.username ||
                "Someone";

              await followUser(
                currentUser.uid,
                targetUid,
                followerName
              );

              if (!cancelled) {
                setFollowing(true);
              }
            } catch (error: any) {
              console.error(
                "PENDING FOLLOW ERROR:",
                error
              );

              if (!cancelled) {
                setErrorMessage(
                  error?.code
                    ? `${error.code}: ${
                        error?.message || "Follow failed."
                      }`
                    : error?.message ||
                      "Follow failed."
                );
              }
            }
          } else {
            if (!cancelled) {
              setFollowing(true);
            }
          }

          if (!cancelled) {
            setLoading(false);
          }

          return;
        }

        /**
         * Normal follow status check.
         */
        const status = await isFollowing(
          currentUser.uid,
          targetUid
        );

        if (!cancelled) {
          setFollowing(status);
        }
      } catch (error: any) {
        console.error(
          "FOLLOW INITIALIZATION ERROR:",
          error
        );

        if (!cancelled) {
          setFollowing(false);

          setErrorMessage(
            error?.code
              ? `${error.code}: ${
                  error?.message ||
                  "Failed to load follow status."
                }`
              : error?.message ||
                "Failed to load follow status."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      cancelled = true;
    };
  }, [targetUid]);

  /**
   * Don't show Follow button for own profile.
   */
  if (
    auth.currentUser?.uid === targetUid
  ) {
    return null;
  }

  /**
   * Loading state.
   */
  if (loading) {
    return (
      <button
        type="button"
        disabled
        className="px-4 py-2 rounded-full bg-gray-200 text-gray-500 font-black text-sm"
      >
        Loading...
      </button>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1 pointer-events-auto">
      <button
        type="button"
        disabled={loading}
        onClick={() =>
          requireAuth(
            () => handleToggleFollow(),
            "follow",
            targetUid
          )
        }
        className={`px-4 py-2 rounded-full font-black text-sm transition-all active:scale-95 ${
          following
            ? "bg-gray-200 text-black"
            : "bg-[var(--color-primary-button)] text-[var(--button-text-color)]"
        }`}
      >
        {following ? "Following" : "Follow"}
      </button>

      {errorMessage && (
        <span className="max-w-[220px] text-[10px] leading-tight text-red-300">
          {errorMessage}
        </span>
      )}
    </div>
  );
}
