"use client";

import DynamicCategorySection from "@/components/categories/DynamicCategorySection";

import Header from "@/components/navigation/Header";

import BottomNavbar from "@/components/navigation/BottomNavbar";

import WhatsAppButton from "@/components/navigation/WhatsAppButton";

export default function CategoriesPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gray-100 pt-[115px] md:pt-[150px]">

      {/* HEADER */}

      <Header />

      {/* PAGE CONTENT */}

      <div className="w-full overflow-x-hidden pb-32">

        <DynamicCategorySection />

      </div>

      {/* FLOATING BUTTONS */}

      <WhatsAppButton />

      <BottomNavbar />

    </main>
  );
}
