/* ======================================================
FILE:
src/app/category/page.tsx

FIXED:

✅ Proper Responsive Layout
✅ Header Fixed
✅ Bottom Navbar Working
✅ WhatsApp Floating Button
✅ No Overflow Issue
✅ Safe Padding
✅ Mobile Optimized
✅ Clean Structure
====================================================== */

"use client";

import DynamicCategorySection from "@/components/categories/DynamicCategorySection";

import Header from "@/components/navigation/Header";

import BottomNavbar from "@/components/navigation/BottomNavbar";

import WhatsAppButton from "@/components/navigation/WhatsAppButton";

/* ======================================================
COMPONENT
====================================================== */

export default function CategoriesPage() {

  return (

    <main
      className="
        min-h-screen
        w-full
        overflow-x-hidden
        bg-[#f6f7fb]

        pb-32

        pt-[115px]

        md:pt-[150px]
      "
    >

      {/* ======================================================
      HEADER
      ====================================================== */}

      <Header />

      {/* ======================================================
      PAGE WRAPPER
      ====================================================== */}

      <div
        className="
          w-full
          overflow-x-hidden
        "
      >

        {/* ======================================================
        TOP TITLE
        ====================================================== */}

        <section
          className="
            px-4
            pt-4
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            <div>

              <h1
                className="
                  text-3xl
                  font-black
                  text-black
                "
              >

                Categories

              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >

                Browse all collections

              </p>

            </div>

          </div>

        </section>

        {/* ======================================================
        CATEGORY SECTION
        ====================================================== */}

        <section
          className="
            mt-5
            w-full
            px-4
          "
        >

          <DynamicCategorySection />

        </section>

      </div>

      {/* ======================================================
      FLOATING WHATSAPP BUTTON
      ====================================================== */}

      <WhatsAppButton />

      {/* ======================================================
      BOTTOM NAVBAR
      ====================================================== */}

      <BottomNavbar />

    </main>

  );

}
