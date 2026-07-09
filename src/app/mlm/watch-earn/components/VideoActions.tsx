"use client";

import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Coins
} from "lucide-react";

interface VideoActionsProps {

  likes: number;

  comments: number;

  shares: number;

  coins: number;

  onLike: () => void;

  onComment: () => void;

  onShare: () => void;

}

export default function
VideoActions({
  likes,
  comments,
  shares,
  coins,
  onLike,
  onComment,
  onShare
}: VideoActionsProps) {

  return (

    <div
      className="
        absolute
        bottom-24
        right-3
        z-40
        flex
        flex-col
        items-center
        gap-5
      "
    >

      {/* LIKE */}

      <button
        onClick={onLike}
        className="
          flex
          flex-col
          items-center
          gap-1
        "
      >

        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-[var(--card-color)]/40
            text-[var(--button-text-color)]
            backdrop-blur-xl
          "
        >

          <Heart size={28} />

        </div>

        <span
          className="
            text-xs
            font-bold
            text-[var(--button-text-color)]
          "
        >

          {likes}

        </span>

      </button>

      {/* COMMENT */}

      <button
        onClick={onComment}
        className="
          flex
          flex-col
          items-center
          gap-1
        "
      >

        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-[var(--card-color)]/40
            text-[var(--button-text-color)]
            backdrop-blur-xl
          "
        >

          <MessageCircle
            size={28}
          />

        </div>

        <span
          className="
            text-xs
            font-bold
            text-[var(--button-text-color)]
          "
        >

          {comments}

        </span>

      </button>

      {/* SHARE */}

      <button
        onClick={onShare}
        className="
          flex
          flex-col
          items-center
          gap-1
        "
      >

        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-[var(--card-color)]/40
            text-[var(--button-text-color)]
            backdrop-blur-xl
          "
        >

          <Share2 size={28} />

        </div>

        <span
          className="
            text-xs
            font-bold
            text-[var(--button-text-color)]
          "
        >

          {shares}

        </span>

      </button>

      {/* SAVE */}

      <button
        className="
          flex
          flex-col
          items-center
          gap-1
        "
      >

        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-[var(--card-color)]/40
            text-[var(--button-text-color)]
            backdrop-blur-xl
          "
        >

          <Bookmark
            size={26}
          />

        </div>

        <span
          className="
            text-xs
            font-bold
            text-[var(--button-text-color)]
          "
        >

          Save

        </span>

      </button>

      {/* COINS */}

      <div
        className="
          flex
          items-center
          gap-2
          rounded-full
          border
          border-yellow-300/40
          bg-yellow-400/20
          px-4
          py-2
          backdrop-blur-xl
        "
      >

        <Coins
          size={18}
          className="
            text-yellow-300
          "
        />

        <span
          className="
            text-sm
            font-black
            text-[var(--button-text-color)]
          "
        >

          +{coins}

        </span>

      </div>

    </div>
  );
}
