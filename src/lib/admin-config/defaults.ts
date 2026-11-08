// src/lib/admin-config/defaults.ts

import { AdminConfig } from "./types";

export const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  version: 1,

  theme: {
    mode: "light",
    primaryColor: "#06b6d4",
    secondaryColor: "#0284c7",
    backgroundColor: "#f8fafc",
    cardColor: "#ffffff",
    textColor: "#111827",
    mutedTextColor: "#6b7280",
    borderColor: "#e5e7eb",
    cardBorderColor: "#e5e7eb",
    buttonColor: "#06b6d4",
    buttonTextColor: "#ffffff",
    buttonHoverColor: "#0891b2",
    headerBackground: "#06b6d4",
    searchBarColor: "#ffffff",
    successColor: "#16a34a",
    warningColor: "#f59e0b",
    dangerColor: "#dc2626",
    fontFamily: "Inter",
    borderRadius: "12px",
  },

  activityTracker: {
    pageTitle: "Activity Tracker",
    pageDescription: "Track realtime admin & user activities",
    searchPlaceholder: "Search activity...",
    noLogsFound: "No activity logs found.",
    monitoringTitle: "Realtime Monitoring",
    monitoringDescription: "All activities are monitored instantly with realtime tracking, analytics & security logs.",
    suspiciousTitle: "Suspicious Activity Detection",
    suspiciousDescription: "AI automatically detects unusual login, payment or admin activity for protection.",
  },

  adminChat: {
    pageTitle: "Admin Chat",
    enabled: true,
  },

  adsManager: {
    pageTitle: "Ads Manager",
    defaultAdRate: 10,
  },

  analytics: {
    pageTitle: "Analytics",
    refreshInterval: 60,
  },

  announcement: {
    pageTitle: "Announcement",
    defaultMessage: "Welcome to JEMBEE PLAY!",
  },

  watchEarn: {
    enabled: true,
    videoWatchSeconds: 30,
    rewardProgressSeconds: 5,
    minimumWatchPercent: 80,
    allowSkip: true,
    rewardAmount: 5,
    requiredVideos: 100,
    requiredSales: 10,
    rewardDelay: 3,
    enableUploadButton: true,
    uploadButtonText: "Upload Video",
    uploadButtonIcon: "upload",
    uploadButtonPosition: "bottom-right",
    allowVideoUpload: true,
    allowedUserRoles: ["admin", "creator"],
    requireAdminApproval: true,
    autoPublish: false,
    maxVideoDuration: 60,
    maxFileSize: 50,
    allowedVideoFormats: ["mp4", "mov"],
  },

  commentModeration: {
    blockedWords: ["abusive", "hate", "spam"],
    regexPatterns: [],
    autoReject: true,
    caseSensitive: false,
    maxLength: 500,
  },

  watchEarnStats: {
    totalCoins: 0,
    videosWatched: 0,
  },

  featureFlags: {
    shorts: true,
    schoolLearning: true,
    creatorUploads: true,
    videoModeration: true,
    paidVideo: false,
    livePayouts: false,
    videoAds: true,
    notifications: true,
    support: true,
  },

  header: {
    logo: "/logo.png",
    showSearch: false, // Changed to false for safe fallback
    showNotification: false, // Changed to false for safe fallback
  },

  footer: {
    companyName: "JEMBEE PLAY",
    copyright: "© 2026 JEMBEE PLAY. All rights reserved.",
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
    appName: "JEMBEE PLAY",
    version: "1.0.0",
    maintenanceMode: false,
    minSupportedVersion: "1.0.0",
  },
};

export default DEFAULT_ADMIN_CONFIG;
