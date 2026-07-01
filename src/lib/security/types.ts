/**
 * ==========================================================
 * JembeeKart Security Types
 * Enterprise Security Layer
 * Version : 1.0.0
 * ==========================================================
 */

export interface RegisterUserData {

  uid: string;

  email: string;

  name?: string;

  displayName?: string;

  photoURL?: string;

  emailVerified?: boolean;

  providerId?: string;

  signupSource?: string;

  /**
   * Verified Sponsor Information
   * These values must be resolved by the
   * trusted backend/controller.
   */

  sponsorUid?: string;

  sponsorCode?: string;

  sponsorParentChain?: string[];

}

export interface RegisterUserResponse {

  success: boolean;

  message: string;

}

export interface SecurityValidationResult {

  success: boolean;

  message?: string;

}

export interface ReferralValidationResult {

  success: boolean;

  sponsorUid: string;

  sponsorCode: string;

  parentChain: string[];

  referralCode: string;

  shareCode: string;

  message?: string;

}

export interface FraudValidationResult {

  success: boolean;

  blocked: boolean;

  reason?: string;

}
