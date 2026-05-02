"use client";

import { useState } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
};

export const useProducts = () => {
  const [products] = useState<Product[]>([
    { id: "1", name: "T-Shirt", price: 499 },
    { id: "2", name: "Shoes", price: 999 },
  ]);

  return { products };
};
