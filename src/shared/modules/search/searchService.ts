import { getProducts } from "../product/productService";

export const searchProducts = async (query: string) => {
  const products = await getProducts();

  return products.filter((p: any) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );
};