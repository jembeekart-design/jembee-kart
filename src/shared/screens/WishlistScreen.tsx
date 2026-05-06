"use client";

export const WishlistScreen = () => {
  const wishlist = [
    {
      name: "Running Shoes",
      price: "₹999",
    },
    {
      name: "Wireless Earbuds",
      price: "₹799",
    },
    {
      name: "Smart Watch",
      price: "₹1499",
    },
  ];

  return (
    <div className="min-h-screen bg-bg text-text p-4">
      
      {/* 🔥 Header */}
      <h2 className="text-2xl font-bold mb-6 text-gradient">
        ❤️ Wishlist
      </h2>

      {/* 📦 Empty State */}
      {wishlist.length === 0 && (
        <div className="text-center mt-20 opacity-70">
          <p>No items in wishlist</p>
        </div>
      )}

      {/* 🧱 Wishlist Items */}
      <div className="grid grid-cols-2 gap-4">
        {wishlist.map((item, i) => (
          <div
            key={i}
            className="glass p-4 rounded-2xl hover:scale-[1.02] transition"
          >
            {/* Image placeholder */}
            <div className="h-28 bg-white/10 rounded-lg mb-3"></div>

            {/* Name */}
            <h3 className="font-medium text-sm">{item.name}</h3>

            {/* Price */}
            <p className="text-white/70 text-sm">{item.price}</p>

            {/* Buttons */}
            <div className="flex gap-2 mt-3">
              <button className="btn-primary w-full text-sm">
                Buy
              </button>

              <button className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
