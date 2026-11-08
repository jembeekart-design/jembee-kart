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
  
  // Optional semantic theme properties referenced in codebase
  pageBackground?: string;
  sectionBackground?: string;
  surfaceColor?: string;
  cardBackground?: string;
  inputBackground?: string;
  primaryButtonColor?: string;
  secondaryButtonColor?: string;
  textSecondary?: string;
  textMuted?: string;
}

// --- Module Configs ---
// --- Dynamic Page Builder ---
export interface HomepageSection {
  id: string;
  type: string; // e.g., "video_feature", "learning_catalog"
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
  shorts: boolean;
  schoolLearning: boolean;
  creatorUploads: boolean;
  videoModeration: boolean;
  paidVideo: boolean;
  livePayouts: boolean;
  videoAds: boolean;
  notifications: boolean;
  support: boolean;
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
  enabled: boolean;
  videoWatchSeconds: number;
  rewardProgressSeconds: number;
  minimumWatchPercent: number;
  allowSkip: boolean;
  rewardAmount: number;
  requiredVideos: number;
  requiredSales: number;
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
  
  featureFlags: FeatureFlags;
  header: HeaderConfig;
  footer: FooterConfig;
  homepage: HomepageConfig;
  navigation: NavigationConfig;
  support: SupportConfig;
  notification: NotificationConfig;
  app: AppConfig;
}
