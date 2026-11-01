/**
 * Legacy browser-side order status mutation is disabled.
 * Use POST /api/admin/orders/status with a Firebase Admin-verified bearer token.
 */
export interface UpdateOrderStatusData {
  orderId: string;
  status: "placed" | "processing" | "shipped" | "delivered" | "cancelled";
}

export async function updateOrderStatus(_data: UpdateOrderStatusData) {
  return {
    success: false as const,
    code: "AUTHENTICATED_SERVER_API_REQUIRED" as const,
    message: "Client-side order status changes are disabled. Use the authenticated Admin order status API.",
  };
}
