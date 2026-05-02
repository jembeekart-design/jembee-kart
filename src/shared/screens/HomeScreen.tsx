"use client";

import { useProducts } from "@/hooks/useProducts";

export const HomeScreen = () => {
  const { products } = useProducts();

  return (
    <div>
      <h1>Home</h1>
      {products.map((p) => (
        <div key={p.id}>
          {p.name} - ₹{p.price}
        </div>
      ))}
    </div>
  );
};
