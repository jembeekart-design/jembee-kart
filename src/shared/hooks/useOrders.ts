"use client";

import { useState } from "react";

type Order = {
  id: string;
  total: number;
};

export const useOrders = () => {
  const [orders] = useState<Order[]>([
    { id: "101", total: 999 },
  ]);

  return { orders };
};
