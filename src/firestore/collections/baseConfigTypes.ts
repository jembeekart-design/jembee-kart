/**
 * BASE CONFIGURATION TYPES
 * 
 * Shared types for all configuration documents.
 * Every config document has version, status, timestamps, audit info.
 */

import { Timestamp } from "firebase/firestore";

// ======================================================
// BASE CONFIG DOCUMENT
// ======================================================

export interface BaseConfigDocument {
  /**
   * Document version for tracking changes
   * Format: YYYY-MM-DD-HHmmss or semver (1.0.0)
   */
  version: string;

  /**
   * Status: draft (in progress), published (live), archived (old)
   */
  status: "draft" | "published" | "archived";

  /**
   * Last published timestamp and user
   */
  publishedAt?: Timestamp;
  publishedBy?: string;

  /**
   * Draft creation/update info
   */
  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;

  /**
   * Tags for organizing configs
   */
  tags?: string[];

  /**
   * Description of config purpose
   */
  description?: string;
}

// ======================================================
// CONFIG CHANGE TRACKING
// ======================================================

export interface ConfigChanges {
  /**
   * Fields added in this version
   */
  added: Record<string, any>;

  /**
   * Fields modified in this version
   */
  modified: Record<
    string,
    {
      old: any;
      new: any;
    }
  >;

  /**
   * Fields deleted in this version
   */
  deleted: string[];

  /**
   * Previous version ID for rollback
   */
  previousVersionId?: string;
}

// ======================================================
// ADMIN DRAFT (For Publishing Workflow)
// ======================================================

export interface AdminDraft {
  id: string;
  configType: string; // "theme/colors", "business-rules/mlm", etc
  configPath: string; // Full Firestore path
  title: string;
  description?: string;

  /**
   * Draft content (not yet published)
   */
  content: Record<string, any>;

  /**
   * Based on which published version
   */
  basedOnVersion: string;
  basedOnVersionId: string;

  /**
   * Changes from base version
   */
  changes: ConfigChanges;

  /**
   * Draft workflow status
   */
  status: "draft" | "review" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  rejectionReason?: string;

  /**
   * Creation and update tracking
   */
  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;

  /**
   * Ready to publish
   */
  readyToPublish: boolean;
  publishScheduledAt?: Timestamp;
}

// ======================================================
// CONFIG HISTORY (For Audit Trail & Rollback)
// ======================================================

export interface ConfigHistory {
  id: string;
  version: string;
  versionId: string; // Document ID of published version
  configType: string; // "theme/colors", "business-rules/mlm", etc
  configPath: string; // Full Firestore path

  /**
   * What changed in this version
   */
  changes: ConfigChanges;

  /**
   * Publishing info
   */
  publishedAt: Timestamp;
  publishedBy: string;

  /**
   * Can be rolled back?
   */
  rollbackAvailable: boolean;
  rollbackDeadline: Timestamp; // e.g., 30 days

  /**
   * Optional notes about why this version was published
   */
  changeNotes?: string;
}

// ======================================================
// ADMIN AUDIT LOG (For Governance)
// ======================================================

export interface AuditLogEntry {
  id: string;
  timestamp: Timestamp;
  action:
    | "draft_created"
    | "draft_updated"
    | "draft_submitted_for_review"
    | "draft_approved"
    | "draft_rejected"
    | "config_published"
    | "config_deleted"
    | "config_rolled_back"
    | "draft_discarded";

  /**
   * What was modified
   */
  configType: string; // "theme/colors", "business-rules/mlm", etc
  configPath: string;

  /**
   * Who did it
   */
  performedBy: string;
  userEmail?: string;
  userRole?: string;

  /**
   * Details of the action
   */
  details: Record<string, any>;
  versionAffected?: string;
  draftId?: string;

  /**
   * Context
   */
  ipAddress?: string;
  userAgent?: string;
}

// ======================================================
// VALIDATION ERRORS
// ======================================================

export interface ConfigValidationError {
  field: string;
  message: string;
  value?: any;
  expectedType?: string;
}

// ======================================================
// CONFIG PUBLISHING RESULT
// ======================================================

export interface PublishResult {
  success: boolean;
  versionId?: string;
  version?: string;
  publishedAt?: Timestamp;
  errors?: ConfigValidationError[];
  warnings?: string[];
}

// ======================================================
// CONFIG CACHE KEY CONSTANTS
// ======================================================

export const CACHE_KEYS = {
  THEME: {
    COLORS: "config:theme:colors",
    TYPOGRAPHY: "config:theme:typography",
    COMPONENTS: "config:theme:components",
    LAYOUT: "config:theme:layout",
    ANIMATIONS: "config:theme:animations",
    SHADOWS: "config:theme:shadows",
    ICONS: "config:theme:icons",
    GRADIENTS: "config:theme:gradients",
    DARK_MODE: "config:theme:dark-mode",
  },
  BUSINESS_RULES: {
    MLM: "config:business-rules:mlm",
    REFERRAL: "config:business-rules:referral",
    WALLET: "config:business-rules:wallet",
    CASHBACK: "config:business-rules:cashback",
    WATCH_EARN: "config:business-rules:watch-earn",
    CREATOR_ECONOMY: "config:business-rules:creator-economy",
    SELLER: "config:business-rules:seller",
    LOYALTY: "config:business-rules:loyalty",
    SHIPPING: "config:business-rules:shipping",
    TAX: "config:business-rules:tax",
    RETURNS: "config:business-rules:returns",
    EXCHANGE: "config:business-rules:exchange",
    PROTECTION_FUND: "config:business-rules:protection-fund",
    FRAUD: "config:business-rules:fraud",
  },
  UI_LAYOUT: {
    HEADER: "config:ui-layout:header",
    FOOTER: "config:ui-layout:footer",
    NAVIGATION: "config:ui-layout:navigation",
    HOMEPAGE: "config:ui-layout:homepage",
    DASHBOARD: "config:ui-layout:dashboard",
    PRODUCT_CARD: "config:ui-layout:product-card",
    CATEGORY_PAGE: "config:ui-layout:category-page",
    BANNERS: "config:ui-layout:banners",
  },
  FEATURE_FLAGS: "config:feature-flags",
  CONTENT: {
    UI_TEXT: "config:content:ui-text",
    ERROR_MESSAGES: "config:content:error-messages",
    SUCCESS_MESSAGES: "config:content:success-messages",
    HELP_TEXT: "config:content:help-text",
  },
} as const;

// ======================================================
// CACHE DURATION CONSTANTS
// ======================================================

export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 15 * 60 * 1000, // 15 minutes
  LONG: 60 * 60 * 1000, // 1 hour
} as const;
