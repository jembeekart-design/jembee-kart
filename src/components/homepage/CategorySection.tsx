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
    <section className="w-full overflow-hidden px-4 py-6 md:px-6">

      <div className="mx-auto max-w-7xl rounded-[30px] bg-white p-5 shadow-xl md:rounded-[40px] md:p-8">

        <div className="mb-8 flex items-center justify-between">

          <h2 className="text-3xl font-black text-gray-800 md:text-5xl">
            Categories
          </h2>

          <button className="font-bold text-blue-600">
            View All
          </button>

        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">

          {categories.map((category) => {
            return (
              <div
                key={category}
                className="cursor-pointer rounded-[25px] bg-gradient-to-br from-blue-100 to-indigo-100 p-5 text-center text-sm font-bold text-gray-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:text-base"
              >

                <div className="mb-3 text-3xl">
                  🛍️
                </div>

                {category}

              </div>
            );
          })}

        </div>

      </div>

    </section>
  );
}
