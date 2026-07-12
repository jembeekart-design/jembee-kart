// src/lib/admin-config/defaults.ts

import { AdminConfig } from "./types";

export const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  theme: {
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

    headerBackground: "#6d28d9",
    searchBarColor: "#ffffff",

    successColor: "#16a34a",
    warningColor: "#f59e0b",
    dangerColor: "#dc2626",
  },

  payment: {
    codEnabled: true,
    onlinePaymentEnabled: false,
    defaultPaymentMethod: "cod",
  },

  shipping: {
    freeShipping: true,
    shippingCharge: 0,
    deliveryDays: 3,
  },

  watchEarn: {
    enabled: true,
    requiredVideos: 100,
    rewardAmount: 50,
    requiredSales: 5,
  },

  cashback: {
    enabled: true,
    cashbackPercent: 5,
  },

  mlm: {
    enabled: true,

    level1: 10,
    level2: 5,
    level3: 2,

    maxLevels: 3,
  },
  referral: {
    enabled: true,

    referralBonus: 100,
    maxReferralLevels: 3,
  },
  signup: {
    enabled: true,

    joiningBonus: 0,
    referralBonus: 0,

    requireReferral: false,
  },

  wallet: {
    commissionWalletEnabled: true,
    rewardWalletEnabled: true,
    cashbackWalletEnabled: true,
  },

  seller: {
    enabled: true,
    defaultSellerId: "default_seller",
    defaultSellerName: "JembeeKart Official",
  },

  featureFlags: {
    ecommerce: true,
    referral: true,
    watchEarn: true,
    cashback: true,
    mlm: true,
    creatorEconomy: false,
  },
};

export default DEFAULT_ADMIN_CONFIG;
