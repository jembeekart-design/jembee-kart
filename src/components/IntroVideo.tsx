"use client";

import { useEffect, useState } from "react";

export default function IntroVideo() {

  const [showIntro, setShowIntro] =
    useState(true);

  useEffect(() => {

    const watched =
      localStorage.getItem(
        "jembee_intro_seen"
      );

    if (watched === "true") {
      setShowIntro(false);
    }

  }, []);

  const skipIntro = () => {

    localStorage.setItem(
      "jembee_intro_seen",
      "true"
    );

    setShowIntro(false);
  };

  if (!showIntro) return null;

  return (

    <div
      className="
        fixed
        inset-0
        z-[9999]
        bg-black
      "
    >

      <button
        onClick={skipIntro}
        className="
          absolute
          right-4
          top-4
          z-50
          rounded-full
          bg-[var(--card-color)]/20
          px-4
          py-2
          text-sm
          text-[var(--button-text-color)]
          backdrop-blur
        "
      >

        Skip

      </button>

      <video
        autoPlay
        muted
        playsInline
        className="
          h-full
          w-full
          object-cover
        "
        onEnded={skipIntro}
      >

        <source
          src="/intro.mp4"
          type="video/mp4"
        />

      </video>

    </div>
  );
}
