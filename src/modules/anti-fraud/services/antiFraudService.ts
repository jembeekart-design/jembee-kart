import { loadAntiFraudConfig } from "../config/loadAntiFraudConfig";

import type {
  AntiFraudValidationRequest,
  AntiFraudValidationResult,
} from "../types/antiFraud.types";

/**
 * ==========================================================
 * JembeeKart Anti Fraud Service
 * Firestore Driven
 * Version : 1.0.0
 * ==========================================================
 */

export class AntiFraudService {

  async validate(
    request: AntiFraudValidationRequest
  ): Promise<AntiFraudValidationResult> {

    const config =
      await loadAntiFraudConfig();

    if (!config.enabled) {

      return {
        success: true,
        blocked: false,
        configVersion: config.configVersion,
      };

    }

    /**
     * Validators
     * (Next Steps)
     */

    // Self Referral Validator

    if (
      config.selfReferralProtection
    ) {

      // TODO
      // selfReferralValidator()

    }

    // Withdrawal Validator

    if (
      config.withdrawalFraudProtection
    ) {

      // TODO
      // withdrawalValidator()

    }

    // Watch Farming Validator

    if (
      config.watchFarmingProtection
    ) {

      // TODO
      // watchValidator()

    }

    return {

      success: true,

      blocked: false,

      configVersion:
        config.configVersion,

    };

  }

}

export const antiFraudService =
  new AntiFraudService();
