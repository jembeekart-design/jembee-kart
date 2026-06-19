"use client";

interface CategoryFiltersProps {
  selectedCategory?: string;

  onSelectCategory?: (
    category: string
  ) => void;
}

export default function CategoryFilters({
  selectedCategory = "All",

  onSelectCategory
}: CategoryFiltersProps) {
  const filters = [
    "All",

    "Fashion",

    "Electronics",

    "Shoes",

    "Beauty",

    "Gaming",

    "Grocery"
  ];

  return (
    <section className="w-full overflow-hidden px-3 py-4 md:px-6">

      <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">

        {filters.map((filter) => {
          const active =
            selectedCategory ===
            filter;

          return (
            <button
              key={filter}
              onClick={() => {
                if (
                  onSelectCategory
                ) {
                  onSelectCategory(
                    filter
                  );
                }
              }}
              className={`whitespace-nowrap rounded-2xl px-5 py-3 text-sm font-bold transition-all duration-300 md:text-base ${
                active
                  ? "theme-primary-bg text-white shadow-lg"
                  : "bg-white text-gray-700 shadow-md hover:bg-gray-100"
              }`}
            >
              {filter}
            </button>
          );
        })}

      </div>

    </section>
  );
}
