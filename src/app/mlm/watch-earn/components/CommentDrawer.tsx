"use client";

import { useState, useEffect, useRef } from "react";
import { useAdminConfig } from "@/lib/admin-config/provider";
import { getComments, addComment, ChatComment } from "@/firestore/services/socialService";
import { likeVideoComment, unlikeVideoComment } from "@/lib/mlm/watch-earn/likeVideoComment";
import { auth } from "@/firebase/config";
import {
  Send,
  Heart
} from "lucide-react";

interface CommentDrawerProps {
  open: boolean;
  onClose: () => void;
  videoId: string;
  onCommentAdded?: () => void; // NEW optional callback
}

export default function CommentDrawer({ open, onClose, videoId, onCommentAdded }: CommentDrawerProps) {
  const { config } = useAdminConfig();
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState("");
  const [comments, setComments] = useState<ChatComment[]>([]);

  useEffect(() => {
    if (!open) return;
    
    let unsub: any;
    async function loadComments() {
      unsub = await getComments(videoId, auth.currentUser?.uid || "", (data: ChatComment[]) => {
        setComments(data.map(comment => {
          const optimistic = optimisticLikesRef.current.get(comment.id);
          return optimistic
            ? { ...comment, likes: optimistic.likes, likedByCurrentUser: optimistic.liked }
            : comment;
        }));
      });
    }
    loadComments();
    return () => unsub && unsub();
  }, [open, videoId]);

  const [likingComments, setLikingComments] = useState<Set<string>>(new Set());
  const likingCommentsRef = useRef<Set<string>>(new Set());
  const optimisticLikesRef = useRef<Map<string, { likes: number; liked: boolean }>>(new Map());

  async function handleToggleLike(commentId: string, currentlyLiked: boolean | undefined) {
    const user = auth.currentUser;
    if (!user || likingCommentsRef.current.has(commentId)) return;

    likingCommentsRef.current.add(commentId);
    setLikingComments(previous => new Set(previous).add(commentId));

    const wasLiked = Boolean(currentlyLiked);
    const currentComment = comments.find(comment => comment.id === commentId);
    const previousLikes = Math.max(0, currentComment?.likes || 0);
    const delta = wasLiked ? -1 : 1;
    const optimistic = {
      likes: Math.max(0, previousLikes + delta),
      liked: !wasLiked,
    };

    optimisticLikesRef.current.set(commentId, optimistic);

    setComments(previous => previous.map(comment =>
      comment.id === commentId
        ? { ...comment, likes: optimistic.likes, likedByCurrentUser: optimistic.liked }
        : comment
    ));

    try {
      const result = wasLiked
        ? await unlikeVideoComment({ commentId, userId: user.uid })
        : await likeVideoComment({ commentId, userId: user.uid });

      if (!result.success) {
        optimisticLikesRef.current.delete(commentId);
        setComments(previous => previous.map(comment =>
          comment.id === commentId
            ? { ...comment, likes: previousLikes, likedByCurrentUser: wasLiked }
            : comment
        ));
        setError(result.message || "Unable to update like.");
      } else {
        setError("");
        optimisticLikesRef.current.delete(commentId);
      }
    } catch {
      optimisticLikesRef.current.delete(commentId);
      setComments(previous => previous.map(comment =>
        comment.id === commentId
          ? { ...comment, likes: previousLikes, likedByCurrentUser: wasLiked }
          : comment
      ));
      setError("Unable to update like.");
    } finally {
      likingCommentsRef.current.delete(commentId);
      setLikingComments(previous => {
        const next = new Set(previous);
        next.delete(commentId);
        return next;
      });
    }
  }

  async function handleAddComment() {
    if (!commentText.trim() || !auth.currentUser) return;
    
    try {
      const commentRef = await addComment(
        videoId, 
        auth.currentUser.uid, 
        auth.currentUser.displayName || "User", 
        commentText
      );

      // Trigger notification in the background
      (async () => {
        try {
          const token = await auth.currentUser?.getIdToken();
          if (token) {
            await fetch("/api/shorts/notifications/create-comment", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                videoId,
                commentId: commentRef.id,
              }),
            });
          }
        } catch (err) {
          console.error("Failed to send comment notification:", err);
        }
      })();

      // Notify parent to update its local aggregated comment count
      onCommentAdded?.();

      setCommentText("");
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to add comment.");
    }
  }

  return (
    <div
      className={`
        fixed
        bottom-0
        left-0
        right-0
        z-[999]
        rounded-t-[35px]
        bg-gray-950/80
        backdrop-blur-md
        transition-all

        ${
          open
            ? "translate-y-0"
            : "translate-y-full"
        }
      `}
    >

      {/* TOP */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-[var(--color-border)]/10
          px-5
          py-4
        "
      >

        <h2
          className="
            text-lg
            font-black
            text-[var(--button-text-color)]
          "
        >

          Comments

        </h2>

        <button
          onClick={onClose}
          className="
            text-2xl
            text-[var(--button-text-color)]
          "
        >

          ×

        </button>

      </div>

      {/* COMMENTS */}

      <div
        className="
          h-[400px]
          overflow-y-auto
          px-5
          py-4
        "
      >

        <div
          className="
            space-y-5
          "
        >

          {comments.map(
            (item) => (

              <div
                key={item.id}
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >

                <div>

                  <h3
                    className="
                      text-sm
                      font-black
                      text-[var(--button-text-color)]
                    "
                  >

                    @{item.userName}

                  </h3>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-white
                    "
                  >

                    {item.text}

                  </p>

                </div>

                <button
                  onClick={() => handleToggleLike(item.id, item.likedByCurrentUser)}
                  className={`
                    flex
                    flex-col
                    items-center
                    gap-1
                    ${item.likedByCurrentUser ? 'text-red-500' : 'text-white'}
                  `}
                >

                  <Heart
                    size={18}
                    fill={item.likedByCurrentUser ? 'currentColor' : 'none'}
                  />

                  <span
                    className="
                      text-xs
                      text-white
                    "
                  >

                    {item.likes || 0}
                  </span>

                </button>

              </div>
            )
          )}

        </div>

      </div>

      {/* INPUT */}

      <div
        className="
          flex
          items-center
          gap-3
          border-t
          border-[var(--color-border)]/10
          px-4
          py-4
        "
      >

        <input
          value={commentText}

          onChange={(e) => {
            setCommentText(e.target.value);
            if (error) setError(""); // Clear error when user starts typing again
          }}

          placeholder="Write comment..."

          className="
            flex-1
            rounded-full
            border
            border-[var(--color-border)]/10
            bg-[var(--color-card-background)]/5
            px-5
            py-3
            text-sm
            text-[var(--button-text-color)]
            outline-none
          "
        />

        <button
          onClick={handleAddComment}
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            bg-gradient-to-r
            from-[var(--color-primary-button)]
            to-[var(--color-primary-button)]
            text-[var(--button-text-color)]
          "
        >

          <Send size={18} />

        </button>

      </div>
      {error && <p className="text-red-500 text-xs px-5 pb-3">{error}</p>}

    </div>
  );
}
