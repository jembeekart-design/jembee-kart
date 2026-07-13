// src/lib/admin-config/mlmDefaults.ts

import { MLMConfig } from "./mlmTypes";

export const DEFAULT_MLM_CONFIG: MLMConfig = {
  enabled: true,

  pages: {
    affiliate: {
      enabled: true,
      title: "Affiliate",
      subtitle: "Build Team & Earn",
    },

    dashboard: {
      enabled: true,
      title: "MLM Dashboard",
      subtitle: "Manage Your Business",
    },

    earnings: {
      enabled: true,
      title: "Earnings",
      subtitle: "Income History",
    },

    cashback: {
      enabled: true,
      title: "Cashback",
      subtitle: "Cashback Wallet",
    },

    watchEarn: {
      enabled: true,
      title: "Watch & Earn",
      subtitle: "Watch Videos & Earn",
    },

    notifications: {
      enabled: true,
      title: "Notifications",
      subtitle: "Latest Updates",
    },
  },

  cashback: {
    enabled: true,

    minimumTransfer: 100,

    transferFunction: "processWalletTransfer",

    pageTitle: "Cashback Panel",
    pageSubtitle: "Withdrawable Pool Allocation",

    searchPlaceholder: "Search transactions...",

    wallets: {
      main: "Main Wallet",
      commission: "Commission Wallet",
      reward: "Reward Wallet",
      cashback: "Cashback Wallet",
    },

    buttons: {
      transfer: "Transfer Balance",
      history: "Wallet Logs",
      confirm: "Confirm Transfer",
      cancel: "Cancel",
    },

    filters: [
      "all",
      "success",
      "pending",
      "failed",
    ],

    transactionTypes: [
      "cashback",
      "reward",
      "refund",
      "bonus",
      "cashback_transfer",
      "withdrawal",
      "commission",
    ],

    statusTypes: [
      "success",
      "pending",
      "failed",
    ],
  },
};

export default DEFAULT_MLM_CONFIG;
