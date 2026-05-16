"use client";

import { useEffect, useState } from "react";

import {
  collection,
  getDocs
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface HomepageSection {
  sectionId: string;

  sectionTitle: string;

  sectionType: string;

  visible: boolean;

  position: number;

  sectionStyle: string;
}

export default function Homepage() {
  const [homepageSections, setHomepageSections] =
    useState<HomepageSection[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomepageSettings() {
      try {
        const firestoreCollection = collection(
          db,
          "admin_homepage_sections"
        );

        const firestoreSnapshot =
          await getDocs(firestoreCollection);

        const firestoreData: HomepageSection[] =
          firestoreSnapshot.docs.map((document) => {
            return document.data() as HomepageSection;
          });

        const sortedSections = firestoreData.sort(
          (a, b) => a.position - b.position
        );

        setHomepageSections(sortedSections);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadHomepageSettings();
  }, []);

  function renderHomepageSection(
    section: HomepageSection
  ) {
    if (!section.visible) {
      return null;
    }

    switch (section.sectionType) {
      case "banner_slider":
        return (
          <section
            className="w-full rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-10 text-white shadow-xl"
          >
            <h1 className="text-4xl font-bold">
              JembeeKart Hero Banner
            </h1>

            <p className="mt-4 text-lg">
              Dynamic admin controlled homepage banner.
            </p>
          </section>
        );

      case "category_grid":
        return (
          <section className="rounded-3xl bg-white p-6 shadow-lg">
            <h2 className="mb-6 text-2xl font-bold">
              {section.sectionTitle}
            </h2>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              {[
                "Fashion",
                "Electronics",
                "Beauty",
                "Shoes",
                "Mobiles",
                "Accessories"
              ].map((category) => {
                return (
                  <div
                    key={category}
                    className="rounded-2xl bg-gray-100 p-5 text-center font-semibold transition-all duration-300 hover:scale-105 hover:bg-blue-100"
                  >
                    {category}
                  </div>
                );
              })}
            </div>
          </section>
        );

      case "product_grid":
        return (
          <section className="rounded-3xl bg-white p-6 shadow-lg">
            <h2 className="mb-6 text-2xl font-bold">
              {section.sectionTitle}
            </h2>

            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 10 }).map(
                (_, index) => {
                  return (
                    <div
                      key={index}
                      className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                    >
                      <div className="h-48 bg-gray-200" />

                      <div className="p-4">
                        <h3 className="font-semibold">
                          Product {index + 1}
                        </h3>

                        <p className="mt-2 text-blue-600 font-bold">
                          ₹999
                        </p>

                        <button
                          className="mt-4 w-full rounded-2xl bg-blue-600 py-2 text-white transition-all duration-300 hover:bg-blue-700"
                        >
                          Add To Cart
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </section>
        );

      case "training_section":
        return (
          <section className="rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-white shadow-xl">
            <h2 className="text-3xl font-bold">
              Business Training Academy
            </h2>

            <p className="mt-3 max-w-3xl text-lg">
              Learn ecommerce, affiliate marketing,
              reselling and MLM growth.
            </p>

            <button
              className="mt-6 rounded-2xl bg-white px-6 py-3 font-semibold text-indigo-700 transition-all duration-300 hover:scale-105"
            >
              Start Learning
            </button>
          </section>
        );

      case "ai_tips_slider":
        return (
          <section className="rounded-3xl bg-black p-8 text-white shadow-xl">
            <h2 className="text-3xl font-bold">
              AI Business Tips
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {[
                "Use trending products",
                "Share products on WhatsApp",
                "Grow affiliate income daily"
              ].map((tip) => {
                return (
                  <div
                    key={tip}
                    className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl"
                  >
                    {tip}
                  </div>
                );
              })}
            </div>
          </section>
        );

      case "footer_section":
        return (
          <footer className="rounded-3xl bg-gray-900 p-10 text-white shadow-xl">
            <div className="grid gap-8 md:grid-cols-4">
              <div>
                <h2 className="text-2xl font-bold">
                  JembeeKart
                </h2>

                <p className="mt-3 text-gray-400">
                  AI Powered Ecommerce Ecosystem
                </p>
              </div>

              <div>
                <h3 className="font-semibold">
                  Quick Links
                </h3>

                <ul className="mt-4 space-y-2 text-gray-400">
                  <li>Home</li>
                  <li>Products</li>
                  <li>Affiliate</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold">
                  Business
                </h3>

                <ul className="mt-4 space-y-2 text-gray-400">
                  <li>Seller</li>
                  <li>Reseller</li>
                  <li>MLM</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold">
                  Support
                </h3>

                <ul className="mt-4 space-y-2 text-gray-400">
                  <li>Help Center</li>
                  <li>Policies</li>
                  <li>Contact</li>
                </ul>
              </div>
            </div>
          </footer>
        );

      default:
        return (
          <section className="rounded-3xl bg-white p-6 shadow-lg">
            <h2 className="text-2xl font-bold">
              {section.sectionTitle}
            </h2>
          </section>
        );
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-2xl font-bold">
          Loading JembeeKart...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">

        {homepageSections.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-xl">
            <h1 className="text-5xl font-bold text-blue-600">
              JembeeKart
            </h1>

            <p className="mt-4 text-lg text-gray-600">
              Firebase Connected Successfully
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <div className="rounded-3xl bg-blue-100 p-6">
                Fashion
              </div>

              <div className="rounded-3xl bg-indigo-100 p-6">
                Electronics
              </div>

              <div className="rounded-3xl bg-purple-100 p-6">
                Affiliate System
              </div>
            </div>
          </div>
        ) : (
          homepageSections.map((section) => {
            return (
              <div key={section.sectionId}>
                {renderHomepageSection(section)}
              </div>
            );
          })
        )}

      </div>
    </main>
  );
}
