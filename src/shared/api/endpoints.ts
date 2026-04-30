// src/shared/api/endpoints.ts

import { api, upload } from "./client";

/* =========================
   🔐 AUTH
========================= */
export const AuthAPI = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  me: () => api.get("/auth/me"),
};

/* =========================
   🛍️ PRODUCTS
========================= */
export const ProductAPI = {
  list: (params?: { q?: string; category?: string; page?: number }) => {
    const qs = new URLSearchParams(params as any).toString();
    return api.get(`/products${qs ? `?${qs}` : ""}`);
  },

  get: (id: string) => api.get(`/products/${id}`),

  create: (payload: any) => api.post("/products", payload),

  update: (id: string, payload: any) => api.put(`/products/${id}`, payload),

  remove: (id: string) => api.delete(`/products/${id}`),

  uploadImage: (file: File) => upload("/products/upload", file),
};

/* =========================
   🛒 CART
========================= */
export const CartAPI = {
  get: () => api.get("/cart"),
  add: (productId: string, qty = 1) =>
    api.post("/cart/add", { productId, qty }),
  remove: (productId: string) =>
    api.post("/cart/remove", { productId }),
};

/* =========================
   💳 ORDERS
========================= */
export const OrderAPI = {
  create: (payload: any) => api.post("/orders", payload),
  list: () => api.get("/orders"),
};

/* =========================
   🎨 THEME (Admin)
========================= */
export const ThemeAPI = {
  get: () => api.get("/theme"),
  update: (payload: any) => api.put("/admin/theme", payload),
};

/* =========================
   🔗 QIKINK (Integration-ready)
========================= */
export const QikinkAPI = {
  products: () => api.get("/qikink/products"),
  createOrder: (payload: any) => api.post("/qikink/order", payload),
  track: (orderId: string) => api.get(`/qikink/track/${orderId}`),
};

/* =========================
   🔔 NOTIFICATIONS
========================= */
export const NotificationAPI = {
  list: () => api.get("/notifications"),
};