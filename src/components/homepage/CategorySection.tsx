"use client";

interface CategorySectionProps {
  categories?: string[];
}

export default function CategorySection({
  categories = [
    "Fashion",
    "Electronics",
    "Beauty",
    "Shoes",
    "Mobiles",
    "Accessories",
    "Home",
    "Kids"
  ]
}: CategorySectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-4 md:px-6">

      <div className="rounded-[30px] bg-white p-5 shadow-xl md:rounded-[40px] md:p-8">

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-black text-gray-800 md:text-4xl">
            Categories
          </h2>

          <button className="font-bold text-blue-600">
            View All
          </button>

        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">

          {categories.map((category) => {
            return (
              <div
                key={category}
                className="cursor-pointer rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 p-5 text-center font-bold text-gray-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {category}
              </div>
            );
          })}

        </div>

      </div>

    </section>
  );
}
