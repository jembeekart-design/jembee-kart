"use client";

import { CartProvider }
from "@/context/CartContext";

import {
  ThemeProvider
}
from "@/context/ThemeContext";

export default function Providers({
  children
}: {
  children: React.ReactNode;
}) {

  return (

    <ThemeProvider>

      <CartProvider>

        {children}

      </CartProvider>

    </ThemeProvider>

  );
}
