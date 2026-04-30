"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/shared/modules/product/productService";

export const useProducts = () => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  return { products };
};