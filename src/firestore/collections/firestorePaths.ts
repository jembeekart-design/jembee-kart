/** Central Firestore path registry for JEMBEE PLAY video features. */
export const FIRESTORE_PATHS = {
  SHORTS_NOTIFICATIONS: { ROOT: "shorts_notifications", USER_META: "shorts_notification_meta", PREFERENCES: "shorts_notification_preferences" },
  WATCH_EARN: {
    FLOATING_ADS: "watchEarnFloatingAds", STATS: "watchEarnStats", COMMENTS: "comments",
    COMMENT_REPORTS: "commentReports", SAVED_VIDEOS: "savedWatchVideos",
    INTERESTED_VIDEOS: "interestedWatchVideos", NOT_INTERESTED_VIDEOS: "notInterestedWatchVideos",
    VIDEO_REPORTS: "videoReports", BLOCKED_WORDS: "blockedWords",
    SETTINGS: "settings/watchEarn", COMMENT_SETTINGS: "settings/commentModeration",
  },
  AD_MANAGEMENT: { NETWORKS: "adNetworks", SLOTS: "adSlots" },
  ADMIN_CHAT: {
    CHATS: "chats", MESSAGES: "messages", CALL_SESSIONS: "callSessions",
    CALL_INVITATIONS: "callInvitations", USER_PRESENCE: "userPresence",
    TYPING_STATUS: "typingStatus",
  },
} as const;
