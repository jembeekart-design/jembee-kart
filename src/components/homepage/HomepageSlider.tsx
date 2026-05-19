"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  collection,
  onSnapshot
} from "firebase/firestore";

import { db } from "@/firebase/config";

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

  visible?: boolean;

  position?: number;
}

export default function HomepageSlider() {
  const [slides, setSlides] =
    useState<Slide[]>([]);

  const [current, setCurrent] =
    useState(0);

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

  /* AUTO SLIDE */

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
      }, 4000);

    return () =>
      clearInterval(interval);
  }, [slides]);

  if (
    slides.length === 0
  ) {
    return null;
  }

  return (
    <section className="w-full overflow-hidden px-3 py-3 md:px-6">

      <div className="relative overflow-hidden rounded-[32px] shadow-2xl">

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
                    className="flex min-h-[280px] flex-col justify-center px-6 py-10 md:min-h-[420px] md:px-16"
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
              );
            }
          )}

        </div>

        {/* DOTS */}

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">

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
