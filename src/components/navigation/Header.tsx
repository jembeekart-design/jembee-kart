"use client";

import { useState } from "react";

import {
  Mic,
  MicOff,
  Search
} from "lucide-react";

interface HeaderProps {

  headerBackgroundColor?: string;

  headerTextColor?: string;

  searchBarColor?: string;

  statusBarColor?: string;
}

export default function Header({

  headerBackgroundColor = "#ffffff",

  headerTextColor = "#2563eb",

  searchBarColor = "#f3f4f6",

  statusBarColor = "#ffffff"

}: HeaderProps) {

  /* ======================================================
  STATES
  ====================================================== */

  const [
    search,
    setSearch
  ] = useState("");

  const [
    listening,
    setListening
  ] = useState(false);

  /* ======================================================
  STATUS BAR COLOR
  ====================================================== */

  if (
    typeof document !==
    "undefined"
  ) {

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
  }

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
        "Voice search not supported"
      );

      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang =
      "en-IN";

    recognition.interimResults =
      false;

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

        setSearch(
          transcript
        );
      };

    recognition.onerror =
      () => {

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
        border-gray-200
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

          {/* LOGO */}

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
                text-gray-500

                md:text-sm
              "
            >

              AI Ecommerce Ecosystem

            </p>

          </div>

          {/* BUTTONS */}

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
                bg-gray-100
                px-4
                py-2
                text-sm
                font-semibold
                text-gray-700
                transition-all
                duration-300

                hover:bg-gray-200
              "
            >

              Login

            </button>

            <button
              className="
                rounded-xl
                bg-blue-600
                px-4
                py-2
                text-sm
                font-semibold
                text-white
                transition-all
                duration-300

                hover:bg-blue-700
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
            mt-3
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
              text-gray-400
            "
          />

          {/* INPUT */}

          <input
            type="text"

            value={search}

            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }

            placeholder="
              Search products...
            "

            className="
              w-full
              rounded-2xl
              border
              border-gray-200
              py-3
              pl-12
              pr-16
              text-sm
              font-medium
              outline-none
              transition-all
              duration-300

              focus:border-blue-500
              focus:bg-white

              md:text-base
            "

            style={{
              backgroundColor:
                searchBarColor
            }}
          />

          {/* VOICE BUTTON */}

          <button

            onClick={
              startVoiceSearch
            }

            className={`
              absolute
              right-3
              top-1/2

              flex
              h-10
              w-10
              -translate-y-1/2
              items-center
              justify-center

              rounded-full

              shadow-md

              transition-all
              duration-300

              hover:scale-105

              ${
                listening

                  ? "bg-red-500 text-white"

                  : "bg-blue-600 text-white"
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
