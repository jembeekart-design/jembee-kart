// src/jembee-governance/config/governanceRules.ts

export const GOVERNANCE_RULES = {
  profitability: {
    minimumNetProfitPerOrder: 50,
    blockDeploymentOnLoss: true,
    allowNegativeMarginOrders: false,
    requireProfitabilityScan: true,
  },

  architecture: {
    ecommercePriority: 1,
    referralPriority: 2,
    watchEarnPriority: 3,
    creatorPriority: 4,
    adsPriority: 5,

    ecommerceFirst: true,
    referralSecond: true,
    creatorAfterWatchEarn: true,
  },

  watchEarn: {
    minimumWatchSeconds: 30,

    oneActiveCycleOnly: true,

    rewardLockedUntilSalesComplete: true,

    allowRewardWithoutSales: false,

    requireDeliveredSalesForUnlock: true,

    blockMultipleActiveCycles: true,
  },

  referral: {
    allowCommissionOnlyOnDeliveredOrders: true,

    blockRegistrationIncome: true,

    blockRechargeIncome: true,

    blockPackageIncome: true,

    blockWalletTopupIncome: true,

    blockVideoViewIncome: true,
  },

  creatorEconomy: {
    enabled: true,

    requireAdRevenueSource: true,

    creatorRevenueShareAdminControlled: true,

    blockFixedCreatorRewards: true,
  },

  ecommerce: {
    requireDeliveredOrderForRewards: true,

    requireOrderLifecycleValidation: true,

    blockRewardsOnCancelledOrders: true,

    blockRewardsOnReturnedOrders: true,

    blockRewardsOnFailedOrders: true,
  },

  theme: {
    allowHardcodedColors: false,

    allowHardcodedFonts: false,

    requireAdminThemeControl: true,

    requireFirestoreThemeSettings: true,
  },

  security: {
    detectApiKeys: true,

    detectSecrets: true,

    detectHardcodedAdminRoles: true,

    detectPrivilegeEscalation: true,

    detectBypassedAuthChecks: true,
  },

  firestore: {
    requireFirestoreConfig: true,

    requireIndexes: true,

    requireSecurityRules: true,

    requireAuditLogs: true,
  },

  adminControl: {
    requireFirestoreConfig: true,

    blockHardcodedBusinessRules: true,

    requireFeatureFlags: true,

    requireVersionedConfigs: true,
  },

  deployment: {
    blockDeploymentOnCriticalViolation: true,

    blockDeploymentOnProfitabilityFailure: true,

    blockDeploymentOnSecurityFailure: true,
  },
} as const;
