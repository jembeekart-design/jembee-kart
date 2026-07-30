"use client";

import { useState, useEffect } from "react";
import { useAdminConfig } from "@/lib/admin-config/provider";
import { getComments, addComment, ChatComment } from "@/firestore/services/socialService";
import { auth } from "@/firebase/config";
import {
  Send,
  Heart
} from "lucide-react";

interface CommentDrawerProps {
  open: boolean;
  onClose: () => void;
  videoId: string;
}

export default function CommentDrawer({ open, onClose, videoId }: CommentDrawerProps) {
  const { config } = useAdminConfig();
  const { commentModeration } = config;
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState("");
  const [comments, setComments] = useState<ChatComment[]>([]);

  useEffect(() => {
    if (!open) return;
    
    let unsub: any;
    async function loadComments() {
      unsub = await getComments(videoId, (data) => setComments(data as ChatComment[]));
    }
    loadComments();
    return () => unsub && unsub();
  }, [open, videoId]);

  async function handleAddComment() {
    if (!commentText.trim() || !auth.currentUser) return;
    
    try {
      await addComment(
        videoId, 
        auth.currentUser.uid, 
        auth.currentUser.displayName || "User", 
        commentText, 
        commentModeration
      );
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
        bg-[var(--primary-color)]
        transition-all
        duration-300

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
          border-[var(--border-color)]/10
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
                      text-[var(--text-color)]
                    "
                  >

                    {item.text}

                  </p>

                </div>

                <button
                  className="
                    flex
                    flex-col
                    items-center
                    gap-1
                    text-[var(--text-color)]
                  "
                >

                  <Heart
                    size={18}
                  />

                  <span
                    className="
                      text-xs
                    "
                  >

                    0
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
          border-[var(--border-color)]/10
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
            border-[var(--border-color)]/10
            bg-[var(--card-color)]/5
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
            from-[var(--primary-color)]
            to-[var(--primary-color)]
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
