"use client";

import { useEffect, useState } from "react";

import CategoryBanner from "./CategoryBanner";

import CategoryFilters from "./CategoryFilters";

import CategoryGrid from "./CategoryGrid";

import CategorySlider from "./CategorySlider";

import CategorySkeleton from "./CategorySkeleton";

import {
  Category,
  listenCategories
} from "@/firebase/categories/listenCategories";

export default function DynamicCategorySection() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    selectedCategory,
    setSelectedCategory
  ] = useState("All");

  useEffect(() => {
    const unsubscribe =
      listenCategories(
        (
          firestoreCategories
        ) => {
          setCategories(
            firestoreCategories
          );

          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  const filteredCategories =
    selectedCategory === "All"
      ? categories
      : categories.filter(
          (category) =>
            category.title ===
            selectedCategory
        );

  if (loading) {
    return (
      <section className="grid grid-cols-2 gap-4 px-3 py-5 md:grid-cols-4 md:px-6">

        {Array.from({
          length: 4
        }).map((_, index) => {
          return (
            <CategorySkeleton
              key={index}
            />
          );
        })}

      </section>
    );
  }

  return (
    <section className="w-full overflow-hidden">

      {/* FILTERS */}

      <CategoryFilters
        selectedCategory={
          selectedCategory
        }
        onSelectCategory={
          setSelectedCategory
        }
      />

      {/* BANNER */}

      <CategoryBanner
        title="Shop Trending Categories"
        subtitle="Explore the best ecommerce collections powered by AI and smart shopping."
        buttonText="Explore Now"
      />

      {/* GRID */}

      <CategoryGrid
        categories={
          filteredCategories
        }
      />

      {/* SLIDER */}

      <CategorySlider
        categories={categories}
      />

    </section>
  );
}
