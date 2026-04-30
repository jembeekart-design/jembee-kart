"use client";

import { useCart } from "@/hooks/useCart";

export const CartScreen = () => {
  const { cart } = useCart();

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>Your Cart 🛒</h2>

      {cart.map((item: any) => (
        <div key={item.id}>
          {item.id} - {item.qty}
        </div>
      ))}
    </div>
  );
};