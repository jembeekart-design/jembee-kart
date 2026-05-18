"use client";

import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";

import { db } from "@/firebase/config";

import CategoryGrid from "@/components/categories/CategoryGrid";

interface Category {
  id: string;

  title?: string;

  image?: string;

  backgroundColor?: string;

  textColor?: string;

  position?: number;

  visible?: boolean;
}

export default function CategorySection() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  useEffect(() => {
    const categoryQuery = query(
      collection(db, "categories"),
      orderBy("position", "asc")
    );

    const unsubscribe = onSnapshot(
      categoryQuery,
      (snapshot) => {
        const categoryData =
          snapshot.docs.map((doc) => {
            return {
              id: doc.id,
              ...doc.data()
            };
          }) as Category[];

        const visibleCategories =
          categoryData.filter(
            (category) =>
              category.visible !== false
          );

        setCategories(
          visibleCategories
        );
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <section className="w-full overflow-hidden">
      <CategoryGrid
        categories={categories}
      />
    </section>
  );
}
