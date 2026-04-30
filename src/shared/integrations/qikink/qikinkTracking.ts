// src/shared/integrations/qikink/qikinkTracking.ts

import { qikinkFetch } from "./qikinkAuth";

export const trackQikinkOrder = async (orderId: string) => {
  return qikinkFetch(`/orders/${orderId}/tracking`);
};