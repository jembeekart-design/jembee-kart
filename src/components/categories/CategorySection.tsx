"use client";

import { useState } from "react";

import CategoryBanner from "./CategoryBanner";

import CategoryFilters from "./CategoryFilters";

import CategoryGrid from "./CategoryGrid";

import CategorySlider from "./CategorySlider";

export default function CategorySection() {
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const categories = [
    {
      id: "1",

      title: "Fashion",

      image:
        "https://images.unsplash.com/photo-1445205170230-053b83016050",

      backgroundColor: "var(--primary-color)",

      textColor: "var(--primary-color)"
    },

    {
      id: "2",

      title: "Electronics",

      image:
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",

      backgroundColor: "var(--primary-color)",

      textColor: "var(--primary-color)"
    },

    {
      id: "3",

      title: "Shoes",

      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff",

      backgroundColor: "var(--primary-color)",

      textColor: "var(--primary-color)"
    },

    {
      id: "4",

      title: "Beauty",

      image:
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",

      backgroundColor: "var(--primary-color)",

      textColor: "var(--primary-color)"
    }
  ];

  const filteredCategories =
    selectedCategory === "All"
      ? categories
      : categories.filter(
          (category) =>
            category.title ===
            selectedCategory
        );

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

      <CategoryBanner />

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
