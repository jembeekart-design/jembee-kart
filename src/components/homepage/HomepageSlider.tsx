"use client";

import {
  useEffect,
  useState
} from "react";

import Link from "next/link";

import Image from "next/image";

import {
  collection,
  onSnapshot
} from "firebase/firestore";

import { db } from "@/firebase/config";

/* ======================================================
TYPES
====================================================== */

interface Slide {
  id: string;

  title?: string;

  subtitle?: string;

  buttonText?: string;

  buttonLink?: string;

  backgroundColor?: string;

  gradientColor?: string;

  textColor?: string;

  buttonColor?: string;

  buttonTextColor?: string;

  imageUrl?: string;

  videoUrl?: string;

  mediaType?: string;

  visible?: boolean;

  position?: number;
}

/* ======================================================
COMPONENT
====================================================== */

export default function HomepageSlider() {
  const [slides, setSlides] =
    useState<Slide[]>([]);

  const [current, setCurrent] =
    useState(0);

  /* ======================================================
  GET SLIDES
  ====================================================== */

  useEffect(() => {
    const unsubscribe =
      onSnapshot(
        collection(
          db,
          "homepage_banners"
        ),
        (snapshot) => {
          const data =
            snapshot.docs.map(
              (document) => {
                return {
                  id: document.id,

                  ...(document.data() as Omit<
                    Slide,
                    "id"
                  >)
                };
              }
            );

          const filtered =
            data
              .filter(
                (slide) =>
                  slide.visible
              )
              .sort(
                (a, b) => {
                  return (
                    Number(
                      a.position || 0
                    ) -
                    Number(
                      b.position || 0
                    )
                  );
                }
              );

          setSlides(filtered);
        }
      );

    return () => unsubscribe();
  }, []);

  /* ======================================================
  AUTO SLIDE
  ====================================================== */

  useEffect(() => {
    if (
      slides.length <= 1
    ) {
      return;
    }

    const interval =
      setInterval(() => {
        setCurrent(
          (previous) => {
            return (
              (previous + 1) %
              slides.length
            );
          }
        );
      }, 5000);

    return () =>
      clearInterval(interval);
  }, [slides]);

  /* ======================================================
  EMPTY
  ====================================================== */

  if (
    slides.length === 0
  ) {
    return null;
  }

  /* ======================================================
  UI
  ====================================================== */

  return (
    <section className="w-full overflow-hidden">

      <div className="relative w-full overflow-hidden shadow-xl">

        {/* SLIDER */}

        <div
          className="flex transition-all duration-700"
          style={{
            transform: `translateX(-${current * 100}%)`
          }}
        >

          {slides.map(
            (slide) => {
              return (
                <div
                  key={slide.id}
                  className="min-w-full"
                >

                  <div
                    className="
                      relative
                      flex
                      min-h-[170px]
                      w-full
                      items-center
                      overflow-hidden
                      px-4
                      py-4

                      md:min-h-[320px]
                      md:px-12
                    "
                    style={{
                      background: `linear-gradient(
                        135deg,
                        ${
                          slide.backgroundColor ||
                          "#2563eb"
                        },
                        ${
                          slide.gradientColor ||
                          "#7c3aed"
                        }
                      )`
                    }}
                  >

                    {/* IMAGE */}

                    {slide.mediaType ===
                      "image" &&
                      slide.imageUrl && (
                        <Image
                          src={
                            slide.imageUrl
                          }
                          alt={
                            slide.title ||
                            "Banner"
                          }
                          fill
                          priority
                          className="
                            object-contain
                            object-right-bottom
                            opacity-100
                          "
                        />
                      )}

                    {/* VIDEO */}

                    {slide.mediaType ===
                      "video" &&
                      slide.videoUrl && (
                        <video
                          src={
                            slide.videoUrl
                          }
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="
                            absolute
                            inset-0
                            h-full
                            w-full
                            object-cover
                          "
                        />
                      )}

                    {/* OVERLAY */}

                    <div className="absolute inset-0 bg-black/10" />

                    {/* CONTENT */}

                    <div className="relative z-10 flex w-full items-center">

                      {/* LEFT */}

                      <div className="max-w-[52%]">

                        {/* TITLE */}

                        <h2
                          className="
                            text-[24px]
                            font-black
                            leading-[1.05]

                            md:text-6xl
                          "
                          style={{
                            color:
                              slide.textColor ||
                              "#ffffff"
                          }}
                        >
                          {
                            slide.title
                          }
                        </h2>

                        {/* SUBTITLE */}

                        <p
                          className="
                            mt-2
                            text-[12px]
                            font-medium
                            leading-5

                            md:text-2xl
                          "
                          style={{
                            color:
                              slide.textColor ||
                              "#ffffff"
                          }}
                        >
                          {
                            slide.subtitle
                          }
                        </p>

                        {/* BUTTON */}

                        <div className="mt-4">

                          <Link
                            href={
                              slide.buttonLink ||
                              "/"
                            }
                          >

                            <button
                              className="
                                rounded-xl
                                px-4
                                py-2
                                text-[11px]
                                font-black
                                shadow-xl
                                transition-all
                                duration-300
                                hover:scale-105

                                md:px-10
                                md:py-4
                                md:text-lg
                              "
                              style={{
                                backgroundColor:
                                  slide.buttonColor ||
                                  "#ffffff",

                                color:
                                  slide.buttonTextColor ||
                                  "#000000"
                              }}
                            >
                              {
                                slide.buttonText
                              }
                            </button>

                          </Link>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>
              );
            }
          )}

        </div>

        {/* LEFT BUTTON */}

        <button
          onClick={() => {
            setCurrent(
              (previous) => {
                return previous === 0
                  ? slides.length - 1
                  : previous - 1;
              }
            );
          }}
          className="
            absolute
            left-2
            top-1/2
            z-20
            flex
            h-8
            w-8
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            bg-white/20
            text-sm
            font-black
            text-white
            backdrop-blur-md

            md:h-11
            md:w-11
            md:text-xl
          "
        >
          ←
        </button>

        {/* RIGHT BUTTON */}

        <button
          onClick={() => {
            setCurrent(
              (previous) => {
                return (
                  (previous + 1) %
                  slides.length
                );
              }
            );
          }}
          className="
            absolute
            right-2
            top-1/2
            z-20
            flex
            h-8
            w-8
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            bg-white/20
            text-sm
            font-black
            text-white
            backdrop-blur-md

            md:h-11
            md:w-11
            md:text-xl
          "
        >
          →
        </button>

        {/* DOTS */}

        <div
          className="
            absolute
            bottom-3
            left-1/2
            z-20
            flex
            -translate-x-1/2
            gap-2
          "
        >

          {slides.map(
            (
              _slide,
              index
            ) => {
              return (
                <button
                  key={index}
                  onClick={() => {
                    setCurrent(
                      index
                    );
                  }}
                  className={`rounded-full transition-all duration-300 ${
                    current ===
                    index
                      ? "h-2 w-6 bg-white"
                      : "h-2 w-2 bg-white/50"
                  }`}
                />
              );
            }
          )}

        </div>

      </div>

    </section>
  );
}
