// src/utils/constants.ts

// 🔥 App Info
export const APP_NAME = "JembeeKart";
export const APP_VERSION = "1.0.0";

// 🌐 Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  ADMIN: "/admin",
  PRODUCTS: "/admin/products",
  ORDERS: "/admin/orders",
  SETTINGS: "/admin/settings",
};

// 🗂 Firestore Collections
export const COLLECTIONS = {
  ADMINS: "admins",
  PRODUCTS: "products",
  ORDERS: "orders",
  USERS: "users",
  THEMES: "themes",
  BANNERS: "banners",
  OFFERS: "offers",
};

// 🔐 Roles
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
};

// 🎨 Default Theme ID
export const DEFAULT_THEME_ID = "default-dark";

// 📦 Product Defaults
export const PRODUCT_DEFAULTS = {
  STOCK: 100,
  MARGIN: 50,
  VISIBLE: true,
};

// 📱 App Limits
export const LIMITS = {
  MAX_PRODUCTS: 1000,
  MAX_IMAGES: 5,
};

// ⏱ Date Formats
export const DATE_FORMAT = "DD/MM/YYYY";

// 🔔 Notification Types
export const NOTIFICATION_TYPES = {
  ORDER: "order",
  OFFER: "offer",
  SYSTEM: "system",
};
