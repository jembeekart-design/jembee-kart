// src/shared/integrations/qikink/qikinkSync.ts

import { fetchQikinkProducts } from "./qikinkProducts";
import { mapQikinkProduct } from "../../modules/product/qikinkMapper";
import { createProduct } from "../../modules/product/productService";

export const syncQikinkProducts = async () => {
  const list = await fetchQikinkProducts();

  const results = [];

  for (const item of list) {
    const mapped = mapQikinkProduct(item);

    const saved = await createProduct({
      ...mapped,
      sizes: ["S", "M", "L"],
      colors: ["Black", "White"],
    });

    results.push(saved);
  }

  return results;
};