// src/lib/admin-config/types.ts

// --- Theme Config ---
export interface ThemeConfig {
  mode: "light" | "dark" | "system";
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  cardBorderColor: string;
  buttonColor: string;
  buttonTextColor: string;
  buttonHoverColor: string;
  headerBackground: string;
  searchBarColor: string;
  successColor: string;
  warningColor: string;
  dangerColor: string;
  fontFamily: string;
  borderRadius: string;
}

// --- Module Configs ---
export interface PaymentConfig {
  codEnabled: boolean;
  onlinePaymentEnabled: boolean;
  defaultPaymentMethod: string;
}

export interface ShippingConfig {
  freeShipping: boolean;
  shippingCharge: number;
  deliveryDays: number;
}

export interface WatchEarnConfig {
  enabled: boolean;
  requiredVideos: number;
  rewardAmount: number;
  requiredSales: number;
}

export interface CashbackConfig {
  enabled: boolean;
  cashbackPercent: number;
}

export interface MLMConfig {
  enabled: boolean;
  level1: number;
  level2: number;
  level3: number;
  maxLevels: number;
}

export interface ReferralConfig {
  enabled: boolean;
  referralBonus: number;
  maxReferralLevels: number;
}

export interface SignupConfig {
  enabled: boolean;
  joiningBonus: number;
  referralBonus: number;
  requireReferral: boolean;
}

export interface WalletConfig {
  commissionWalletEnabled: boolean;
  rewardWalletEnabled: boolean;
  cashbackWalletEnabled: boolean;
}

export interface SellerConfig {
  enabled: boolean;
  defaultSellerId: string;
  defaultSellerName: string;
}

// --- Dynamic Page Builder ---
export interface HomepageSection {
  id: string;
  type: string; // e.g., "banner", "product_grid", "category_slider"
  enabled: boolean;
  order: number;
  config?: Record<string, unknown>; // Flexible settings for each section
}

export interface HomepageConfig {
  bannerEnabled: boolean;
  sections: HomepageSection[];
}

// --- Navigation & Header/Footer ---
export interface NavigationItem {
  id: string;
  title: string;
  href: string;
  iconName: string;
  enabled: boolean;
  roles?: string[]; // RBAC support
  badge?: string;   // UI badge support (e.g., "New")
}

export interface NavigationConfig {
  items: NavigationItem[];
}

export interface HeaderConfig {
  logo: string;
  showSearch: boolean;
  showCart: boolean;
  showNotification: boolean;
}

export interface FooterConfig {
  companyName: string;
  copyright: string;
  links: NavigationItem[];
}

// --- Support, Notification, App ---
export interface SupportConfig {
  whatsappNumber: string;
  email: string;
  supportHours: string;
}

export interface NotificationConfig {
  fcmEnabled: boolean;
  pushEnabled: boolean;
  defaultTitle: string;
}

export interface AppConfig {
  appName: string;
  version: string;
  maintenanceMode: boolean;
  minSupportedVersion: string;
}

// --- Feature Flags ---
export interface FeatureFlags {
  ecommerce: boolean;
  referral: boolean;
  watchEarn: boolean;
  cashback: boolean;
  mlm: boolean;
  creatorEconomy: boolean;
  wallet: boolean;
  seller: boolean;
  payment: boolean;
  shipping: boolean;
  notifications: boolean;
  support: boolean;
}

export interface MLMPageConfig {
  enabled: boolean;
  pageTitle: string;
  pageSubtitle: string;
  minimumTransfer: number;
  transferFunction: string;
  searchPlaceholder: string;
  filters: string[];
  transactionTypes: string[];
  statusTypes: string[];
}

// --- ROOT CONFIGURATION ---
export interface ActivityTrackerConfig {
  pageTitle: string;
  pageDescription: string;
  searchPlaceholder: string;
  noLogsFound: string;
  monitoringTitle: string;
  monitoringDescription: string;
  suspiciousTitle: string;
  suspiciousDescription: string;
}

export interface AdminChatConfig {
  pageTitle: string;
  enabled: boolean;
}

export interface AdsManagerConfig {
  pageTitle: string;
  defaultAdRate: number;
}

export interface AnalyticsConfig {
  pageTitle: string;
  refreshInterval: number;
}

export interface AnnouncementConfig {
  pageTitle: string;
  defaultMessage: string;
}

export interface WatchEarnConfig {
  videoWatchSeconds: number;
  rewardProgressSeconds: number;
  minimumWatchPercent: number;
  allowSkip: boolean;
  rewardDelay: number;
  enableUploadButton: boolean;
  uploadButtonText: string;
  uploadButtonIcon: string;
  uploadButtonPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  allowVideoUpload: boolean;
  allowedUserRoles: string[];
  requireAdminApproval: boolean;
  autoPublish: boolean;
  maxVideoDuration: number;
  maxFileSize: number;
  allowedVideoFormats: string[];
}

export interface FloatingAdConfig {
  enabled: boolean;
  title: string;
  imageUrl: string;
  icon: string;
  description: string;
  actionUrl: string;
  skipAfterSeconds: number;
  autoHide: boolean;
  position: "left" | "right" | "center";
  priority: number;
  activeFrom: string;
  activeTo: string;
}

export interface CommentModerationConfig {
  blockedWords: string[];
  regexPatterns: string[];
  autoReject: boolean;
  caseSensitive: boolean;
  maxLength: number;
}

export interface WatchEarnStatsConfig {
  totalCoins: number;
  videosWatched: number;
}

export interface AdminConfig {
  version: number;
  theme: ThemeConfig;
  activityTracker: ActivityTrackerConfig;
  adminChat: AdminChatConfig;
  adsManager: AdsManagerConfig;
  analytics: AnalyticsConfig;
  announcement: AnnouncementConfig;
  watchEarn: WatchEarnConfig;
  watchEarnStats: WatchEarnStatsConfig;
  commentModeration: CommentModerationConfig;
  payment: PaymentConfig;
  referral: ReferralConfig;
  signup: SignupConfig;
  wallet: WalletConfig;
  seller: SellerConfig;
  mlmPage: MLMPageConfig;
  
  featureFlags: FeatureFlags;
  header: HeaderConfig;
  footer: FooterConfig;
  homepage: HomepageConfig;
  navigation: NavigationConfig;
  support: SupportConfig;
  notification: NotificationConfig;
  app: AppConfig;
}
