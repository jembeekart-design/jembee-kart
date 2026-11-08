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
        bg-[var(--color-primary-button)]
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

          Share Video

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
              bg-[var(--color-success)]/20
            "
          >

            <MessageCircle
              size={28}
              className="
                text-[var(--color-success)]
              "
            />

          </div>

          <span
            className="
              text-xs
              font-bold
              text-[var(--button-text-color)]
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
              bg-[var(--color-primary-button)]/20
            "
          >

            <Send
              size={28}
              className="
                text-[var(--color-primary-button)]
              "
            />

          </div>

          <span
            className="
              text-xs
              font-bold
              text-[var(--button-text-color)]
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
              text-[var(--button-text-color)]
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
              bg-[var(--color-warning)]/20
            "
          >

            <Copy
              size={28}
              className="
                text-[var(--color-warning)]
              "
            />

          </div>

          <span
            className="
              text-xs
              font-bold
              text-[var(--button-text-color)]
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
            border-[var(--color-border)]/10
            bg-[var(--color-card-background)]/5
            px-4
            py-4
          "
        >

          <Link2
            size={18}
            className="
              text-[var(--text-secondary)]
            "
          />

          <p
            className="
              flex-1
              truncate
              text-sm
              text-[var(--text-primary)]
            "
          >

            {shareLink}

          </p>

        </div>

      </div>

    </div>
  );
}
