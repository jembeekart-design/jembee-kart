/**
 * ==========================================================
 * JembeeKart Anti Fraud Module
 * Types & Interfaces
 * Version : 1.0.0
 * ==========================================================
 */

export type FraudType =
  | "SELF_REFERRAL"
  | "WITHDRAWAL_FRAUD"
  | "WATCH_FARMING";

export type FraudMatchType =
  | "mobile"
  | "email"
  | "device"
  | "ip"
  | "aadhaar"
  | "pan"
  | "kyc";

export interface AntiFraudConfig {
  enabled: boolean;

  selfReferralProtection: boolean;
  withdrawalFraudProtection: boolean;
  watchFarmingProtection: boolean;

  checkMobile: boolean;
  checkEmail: boolean;
  checkDevice: boolean;
  checkIP: boolean;
  checkKYC: boolean;
  checkPAN: boolean;
  checkAadhaar: boolean;

  blockCommission: boolean;
  autoSuspend: boolean;
  logViolation: boolean;

  configVersion: number;

  updatedAt?: Date;
}

export interface AntiFraudValidationRequest {
  userId: string;

  referralCode?: string;

  mobile?: string;
  email?: string;

  deviceId?: string;
  ipAddress?: string;

  aadhaarNumber?: string;
  panNumber?: string;

  kycVerified?: boolean;
}

export interface AntiFraudValidationResult {
  success: boolean;

  blocked: boolean;

  reason?: string;

  matchedBy?: FraudMatchType;

  fraudType?: FraudType;

  configVersion: number;
}

export interface FraudAuditLog {
  userId: string;

  fraudType: FraudType;

  matchedBy?: FraudMatchType;

  blocked: boolean;

  message: string;

  createdAt: Date;

  configVersion: number;
}
