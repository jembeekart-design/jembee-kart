"use client";

import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Banner from "@/components/layout/Banner";
import Section from "@/components/sections/Section";
import NavItem from "@/components/ui/NavItem";
import { products } from "@/data/products";
import CategoryBar from "@/shared/components/CategoryBar";

export default function HomeScreen() {
  return (
    <div className="bg-gray-100 min-h-screen pb-20">

      {/* Navbar */}
<div className="bg-blue-500 p-3 sticky top-0 z-50">
  <input
    className="w-full p-3 rounded-xl outline-none"
    placeholder="Search for Products"
  />
</div>

{/* Category Bar */}
<CategoryBar />
      <Banner />

      <Section title="Best Value Deals on Fashion" products={products} />
      <Section title="Add to your wishlist" products={products} blue />
      <Section title="Home Decor & Furnishing" products={products} />

      {/* Bottom Nav */}
      <div className="fixed bottom-0 w-full bg-white border-t flex justify-around p-2">
        <NavItem label="Home" active />
        <NavItem label="Categories" />
        <NavItem label="Account" />
        <NavItem label="Cart" />
      </div>

    </div>
  );
}
