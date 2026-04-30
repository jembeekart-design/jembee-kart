import { getProducts } from "../product/productService";

export const getSuggestions = async (query: string) => {
  const products = await getProducts();

  return products
    .filter((p: any) =>
      p.title.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5)
    .map((p: any) => p.title);
};