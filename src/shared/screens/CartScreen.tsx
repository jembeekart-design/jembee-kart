"use client";

import { useCart } from "@/shared/hooks/useCart";

export const CartScreen = () => {
  const { cart } = useCart();

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="min-h-screen bg-bg text-text">

      <div className="container-custom py-6">

        {/* 🔥 HEADER */}
        <h1 className="heading mb-6">🛒 Your Cart</h1>

        {/* EMPTY STATE */}
        {cart.length === 0 ? (
          <div className="glass p-10 text-center">
            <p className="text-lg opacity-70">Your cart is empty 😢</p>
            <button className="btn-primary mt-4">Shop Now</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">

            {/* 🔥 CART ITEMS */}
            <div className="md:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="glass p-4 flex items-center gap-4"
                >
                  {/* IMAGE */}
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20" />

                  {/* DETAILS */}
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm opacity-70">₹{item.price}</p>
                  </div>

                  {/* ACTION */}
                  <button className="text-red-400 text-sm">
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* 🔥 PRICE SUMMARY */}
            <div className="glass p-5 h-fit">

              <h2 className="text-lg font-semibold mb-4">
                Price Details
              </h2>

              <div className="flex justify-between text-sm mb-2">
                <span>Items</span>
                <span>{cart.length}</span>
              </div>

              <div className="flex justify-between text-sm mb-2">
                <span>Total</span>
                <span>₹{total}</span>
              </div>

              <hr className="my-3 border-white/10" />

              <div className="flex justify-between font-bold text-lg">
                <span>Final</span>
                <span>₹{total}</span>
              </div>

              <button className="btn-primary w-full mt-5">
                Proceed to Checkout
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
