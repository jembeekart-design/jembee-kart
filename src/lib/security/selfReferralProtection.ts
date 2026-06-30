import {
  RegisterUserData,
  SecurityValidationResult,
} from "./types";

/**
 * ==========================================================
 * Self Referral Protection
 * Blocks users from referring themselves.
 * ==========================================================
 */
export function validateSelfReferral(
  data: RegisterUserData
): SecurityValidationResult {

  const userUid =
    data.uid?.trim();

  const sponsorUid =
    data.sponsorUid?.trim();

  if (
    sponsorUid &&
    sponsorUid === userUid
  ) {

    return {
      success: false,
      message:
        "Self referral is not allowed.",
    };

  }

  return {
    success: true,
  };

}
