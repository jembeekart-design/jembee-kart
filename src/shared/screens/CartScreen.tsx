"use client";

import { useCart } from "@/shared/hooks/useCart";

export const CartScreen = () => {
  const { cart } = useCart();

  return (
    <div>
      <h1>Cart</h1>

      {cart.length === 0 ? (
        <p>No items</p>
      ) : (
        cart.map((item) => (
          <div key={item.id}>
            {item.name} - ₹{item.price}
          </div>
        ))
      )}
    </div>
  );
};
