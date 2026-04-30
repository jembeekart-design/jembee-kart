export const generateInvoice = (order: any) => {
  return {
    id: `INV-${Date.now()}`,
    orderId: order.id,
    amount: order.total,
    date: new Date().toISOString(),
  };
};