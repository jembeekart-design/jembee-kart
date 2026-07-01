/**
 * FIRESTORE CONFIGURATION REGISTRY
 * 
 * Central registry for all Firestore collection paths.
 * Collections are organized by domain (theme, business, content, etc).
 * 
 * RULE: Never hardcode Firestore paths outside this file.
 * All services must import collection paths from here.
 */

// ======================================================
// COLLECTION PATH REGISTRY
// ======================================================

export const FIRESTORE_PATHS = {
  // ==========================================
  // THEME CONFIGURATION (Modular)
  // ==========================================
  THEME: {
    COLORS: "config/theme/colors",
    TYPOGRAPHY: "config/theme/typography",
    COMPONENTS: "config/theme/components",
    LAYOUT: "config/theme/layout",
    ANIMATIONS: "config/theme/animations",
    SHADOWS: "config/theme/shadows",
    ICONS: "config/theme/icons",
    GRADIENTS: "config/theme/gradients",
    DARK_MODE: "config/theme/dark-mode",
  },

  // ==========================================
  // BUSINESS RULES CONFIGURATION (Modular)
  // ==========================================
  BUSINESS_RULES: {
    MLM: "config/business-rules/mlm",
    REFERRAL: "config/business-rules/referral",
    WALLET: "config/business-rules/wallet",
    CASHBACK: "config/business-rules/cashback",
    WATCH_EARN: "config/business-rules/watch-earn",
    CREATOR_ECONOMY: "config/business-rules/creator-economy",
    SELLER: "config/business-rules/seller",
    LOYALTY: "config/business-rules/loyalty",
    SHIPPING: "config/business-rules/shipping",
    TAX: "config/business-rules/tax",
    RETURNS: "config/business-rules/returns",
    EXCHANGE: "config/business-rules/exchange",
    PROTECTION_FUND: "config/business-rules/protection-fund",
    FRAUD: "config/business-rules/fraud",
  },

  // ==========================================
  // UI LAYOUT CONFIGURATION (Modular)
  // ==========================================
  UI_LAYOUT: {
    HEADER: "config/ui-layout/header",
    FOOTER: "config/ui-layout/footer",
    NAVIGATION: "config/ui-layout/navigation",
    HOMEPAGE: "config/ui-layout/homepage",
    DASHBOARD: "config/ui-layout/dashboard",
    PRODUCT_CARD: "config/ui-layout/product-card",
    CATEGORY_PAGE: "config/ui-layout/category-page",
    BANNERS: "config/ui-layout/banners",
  },

  // ==========================================
  // FEATURE FLAGS CONFIGURATION
  // ==========================================
  FEATURE_FLAGS: "config/feature-flags",

  // ==========================================
  // CONTENT & TEXT CONFIGURATION
  // ==========================================
  CONTENT: {
    UI_TEXT: "config/content/ui-text",
    ERROR_MESSAGES: "config/content/error-messages",
    SUCCESS_MESSAGES: "config/content/success-messages",
    HELP_TEXT: "config/content/help-text",
  },

  // ==========================================
  // FORMS CONFIGURATION
  // ==========================================
  FORMS: {
    DEFINITIONS: "config/forms/definitions",
  },

  // ==========================================
  // NOTIFICATIONS CONFIGURATION
  // ==========================================
  NOTIFICATIONS: {
    TEMPLATES: "config/notifications/templates",
    CHANNELS: "config/notifications/channels",
    SCHEDULING: "config/notifications/scheduling",
  },

  // ==========================================
  // ROLES & PERMISSIONS
  // ==========================================
  ROLES_PERMISSIONS: {
    ROLES: "config/roles-permissions/roles",
    PERMISSIONS: "config/roles-permissions/permissions",
  },

  // ==========================================
  // KYC CONFIGURATION
  // ==========================================
  KYC: "config/kyc",

  // ==========================================
  // SEARCH & RANKING
  // ==========================================
  SEARCH: "config/search",

  // ==========================================
  // COMMUNICATION CHANNELS
  // ==========================================
  COMMUNICATION: "config/communication",

  // ==========================================
  // API & INTEGRATIONS
  // ==========================================
  INTEGRATIONS: "config/integrations",

  // ==========================================
  // SEO CONFIGURATION
  // ==========================================
  SEO: "config/seo",

  // ==========================================
  // ADMIN COLLECTIONS
  // ==========================================
  ADMIN: {
    DRAFTS: "admin/config-drafts",
    HISTORY: "admin/config-history",
    AUDIT_LOG: "admin/audit-log",
  },
} as const;

// ======================================================
// HELPER: Get collection path by domain
// ======================================================

export function getConfigPath(
  domain: string,
  module: string
): string {
  const key = domain.toUpperCase().replace(/-/g, "_");
  const moduleKey = module.toUpperCase().replace(/-/g, "_");

  const domainObj = FIRESTORE_PATHS[key as keyof typeof FIRESTORE_PATHS];
  if (!domainObj || typeof domainObj !== "object") {
    throw new Error(
      `Invalid config domain: ${domain}`
    );
  }

  const path =
    domainObj[
      moduleKey as keyof typeof domainObj
    ];
  if (!path) {
    throw new Error(
      `Invalid config module: ${domain}/${module}`
    );
  }

  return path as string;
}

// ======================================================
// HELPER: List all config paths
// ======================================================

export function getAllConfigPaths(): string[] {
  const paths: string[] = [];

  const traverse = (obj: any) => {
    if (typeof obj === "string") {
      paths.push(obj);
    } else if (typeof obj === "object") {
      Object.values(obj).forEach(traverse);
    }
  };

  traverse(FIRESTORE_PATHS);
  return paths;
}
