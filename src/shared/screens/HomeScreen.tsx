"use client";

import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/shared/ui/ProductCard";

export const HomeScreen = () => {
  const { products } = useProducts();

  return (
    <main style={{ padding: 20 }}>
      <h1 style={{ color: "white" }}>🔥 Trending Products</h1>

      <div style={{ display: "grid", gap: 20 }}>
        {products.map((p: any) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </main>
  );
};