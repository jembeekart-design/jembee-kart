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
    <section className="w-full overflow-hidden px-3 py-5 md:px-6">

      <div className="w-full overflow-hidden rounded-[24px] bg-white p-4 shadow-xl md:rounded-[40px] md:p-8">

        <div className="mb-6 flex items-center justify-between gap-3">

          <h2 className="break-words text-2xl font-black text-gray-800 sm:text-3xl md:text-5xl">
            Categories
          </h2>

          <button className="shrink-0 text-sm font-bold text-blue-600 md:text-base">
            View All
          </button>

        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">

          {categories.map((category) => {
            return (
              <div
                key={category}
                className="min-w-0 cursor-pointer overflow-hidden rounded-[22px] bg-gradient-to-br from-blue-100 to-indigo-100 p-4 text-center text-sm font-bold text-gray-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:text-base"
              >

                <div className="mb-2 text-3xl">
                  🛍️
                </div>

                <p className="break-words">
                  {category}
                </p>

              </div>
            );
          })}

        </div>

      </div>

    </section>
  );
}
