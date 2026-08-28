import type {
  AntiFraudConfig,
  AntiFraudValidationRequest,
  AntiFraudValidationResult,
} from "../types/antiFraud.types";

/**
 * ==========================================================
 * JembeeKart
 * Self Referral Validator
 * Firestore Driven
 * Version : 1.0.0
 * ==========================================================
 */

export async function selfReferralValidator(
  config: AntiFraudConfig,
  request: AntiFraudValidationRequest
): Promise<AntiFraudValidationResult> {

  if (!config.selfReferralProtection) {

    return {
      success: true,
      blocked: false,
      configVersion: config.configVersion,
    };

  }

  /**
   * ----------------------------------------------------------
   * NOTE
   * ----------------------------------------------------------
   * Actual Firestore lookups will be added later.
   *
   * Example:
   *
   * ✓ Mobile Check
   * ✓ Email Check
   * ✓ Device Check
   * ✓ IP Check
   * ✓ Aadhaar Check
   * ✓ PAN Check
   * ✓ KYC Check
   *
   * Every check will depend on Admin Config.
   * No business logic is hardcoded here.
   * ----------------------------------------------------------
   */

  return {
    success: true,
    blocked: false,
    configVersion: config.configVersion,
  };

}
