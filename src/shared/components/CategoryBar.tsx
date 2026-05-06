"use client";

import { useState } from "react";

const categories = [
  "For You",
  "Fashion",
  "Mobiles",
  "Beauty",
  "Electronics",
  "Home",
];

export default function CategoryBar() {
  const [active, setActive] = useState("For You");

  return (
    <div className="bg-white px-3 py-2 overflow-x-auto sticky top-[60px] z-40">
      <div className="flex gap-3 w-max">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setActive(item)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition 
              ${
                active === item
                  ? "bg-blue-100 text-blue-600 font-semibold"
                  : "bg-gray-100 text-gray-600"
              }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
