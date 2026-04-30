// src/shared/integrations/qikink/qikinkProducts.ts

import { qikinkFetch } from "./qikinkAuth";

// 🔹 Get catalog
export const fetchQikinkProducts = async () => {
  return qikinkFetch("/products");
};

// 🔹 Get single product
export const fetchQikinkProduct = async (id: string) => {
  return qikinkFetch(`/products/${id}`);
};