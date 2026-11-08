export type ModerationAction = 'reject' | 'hide' | 'pendingReview';

export type CommentApprovalMode = 'instant' | 'pendingReview' | 'manual' | 'auto' | 'aiReady';

export interface ModerationSettings {
  enabled: boolean;
  commentsEnabled: boolean;
  requireLoginToComment: boolean;
  
  // Word Filters & Whitelist
  blockedWords: string[];
  allowedWords: string[]; // Whitelist overrides blocked words
  caseInsensitive: boolean;
  blockPartialMatch: boolean;
  enableProfanityFilter: boolean;

  // Length & Constraints
  minCommentLength: number;
  maxCommentLength: number;

  // Pattern Permissions
  allowLinks: boolean;
  allowPhoneNumbers: boolean;
  allowEmailAddresses: boolean;
  allowEmojis: boolean;

  // URL Whitelist/Blacklist
  allowedDomains: string[];
  blockedDomains: string[];

  // Mention & Hashtag Controls
  allowMentions: boolean;
  mentionRule: 'all' | 'verifiedOnly' | 'disabled';
  allowHashtags: boolean;
  maxHashtags: number;
  blockedHashtags: string[];

  // Emoji Controls
  maxEmojis: number;
  allowedEmojiCategories: string[];
  blockedEmojiCategories: string[];

  // Flood & Duplicate Protection
  maxCommentsPerMinute: number;
  maxCommentsPerHour: number;
  maxCommentsPerDay: number;
  duplicateCommentWindowSeconds: number;

  // Spam & Toxic Score Thresholds
  enableSpamDetection: boolean;
  enableToxicScoring: boolean;
  toxicThresholdReview: number; // e.g., 20
  toxicThresholdHide: number;   // e.g., 40
  toxicThresholdReject: number; // e.g., 60

  // Language Filter
  allowedLanguages: string[];
  blockedLanguages: string[];

  // Approval Workflows & Actions
  autoApproveComments: boolean;
  approvalMode: CommentApprovalMode;
  moderationAction: ModerationAction;
  customMessage: string;
  enableVideoModeration: boolean;
  videoToxicThreshold: number;
}

export interface RegexRule {
  id: string;
  name: string;
  pattern: string;
  enabled: boolean;
  message: string;
}

export interface CommentViolation {
  userId: string;
  totalViolations: number;
  lastViolation: number; // Timestamp
  banUntil: number | null; // Timestamp or null for permanent / none
  banReason: string;
  isPermanent: boolean;
}

export interface CommentAuditLog {
  id?: string;
  timestamp: any;
  adminId: string;
  oldValue: Record<string, any>;
  newValue: Record<string, any>;
  changedFields: string[];
  reason: string;
  userId?: string;
}

export interface ReviewQueueItem {
  id: string;
  userId: string;
  videoId: string;
  commentText: string;
  createdAt: any;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  toxicScore?: number;
}

export interface AIModerationAdapter {
  analyzeComment(text: string): Promise<{ toxicScore: number; flags: string[]; recommendedAction: ModerationAction }>;
}
