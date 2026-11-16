"use client";

import { useState, useEffect, useRef } from "react";
import { useAdminConfig } from "@/lib/admin-config/provider";
import { getComments, addComment, ChatComment } from "@/firestore/services/socialService";
import { likeVideoComment, unlikeVideoComment } from "@/lib/videos/watch-earn/likeVideoComment";
import { auth } from "@/firebase/config";
import type { Unsubscribe } from "firebase/firestore";
import {
  Send,
  Heart,
  MessageCircle
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
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState<Record<string, Array<{ id: string; userId: string; userName: string; reply: string; likes: number }>>>({});
  const [repliesLoading, setRepliesLoading] = useState<Set<string>>(new Set());
  const [replySending, setReplySending] = useState(false);

  useEffect(() => {
    if (!open) return;
    
    let unsub: Unsubscribe | undefined;
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

  async function loadReplies(commentId: string) {
    const user = auth.currentUser;
    if (!user) {
      setError("Please sign in to view replies.");
      return;
    }
    setRepliesLoading((previous) => new Set(previous).add(commentId));
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/shorts/comments/replies?commentId=${encodeURIComponent(commentId)}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success !== true || !Array.isArray(result.replies)) {
        throw new Error(result.message || "Unable to load replies.");
      }
      setReplies((previous) => ({ ...previous, [commentId]: result.replies }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load replies.");
    } finally {
      setRepliesLoading((previous) => {
        const next = new Set(previous);
        next.delete(commentId);
        return next;
      });
    }
  }

  async function handleSendReply(commentId: string) {
    const user = auth.currentUser;
    const text = replyText.trim();
    if (!user || !text || replySending) return;
    setReplySending(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/shorts/comments/replies", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId,
          reply: text,
          requestId: crypto.randomUUID(),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success !== true) {
        throw new Error(result.message || "Unable to send reply.");
      }
      setReplyText("");
      setReplyTarget(null);
      await loadReplies(commentId);
      setError(result.reply?.status === "pending" ? "Reply submitted for moderation." : "");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to send reply.");
    } finally {
      setReplySending(false);
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add comment.");
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
        max-h-[85dvh]
        overflow-y-auto
        pb-[env(safe-area-inset-bottom)]
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
            text-white
          "
        >

          Comments

        </h2>

        <button
          onClick={onClose}
          className="
            text-2xl
            text-white
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
                      text-white
                    "
                  >

                    @{item.userName}

                  </h3>

                  <p className="mt-1 text-sm text-white">{item.text}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const next = replyTarget === item.id ? null : item.id;
                        setReplyTarget(next);
                        if (next) void loadReplies(item.id);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-violet-300"
                    >
                      <MessageCircle size={14} /> Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => void loadReplies(item.id)}
                      className="text-xs text-slate-400"
                    >
                      {repliesLoading.has(item.id) ? "Loading…" : `View replies ${replies[item.id] ? `(${replies[item.id].length})` : ""}`}
                    </button>
                  </div>
                  {replyTarget === item.id && (
                    <div className="mt-3 flex gap-2">
                      <input
                        value={replyText}
                        maxLength={1000}
                        onChange={(event) => setReplyText(event.target.value)}
                        placeholder="Write a reply…"
                        className="min-w-0 flex-1 rounded-full bg-slate-800 px-3 py-2 text-xs text-white outline-none"
                      />
                      <button
                        type="button"
                        disabled={!replyText.trim() || replySending}
                        onClick={() => void handleSendReply(item.id)}
                        className="rounded-full bg-violet-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                      >
                        {replySending ? "Sending…" : "Send"}
                      </button>
                    </div>
                  )}
                  {(replies[item.id] || []).map((reply) => (
                    <div key={reply.id} className="ml-3 mt-3 border-l border-white/10 pl-3">
                      <p className="text-xs font-bold text-slate-200">@{reply.userName}</p>
                      <p className="mt-1 text-xs text-slate-300">{reply.reply}</p>
                    </div>
                  ))}
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
            bg-[#111827]
            px-5
            py-3
            text-sm
            text-white
            placeholder:text-gray-400
            caret-white
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
            text-white
          "
        >

          <Send size={18} />

        </button>

      </div>
      {error && <p className="text-red-500 text-xs px-5 pb-3">{error}</p>}

    </div>
  );
}
