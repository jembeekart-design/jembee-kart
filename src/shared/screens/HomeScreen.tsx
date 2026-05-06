"use client";

import Navbar from "@/components/Navbar";
import CategoryBar from "@/components/CategoryBar";
import Banner from "@/components/Banner";
import Section from "@/components/Section";
import { products } from "@/data/products";

export default function HomeScreen() {
  return (
    <div className="bg-gray-100 min-h-screen pb-20">
      
      <Navbar />
      <CategoryBar />
      <Banner />

      <Section title="Best Value Deals on Fashion" products={products} />
      <Section title="Add to your wishlist" products={products} blue />
      <Section title="Home Decor & Furnishing" products={products} />
      <Section title="Hair & Skincare Essentials" products={products} />
      
    </div>
  );
}
