"use client";

import { useCart } from "@/shared/hooks/useCart";

export const CheckoutScreen = () => {
  const { cart } = useCart();

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="min-h-screen bg-bg text-text">

      <div className="container-custom py-6">

        {/* 🔥 TITLE */}
        <h1 className="heading mb-6">💳 Checkout</h1>

        <div className="grid md:grid-cols-3 gap-6">

          {/* 🔥 ADDRESS + PAYMENT */}
          <div className="md:col-span-2 space-y-6">

            {/* ADDRESS */}
            <div className="glass p-5">
              <h2 className="font-semibold mb-3">Shipping Address</h2>

              <input
                placeholder="Full Name"
                className="w-full p-3 mb-3 rounded-xl bg-white/5"
              />

              <input
                placeholder="Address"
                className="w-full p-3 mb-3 rounded-xl bg-white/5"
              />

              <input
                placeholder="Phone Number"
                className="w-full p-3 rounded-xl bg-white/5"
              />
            </div>

            {/* PAYMENT METHOD */}
            <div className="glass p-5">
              <h2 className="font-semibold mb-3">Payment Method</h2>

              <div className="space-y-2">
                <label className="flex gap-2">
                  <input type="radio" name="payment" defaultChecked />
                  Cash on Delivery
                </label>

                <label className="flex gap-2">
                  <input type="radio" name="payment" />
                  UPI / Card (Coming Soon)
                </label>
              </div>
            </div>

          </div>

          {/* 🔥 ORDER SUMMARY */}
          <div className="glass p-5 h-fit">

            <h2 className="font-semibold mb-4">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Items</span>
                <span>{cart.length}</span>
              </div>

              <div className="flex justify-between">
                <span>Total</span>
                <span>₹{total}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery</span>
                <span>Free</span>
              </div>
            </div>

            <hr className="my-4 border-white/10" />

            <div className="flex justify-between font-bold text-lg">
              <span>Final</span>
              <span>₹{total}</span>
            </div>

            <button
              className="btn-primary w-full mt-5"
              onClick={() => alert("Payment Flow Coming Soon")}
            >
              Place Order
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
