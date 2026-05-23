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

import {
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import {
  useSwipeable
} from "react-swipeable";

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

  badge?: string;

}

/* ======================================================
COMPONENT
====================================================== */

export default function HomepageSlider() {

  const [slides, setSlides] =
    useState<Slide[]>([]);

  const [current, setCurrent] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [paused, setPaused] =
    useState(false);

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

                  id:
                    document.id,

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

          setLoading(false);

        }
      );

    return () =>
      unsubscribe();

  }, []);

  /* ======================================================
  AUTO SLIDE
  ====================================================== */

  useEffect(() => {

    if (
      slides.length <= 1 ||
      paused
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
      clearInterval(
        interval
      );

  }, [slides, paused]);

  /* ======================================================
  FUNCTIONS
  ====================================================== */

  function nextSlide() {

    setCurrent(
      (previous) => {

        return (
          (previous + 1) %
          slides.length
        );

      }
    );

  }

  function previousSlide() {

    setCurrent(
      (previous) => {

        return previous === 0
          ? slides.length - 1
          : previous - 1;

      }
    );

  }

  /* ======================================================
  SWIPE
  ====================================================== */

  const swipeHandlers =
    useSwipeable({

      onSwipedLeft() {
        nextSlide();
      },

      onSwipedRight() {
        previousSlide();
      },

      trackMouse: true

    });

  /* ======================================================
  LOADING
  ====================================================== */

  if (loading) {

    return (

      <div className="h-[170px] animate-pulse bg-gray-200 md:h-[320px]" />

    );

  }

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

    <section
      className="w-full overflow-hidden"
      onMouseEnter={() => {
        setPaused(true);
      }}
      onMouseLeave={() => {
        setPaused(false);
      }}
      {...swipeHandlers}
    >

      <div className="relative w-full overflow-hidden shadow-2xl">

        {/* SLIDER */}

        <div
          className="flex transition-all duration-700 ease-in-out"
          style={{
            transform: `translateX(-${current * 100}%)`
          }}
        >

          {slides.map(
            (
              slide,
              index
            ) => {

              return (

                <div
                  key={slide.id}
                  className="min-w-full"
                >

                  <div
                    className="
                      relative
                      flex
                      min-h-[190px]
                      w-full
                      items-center
                      overflow-hidden
                      px-4
                      py-5

                      md:min-h-[550px]
                      md:px-16
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
                          priority={
                            current ===
                            index
                          }
                          className="
                            object-cover
                            object-center

                            md:object-contain
                            md:object-right-bottom
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

                    <div className="absolute inset-0 bg-black/30" />

                    {/* CONTENT */}

                    <div className="relative z-10 flex w-full items-center">

                      <div className="max-w-[58%]">

                        {/* BADGE */}

                        {slide.badge && (

                          <div className="
                            mb-4
                            inline-flex
                            rounded-full
                            bg-white/20
                            px-4
                            py-2
                            text-[10px]
                            font-black
                            uppercase
                            tracking-widest
                            text-white
                            backdrop-blur-xl

                            md:text-sm
                          ">

                            {slide.badge}

                          </div>

                        )}

                        {/* TITLE */}

                        <h2
                          className="
                            text-[26px]
                            font-black
                            leading-[1.05]

                            md:text-7xl
                          "
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
                          className="
                            mt-3
                            text-[12px]
                            font-medium
                            leading-5

                            md:mt-6
                            md:text-2xl
                            md:leading-10
                          "
                          style={{
                            color:
                              slide.textColor ||
                              "#ffffff"
                          }}
                        >

                          {slide.subtitle}

                        </p>

                        {/* BUTTON */}

                        <div className="mt-5 md:mt-8">

                          <Link
                            href={
                              slide.buttonLink ||
                              "/"
                            }
                          >

                            <button
                              className="
                                rounded-2xl
                                px-5
                                py-3
                                text-[11px]
                                font-black
                                shadow-2xl
                                transition-all
                                duration-300
                                hover:scale-105

                                md:px-10
                                md:py-5
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

                              {slide.buttonText}

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
          onClick={
            previousSlide
          }
          className="
            absolute
            left-3
            top-1/2
            z-20
            flex
            h-10
            w-10
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            bg-white/20
            text-white
            backdrop-blur-xl
            transition-all
            duration-300
            hover:scale-110

            md:h-14
            md:w-14
          "
        >

          <ChevronLeft size={26} />

        </button>

        {/* RIGHT BUTTON */}

        <button
          onClick={
            nextSlide
          }
          className="
            absolute
            right-3
            top-1/2
            z-20
            flex
            h-10
            w-10
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            bg-white/20
            text-white
            backdrop-blur-xl
            transition-all
            duration-300
            hover:scale-110

            md:h-14
            md:w-14
          "
        >

          <ChevronRight size={26} />

        </button>

        {/* DOTS */}

        <div
          className="
            absolute
            bottom-4
            left-1/2
            z-20
            flex
            -translate-x-1/2
            gap-2

            md:bottom-8
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
                      ? "h-2 w-8 bg-white md:h-3 md:w-12"
                      : "h-2 w-2 bg-white/50 md:h-3 md:w-3"
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
