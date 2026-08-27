"use client";

import CategoryCard from "./CategoryCard";

interface Category {
  id: string;

  title?: string;

  image?: string;

  backgroundColor?: string;

  textColor?: string;
}

interface CategorySliderProps {
  categories?: Category[];
}

export default function CategorySlider({
  categories = [
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
    },

    {
      id: "5",

      title: "Gaming",

      image:
        "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8",

      backgroundColor: "var(--primary-color)",

      textColor: "var(--primary-color)"
    }
  ]
}: CategorySliderProps) {
  return (
    <section className="w-full overflow-hidden px-3 py-5 md:px-6">

      {/* TITLE */}

      <div className="mb-5 flex items-center justify-between">

        <h2 className="text-2xl font-black text-[var(--text-color)] md:text-4xl">
          Trending Categories
        </h2>

      </div>

      {/* SLIDER */}

      <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2">

        {categories.map((category) => {
          return (
            <div
              key={category.id}
              className="min-w-[220px] flex-shrink-0 md:min-w-[280px]"
            >

              <CategoryCard
                title={category.title}
                image={category.image}
                backgroundColor={
                  category.backgroundColor
                }
                textColor={
                  category.textColor
                }
              />

            </div>
          );
        })}

      </div>

    </section>
  );
}
