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
    <section className="w-full overflow-hidden px-3 py-3 md:px-6">

      <div className="relative overflow-hidden rounded-[35px] shadow-2xl">

        {/* SLIDES */}

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
                    className="relative flex min-h-[300px] flex-col justify-center overflow-hidden px-6 py-10 md:min-h-[500px] md:px-16"
                    style={{
                      background: `linear-gradient(135deg, ${
                        slide.backgroundColor ||
                        "#7c3aed"
                      }, ${
                        slide.gradientColor ||
                        "#ec4899"
                      })`
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
                          className="object-cover opacity-30"
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
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      )}

                    {/* DARK OVERLAY */}

                    <div className="absolute inset-0 bg-black/30" />

                    {/* CONTENT */}

                    <div className="relative z-10">

                      {/* TITLE */}

                      <h2
                        className="max-w-3xl text-4xl font-black leading-tight md:text-7xl"
                        style={{
                          color:
                            slide.textColor ||
                            "#ffffff"
                        }}
                      >
                        {slide.title}
                      </h2>

                      {/* SUBTITLE */}

                      <p
                        className="mt-4 max-w-2xl text-base font-medium md:text-2xl"
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

                      <div className="mt-7">

                        <Link
                          href={
                            slide.buttonLink ||
                            "/"
                          }
                        >

                          <button
                            className="rounded-2xl px-8 py-4 text-sm font-black shadow-2xl transition-all duration-300 hover:scale-105 md:px-12 md:py-5 md:text-lg"
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
          className="absolute left-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-2xl font-black text-white backdrop-blur-md"
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
          className="absolute right-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-2xl font-black text-white backdrop-blur-md"
        >
          →
        </button>

        {/* DOTS */}

        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">

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
                  className={`h-3 rounded-full transition-all duration-300 ${
                    current ===
                    index
                      ? "w-8 bg-white"
                      : "w-3 bg-white/50"
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
