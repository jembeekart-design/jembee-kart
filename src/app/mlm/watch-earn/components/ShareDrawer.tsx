"use client";

import {
  BadgeHelp,
  Send,
  MessageCircle,
  Link2,
  Copy
} from "lucide-react";

interface ShareDrawerProps {

  open: boolean;

  onClose: () => void;

  videoId: string;

}

export default function
ShareDrawer({
  open,
  onClose,
  videoId
}: ShareDrawerProps) {

  const shareLink =
    `https://jembeekart.com/watch/${videoId}`;

  async function
  copyLink() {

    try {

      await navigator
        .clipboard
        .writeText(
          shareLink
        );

      alert(
        "Link copied"
      );

    } catch (error) {

      console.error(error);
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
            text-white
          "
        >

          Share Video

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

      {/* SHARE OPTIONS */}

      <div
        className="
          grid
          grid-cols-4
          gap-5
          px-5
          py-8
        "
      >

        {/* WHATSAPP */}

        <button
          className="
            flex
            flex-col
            items-center
            gap-3
          "
        >

          <div
            className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              bg-green-500/20
            "
          >

            <MessageCircle
              size={28}
              className="
                text-green-400
              "
            />

          </div>

          <span
            className="
              text-xs
              font-bold
              text-white
            "
          >

            WhatsApp

          </span>

        </button>

        {/* TELEGRAM */}

        <button
          className="
            flex
            flex-col
            items-center
            gap-3
          "
        >

          <div
            className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              bg-sky-500/20
            "
          >

            <Send
              size={28}
              className="
                text-sky-400
              "
            />

          </div>

          <span
            className="
              text-xs
              font-bold
              text-white
            "
          >

            Telegram

          </span>

        </button>

        {/* FACEBOOK */}

        <button
          className="
            flex
            flex-col
            items-center
            gap-3
          "
        >

          <div
            className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              theme-primary-bg/20
            "
          >

            <BadgeHelp
              size={28}
              className="
                theme-primary-text
              "
            />

          </div>

          <span
            className="
              text-xs
              font-bold
              text-white
            "
          >

            Facebook

          </span>

        </button>

        {/* COPY */}

        <button
          onClick={copyLink}
          className="
            flex
            flex-col
            items-center
            gap-3
          "
        >

          <div
            className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              bg-yellow-500/20
            "
          >

            <Copy
              size={28}
              className="
                text-yellow-300
              "
            />

          </div>

          <span
            className="
              text-xs
              font-bold
              text-white
            "
          >

            Copy

          </span>

        </button>

      </div>

      {/* LINK BOX */}

      <div
        className="
          px-5
          pb-8
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-white/10
            bg-white/5
            px-4
            py-4
          "
        >

          <Link2
            size={18}
            className="
              text-gray-400
            "
          />

          <p
            className="
              flex-1
              truncate
              text-sm
              text-gray-300
            "
          >

            {shareLink}

          </p>

        </div>

      </div>

    </div>
  );
}
