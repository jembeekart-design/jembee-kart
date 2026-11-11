/**
 * ==========================================================
 * JEMBEE PLAY Security Types
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

}

export interface RegisterUserResponse {

  success: boolean;

  message: string;

}

export interface SecurityValidationResult {

  success: boolean;

  message?: string;

}

export interface FraudValidationResult {

  success: boolean;

  blocked: boolean;

  reason?: string;

}
