import { useEffect, useState } from "react";
import { fetchProducts } from "./productRepository";

export const useProducts = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts().then(setData);
  }, []);

  return data;
};