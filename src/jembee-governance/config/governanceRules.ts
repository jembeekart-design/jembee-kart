// src/jembee-governance/config/governanceRules.ts

export const GOVERNANCE_RULES = {
  profitability: {
    minimumNetProfitPerOrder: 50,
    blockDeploymentOnLoss: true,
  },

  architecture: {
    ecommercePriority: 1,
    referralPriority: 2,
    watchEarnPriority: 3,
    creatorPriority: 4,
    adsPriority: 5,
  },

  watchEarn: {
    minimumWatchSeconds: 30,
    oneActiveCycleOnly: true,
    rewardLockedUntilSalesComplete: true,
  },

  referral: {
    allowCommissionOnlyOnDeliveredOrders: true,
    blockRegistrationIncome: true,
    blockRechargeIncome: true,
    blockPackageIncome: true,
  },

  theme: {
    allowHardcodedColors: false,
    allowHardcodedFonts: false,
    requireAdminThemeControl: true,
  },

  security: {
    detectApiKeys: true,
    detectSecrets: true,
    detectHardcodedAdminRoles: true,
  },

  adminControl: {
    requireFirestoreConfig: true,
    blockHardcodedBusinessRules: true,
  },
} as const;
