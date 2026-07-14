// src/lib/admin-config/defaults.ts

import { AdminConfig } from "./types";

export const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  version: 1,

  theme: {
    mode: "light",
    primaryColor: "#6d28d9",
    secondaryColor: "#9333ea",
    backgroundColor: "#f8fafc",
    cardColor: "#ffffff",
    textColor: "#111827",
    mutedTextColor: "#6b7280",
    borderColor: "#e5e7eb",
    cardBorderColor: "#e5e7eb",
    buttonColor: "#6d28d9",
    buttonTextColor: "#ffffff",
    buttonHoverColor: "#5521b5",
    headerBackground: "#6d28d9",
    searchBarColor: "#ffffff",
    successColor: "#16a34a",
    warningColor: "#f59e0b",
    dangerColor: "#dc2626",
    fontFamily: "Inter",
    borderRadius: "12px",
  },

  payment: {
    codEnabled: false,
    onlinePaymentEnabled: false,
    defaultPaymentMethod: "none",
  },

  shipping: {
    freeShipping: false,
    shippingCharge: 0,
    deliveryDays: 0,
  },

  watchEarn: {
    enabled: false,
    requiredVideos: 0,
    rewardAmount: 0,
    requiredSales: 0,
  },

  cashback: {
    enabled: false,
    cashbackPercent: 0,
  },

  mlm: {
    enabled: false,
    level1: 0,
    level2: 0,
    level3: 0,
    maxLevels: 0,
  },

  referral: {
    enabled: false,
    referralBonus: 0,
    maxReferralLevels: 0,
  },

  signup: {
    enabled: false,
    joiningBonus: 0,
    referralBonus: 0,
    requireReferral: true,
  },

  wallet: {
    commissionWalletEnabled: false,
    rewardWalletEnabled: false,
    cashbackWalletEnabled: false,
  },

  seller: {
    enabled: false,
    defaultSellerId: "",
    defaultSellerName: "",
  },

  mlmPage: {
    enabled: false,
    pageTitle: "MLM Dashboard",
    pageSubtitle: "Build Team & Earn Daily",
    minimumTransfer: 0,
    transferFunction: "",
    searchPlaceholder: "Search records...",
    filters: [],
    transactionTypes: [],
    statusTypes: [],
  },

  featureFlags: {
    ecommerce: false,
    referral: false,
    watchEarn: false,
    cashback: false,
    mlm: false,
    creatorEconomy: false,
    wallet: false,
    seller: false,
    payment: false,
    shipping: false,
    notifications: false,
    support: false,
  },

  header: {
    logo: "/logo.png",
    showSearch: false, // Changed to false for safe fallback
    showCart: false,   // Changed to false for safe fallback
    showNotification: false, // Changed to false for safe fallback
  },

  footer: {
    companyName: "JembeeKart",
    copyright: "© 2026 JembeeKart. All rights reserved.",
    links: [],
  },

  homepage: {
    bannerEnabled: false, // Changed to false for safe fallback
    sections: [],
  },

  navigation: {
    items: [],
  },

  support: {
    whatsappNumber: "",
    email: "",
    supportHours: "",
  },

  notification: {
    fcmEnabled: false,
    pushEnabled: false,
    defaultTitle: "New Update",
  },

  app: {
    appName: "JembeeKart",
    version: "1.0.0",
    maintenanceMode: false,
    minSupportedVersion: "1.0.0",
  },
};

export default DEFAULT_ADMIN_CONFIG;
