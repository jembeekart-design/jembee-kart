"use client";

import { useState } from "react";

type CartItem = {
  id: string;
  name: string;
  price: number;
};

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => [...prev, item]);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  return { cart, addToCart, removeFromCart };
};
