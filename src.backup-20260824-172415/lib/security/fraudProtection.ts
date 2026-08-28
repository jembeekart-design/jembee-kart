import {
  RegisterUserData,
  SecurityValidationResult,
} from "./types";

/**
 * ==========================================================
 * Fraud Protection
 * Basic registration validation layer.
 * ==========================================================
 */
export function validateRegistration(
  data: RegisterUserData
): SecurityValidationResult {

  const uid =
    data.uid?.trim();

  const email =
    data.email?.trim().toLowerCase();

  if (!uid) {
    return {
      success: false,
      message: "User UID is required.",
    };
  }

  if (!email) {
    return {
      success: false,
      message: "Email is required.",
    };
  }

  return {
    success: true,
  };

}
