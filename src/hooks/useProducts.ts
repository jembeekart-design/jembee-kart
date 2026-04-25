'use client';

import { useEffect, useState } from "react";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/services/productService";

export default function useProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🎨 Theme
  const [themeColor, setThemeColor] = useState("#6366f1");

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);
  }, []);

  // 📦 Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Fetch products error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ➕ Add
  const createProduct = async (data: any) => {
    await addProduct(data);
    fetchProducts();
  };

  // ✏️ Update
  const editProduct = async (id: string, data: any) => {
    await updateProduct(id, data);
    fetchProducts();
  };

  // ❌ Delete
  const removeProduct = async (id: string) => {
    await deleteProduct(id);
    fetchProducts();
  };

  return {
    products,
    loading,
    createProduct,
    editProduct,
    removeProduct,
    themeColor,
  };
}
