/* ======================================================
FILE:
src/components/navigation/Header.tsx

FULLY WORKING HEADER

✅ Typing Search Working
✅ Voice Search Working
✅ Connected With page.tsx
✅ Premium UI
✅ Responsive
✅ Dynamic Theme Color
====================================================== */

"use client";

import {
  useEffect,
  useState
} from "react";

import {
  Mic,
  MicOff,
  Search
} from "lucide-react";

/* ======================================================
PROPS
====================================================== */

interface HeaderProps {

  headerBackgroundColor?: string;

  headerTextColor?: string;

  searchBarColor?: string;

  statusBarColor?: string;

  search?: string;

  setSearch?: (
    value: string
  ) => void;
}

/* ======================================================
COMPONENT
====================================================== */

export default function Header({

  headerBackgroundColor = "var(--primary-color)",

  headerTextColor = "var(--primary-color)",

  searchBarColor = "var(--primary-color)",

  statusBarColor = "var(--primary-color)",

  search = "",

  setSearch

}: HeaderProps) {

  /* ======================================================
  STATES
  ====================================================== */

  const [
    listening,
    setListening
  ] = useState(false);

  /* ======================================================
  STATUS BAR COLOR
  ====================================================== */

  useEffect(() => {

    let metaTheme =
      document.querySelector(
        'meta[name="theme-color"]'
      );

    if (!metaTheme) {

      metaTheme =
        document.createElement(
          "meta"
        );

      metaTheme.setAttribute(
        "name",
        "theme-color"
      );

      document.head.appendChild(
        metaTheme
      );
    }

    metaTheme.setAttribute(
      "content",
      statusBarColor
    );

  }, [
    statusBarColor
  ]);

  /* ======================================================
  VOICE SEARCH
  ====================================================== */

  function startVoiceSearch() {

    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const SpeechRecognition =
      (
        window as any
      ).SpeechRecognition ||

      (
        window as any
      ).webkitSpeechRecognition;

    if (
      !SpeechRecognition
    ) {

      alert(
        "Voice Search Not Supported"
      );

      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang =
      "en-IN";

    recognition.interimResults =
      false;

    recognition.maxAlternatives =
      1;

    recognition.start();

    setListening(
      true
    );

    recognition.onresult =
      (
        event: any
      ) => {

        const transcript =
          event.results[0][0]
            .transcript;

        setSearch?.(
          transcript
        );
      };

    recognition.onerror =
      (
        error: any
      ) => {

        console.log(
          error
        );

        setListening(
          false
        );
      };

    recognition.onend =
      () => {

        setListening(
          false
        );
      };
  }

  /* ======================================================
  UI
  ====================================================== */

  return (

    <header
      className="
        fixed
        left-0
        top-0
        z-50
        w-full
        border-b
        border-[var(--border-color)]
        backdrop-blur-xl
      "
      style={{
        backgroundColor:
          headerBackgroundColor
      }}
    >

      <div
        className="
          w-full
          px-3
          pb-3
          pt-[env(safe-area-inset-top)]

          md:px-6
        "
      >

        {/* ======================================================
        TOP HEADER
        ====================================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-3
          "
        >

          {/* ======================================================
          LOGO
          ====================================================== */}

          <div className="min-w-0">

            <h1
              className="
                truncate
                text-3xl
                font-black
                leading-none

                md:text-4xl
              "
              style={{
                color:
                  headerTextColor
              }}
            >

              JembeeKart

            </h1>

            <p
              className="
                mt-1
                text-xs
                text-[var(--muted-text-color)]

                md:text-sm
              "
            >

              AI Ecommerce Ecosystem

            </p>

          </div>

          {/* ======================================================
          BUTTONS
          ====================================================== */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-2
            "
          >

            <button
              className="
                rounded-xl
                bg-[var(--background-color)]
                px-4
                py-2
                text-sm
                font-semibold
                text-[var(--text-color)]

                transition-all
                duration-300

                hover:bg-[var(--card-color)]
              "
            >

              Login

            </button>

            <button
              className="
                rounded-xl
                theme-primary-bg
                px-4
                py-2
                text-sm
                font-semibold
                text-[var(--button-text-color)]

                transition-all
                duration-300

                hover:bg-[var(--primary-color)]
              "
            >

              Seller

            </button>

          </div>

        </div>

        {/* ======================================================
        SEARCH BAR
        ====================================================== */}

        <div
          className="
            relative
            mt-4
            w-full
          "
        >

          {/* SEARCH ICON */}

          <Search
            className="
              absolute
              left-4
              top-1/2
              h-5
              w-5
              -translate-y-1/2
              text-[var(--muted-text-color)]
            "
          />

          {/* ======================================================
          INPUT
          ====================================================== */}

          <input
            type="text"

            value={search}

            onChange={(e) =>
              setSearch?.(
                e.target.value
              )
            }

            placeholder="
              Search products...
            "

            className="
              w-full
              rounded-3xl
              border
              border-[var(--border-color)]

              py-4
              pl-12
              pr-16

              text-sm
              font-semibold

              text-[var(--text-color)]

              outline-none

              transition-all
              duration-300

              focus:theme-primary-border
              focus:bg-[var(--card-color)]
              focus:ring-4
              focus:ring-[var(--primary-color)]

              md:text-base
            "

            style={{
              backgroundColor:
                searchBarColor
            }}
          />

          {/* ======================================================
          VOICE BUTTON
          ====================================================== */}

          <button

            type="button"

            onClick={
              startVoiceSearch
            }

            className={`
              absolute
              right-3
              top-1/2

              flex
              h-11
              w-11
              -translate-y-1/2

              items-center
              justify-center

              rounded-full

              shadow-lg

              transition-all
              duration-300

              hover:scale-110
              active:scale-95

              ${
                listening

                  ? "bg-[var(--danger-color)] text-[var(--button-text-color)]"

                  : "bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] text-[var(--button-text-color)]"
              }
            `}
          >

            {listening ? (

              <MicOff
                className="
                  h-5
                  w-5
                "
              />

            ) : (

              <Mic
                className="
                  h-5
                  w-5
                "
              />

            )}

          </button>

        </div>

      </div>

    </header>

  );

}
