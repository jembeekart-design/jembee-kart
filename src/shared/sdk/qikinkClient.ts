// src/shared/sdk/qikinkClient.ts

import { ENV } from "../config/env";
import { api } from "../api/client";

type QikinkProduct = {
  id: string;
  name: string;
  basePrice: number;
  images: string[];
};

type CreateOrderInput = {
  items: Array<{ productId: string; qty: number; size?: string }>;
  shipping: {
    name: string;
    phone: string;
    address: string;
    pincode: string;
    city: string;
    state: string;
  };
};

class QikinkClient {
  private base = "/qikink"; // proxied via your API (recommended)

  // 🔹 Fetch products (sync/import)
  async listProducts(): Promise<QikinkProduct[]> {
    return api.get(`${this.base}/products`);
  }

  // 🔹 Create order → send to Qikink
  async createOrder(payload: CreateOrderInput) {
    return api.post(`${this.base}/order`, payload);
  }

  // 🔹 Track order
  async track(orderId: string) {
    return api.get(`${this.base}/track/${orderId}`);
  }
}

export const qikinkClient = new QikinkClient();