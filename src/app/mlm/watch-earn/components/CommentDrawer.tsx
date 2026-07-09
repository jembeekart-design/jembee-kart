"use client";

import {
  useState
} from "react";

import {
  Send,
  Heart
} from "lucide-react";

interface CommentItem {

  id: string;

  username: string;

  comment: string;

  likes: number;

}

interface CommentDrawerProps {

  open: boolean;

  onClose: () => void;

}

export default function
CommentDrawer({
  open,
  onClose
}: CommentDrawerProps) {

  const [
    comment,
    setComment
  ] = useState("");

  const [
    comments,
    setComments
  ] = useState<
    CommentItem[]
  >([
    {
      id: "1",

      username:
        "Rahul",

      comment:
        "Amazing video 🔥",

      likes: 22
    },

    {
      id: "2",

      username:
        "Aman",

      comment:
        "Watch & earn is awesome",

      likes: 14
    }
  ]);

  function addComment() {

    if (!comment.trim()) {
      return;
    }

    setComments([
      {
        id:
          crypto.randomUUID(),

        username:
          "You",

        comment:
          comment,

        likes: 0
      },

      ...comments
    ]);

    setComment("");
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
        bg-[#121212]
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
          border-white/10
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

                    @{item.username}

                  </h3>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-gray-300
                    "
                  >

                    {item.comment}

                  </p>

                </div>

                <button
                  className="
                    flex
                    flex-col
                    items-center
                    gap-1
                    text-gray-300
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

                    {item.likes}

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
          border-white/10
          px-4
          py-4
        "
      >

        <input
          value={comment}

          onChange={(e) =>
            setComment(
              e.target.value
            )
          }

          placeholder="Write comment..."

          className="
            flex-1
            rounded-full
            border
            border-white/10
            bg-[var(--card-color)]/5
            px-5
            py-3
            text-sm
            text-[var(--button-text-color)]
            outline-none
          "
        />

        <button
          onClick={addComment}
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            bg-gradient-to-r
            from-violet-600
            to-fuchsia-500
            text-[var(--button-text-color)]
          "
        >

          <Send size={18} />

        </button>

      </div>

    </div>
  );
}
