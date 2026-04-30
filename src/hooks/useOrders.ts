"use client";

import { useEffect, useState } from "react";
import { orderStore } from "@/shared/store/orderStore";

export const useOrders = () => {
  const [orders, setOrders] = useState(orderStore.get());

  useEffect(() => {
    return orderStore.subscribe(setOrders);
  }, []);

  return {
    orders,
    addOrder: orderStore.add,
    updateOrder: orderStore.update,
  };
};