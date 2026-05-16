"use client";

import { useState } from "react";

import {
  doc,
  setDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

export default function AdminPage() {
  const [loading, setLoading] =
    useState(false);

  async function createHomepageSections() {
    try {
      setLoading(true);

      await setDoc(
        doc(
          db,
          "homepage_sections",
          "hero_section"
        ),
        {
          sectionType: "hero",

          visible: true,

          position: 1,

          title:
            "Build Your Ecommerce Empire",

          subtitle:
            "AI Powered Ecommerce Ecosystem",

          buttonText:
            "Start Shopping",

          secondaryButtonText:
            "Become Seller"
        }
      );

      await setDoc(
        doc(
          db,
          "homepage_sections",
          "category_section"
        ),
        {
          sectionType: "category",

          visible: true,

          position: 2
        }
      );

      await setDoc(
        doc(
          db,
          "homepage_sections",
          "product_section"
        ),
        {
          sectionType: "product",

          visible: true,

          position: 3
        }
      );

      await setDoc(
        doc(
          db,
          "homepage_sections",
          "affiliate_section"
        ),
        {
          sectionType: "affiliate",

          visible: true,

          position: 4,

          title:
            "Earn With Affiliate Marketing",

          description:
            "Grow your affiliate income daily.",

          buttonText:
            "Join Affiliate"
        }
      );

      await setDoc(
        doc(
          db,
          "homepage_sections",
          "seller_section"
        ),
        {
          sectionType: "seller",

          visible: true,

          position: 5
        }
      );

      await setDoc(
        doc(
          db,
          "homepage_sections",
          "tips_section"
        ),
        {
          sectionType: "tips",

          visible: true,

          position: 6
        }
      );

      await setDoc(
        doc(
          db,
          "homepage_sections",
          "footer_section"
        ),
        {
          sectionType: "footer",

          visible: true,

          position: 7
        }
      );

      alert(
        "Homepage Firestore data created successfully"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Error creating homepage data"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">

      <div className="mx-auto max-w-4xl rounded-[30px] bg-white p-8 shadow-2xl">

        <h1 className="text-4xl font-black text-blue-600">
          JembeeKart Admin Panel
        </h1>

        <p className="mt-4 text-gray-500">
          Create Firestore homepage sections automatically.
        </p>

        <button
          onClick={
            createHomepageSections
          }
          disabled={loading}
          className="mt-8 rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white transition-all duration-300 hover:bg-blue-700"
        >
          {loading
            ? "Creating..."
            : "Create Homepage Firestore Data"}
        </button>

      </div>

    </main>
  );
}
