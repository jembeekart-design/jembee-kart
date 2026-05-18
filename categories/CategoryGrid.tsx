"use client";

import CategoryCard from "./CategoryCard";

interface Category {
  id: string;

  title?: string;

  image?: string;

  backgroundColor?: string;

  textColor?: string;
}

interface CategoryGridProps {
  categories?: Category[];
}

export default function CategoryGrid({
  categories = [
    {
      id: "1",

      title: "Fashion",

      image:
        "https://images.unsplash.com/photo-1445205170230-053b83016050",

      backgroundColor: "#2563eb",

      textColor: "#ffffff"
    },

    {
      id: "2",

      title: "Electronics",

      image:
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",

      backgroundColor: "#7c3aed",

      textColor: "#ffffff"
    },

    {
      id: "3",

      title: "Shoes",

      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff",

      backgroundColor: "#db2777",

      textColor: "#ffffff"
    },

    {
      id: "4",

      title: "Beauty",

      image:
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",

      backgroundColor: "#ea580c",

      textColor: "#ffffff"
    }
  ]
}: CategoryGridProps) {
  return (
    <section className="w-full overflow-hidden px-3 py-5 md:px-6">

      <div className="mb-5 flex items-center justify-between">

        <h2 className="text-2xl font-black text-gray-800 md:text-4xl">
          Shop By Category
        </h2>

      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        {categories.map((category) => {
          return (
            <CategoryCard
              key={category.id}
              title={category.title}
              image={category.image}
              backgroundColor={
                category.backgroundColor
              }
              textColor={category.textColor}
            />
          );
        })}

      </div>

    </section>
  );
}
