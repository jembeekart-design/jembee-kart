// src/shared/integrations/qikink/qikinkWebhook.ts

export const handleQikinkWebhook = async (payload: any) => {
  const { event, data } = payload;

  if (event === "order.shipped") {
    console.log("Order shipped:", data.order_id);
  }

  if (event === "order.delivered") {
    console.log("Order delivered:", data.order_id);
  }

  return { ok: true };
};