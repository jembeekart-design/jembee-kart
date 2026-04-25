'use client';

import { useEffect, useState } from "react";
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
} from "@/services/orderService";

export default function useOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🎨 Theme
  const [themeColor, setThemeColor] = useState("#6366f1");

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);
  }, []);

  // 📦 Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✏️ Update status
  const changeStatus = async (id: string, status: string) => {
    await updateOrderStatus(id, status);
    fetchOrders();
  };

  // ❌ Delete order
  const removeOrder = async (id: string) => {
    await deleteOrder(id);
    fetchOrders();
  };

  return {
    orders,
    loading,
    changeStatus,
    removeOrder,
    themeColor,
  };
}
