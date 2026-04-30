"use client";

import { useEffect, useState } from "react";
import { cartStore } from "@/shared/store/cartStore";

export const useCart = () => {
  const [cart, setCart] = useState(cartStore.get());

  useEffect(() => {
    return cartStore.subscribe(setCart);
  }, []);

  return {
    cart,
    add: cartStore.add,
    remove: cartStore.remove,
    clear: cartStore.clear,
  };
};