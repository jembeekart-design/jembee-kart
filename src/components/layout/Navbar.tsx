"use client";

export default function Navbar() {
  return (
    <div className="sticky top-0 z-50 bg-blue-600 shadow">

      {/* TOP SECTION */}
      <div className="p-3">
        <input
          className="w-full p-3 rounded-xl outline-none"
          placeholder="Search for Products"
        />
      </div>

      {/* CATEGORY ICONS (ALWAYS VISIBLE) */}
      <div className="flex gap-5 overflow-x-auto px-3 pb-2 bg-white">
        {[
          { name: "For You", icon: "🛍️" },
          { name: "Fashion", icon: "👕" },
          { name: "Mobiles", icon: "📱" },
          { name: "Beauty", icon: "💄" },
          { name: "Electronics", icon: "💻" },
          { name: "Home", icon: "🏠" },
        ].map((item, i) => (
          <div key={i} className="text-center min-w-[70px]">
            <div className="text-xl">{item.icon}</div>
            <p className="text-xs">{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
