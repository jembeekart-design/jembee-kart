import type { RegisterUserResponse } from "./types";

export function validateRegistration(
  uid?: string,
  email?: string
): RegisterUserResponse | null {
  if (!uid || !email) {
    return {
      success: false,
      message: "Missing mandatory onboarding attributes: UID and Email.",
    };
  }

  return null;
}
