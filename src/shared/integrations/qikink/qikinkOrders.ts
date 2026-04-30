// src/shared/integrations/qikink/qikinkOrders.ts

import { qikinkFetch } from "./qikinkAuth";

export const createQikinkOrder = async (order: any) => {
  return qikinkFetch("/orders", {
    method: "POST",
    body: JSON.stringify(order),
  });
};