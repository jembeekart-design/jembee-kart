/**
 * Safe Google Drive error classification.
 * Never serialize provider error objects: OAuth libraries may attach request
 * data (including refresh tokens/client credentials) to nested error fields.
 */
export type SafeGoogleDriveErrorCode =
  | "GOOGLE_DRIVE_AUTH_EXPIRED"
  | "GOOGLE_DRIVE_AUTH_NOT_CONFIGURED"
  | "GOOGLE_DRIVE_CONFIG_INCOMPLETE"
  | "GOOGLE_DRIVE_UPLOAD_SESSION_EXPIRED"
  | "GOOGLE_DRIVE_REQUEST_FAILED";

type ErrorLike = {
  message?: unknown;
  code?: unknown;
  response?: { data?: { error?: unknown; error_description?: unknown }; status?: unknown };
  cause?: unknown;
};

function asErrorLike(value: unknown): ErrorLike | null {
  return value && typeof value === "object" ? value as ErrorLike : null;
}

function getSafeSignals(error: unknown): string {
  const current = asErrorLike(error);
  const cause = asErrorLike(current?.cause);
  const fields = [
    current?.message,
    current?.code,
    current?.response?.data?.error,
    current?.response?.data?.error_description,
    cause?.message,
    cause?.code,
  ];
  return fields.filter((item): item is string | number => typeof item === "string" || typeof item === "number")
    .join(" ")
    .toLowerCase();
}

export function classifyGoogleDriveError(error: unknown): SafeGoogleDriveErrorCode {
  const signals = getSafeSignals(error);
  if (/invalid_grant|token has been expired|token.*revoked|expired or revoked/.test(signals)) {
    return "GOOGLE_DRIVE_AUTH_EXPIRED";
  }
  if (/refresh token is not configured|refresh_token.*not configured/.test(signals)) {
    return "GOOGLE_DRIVE_AUTH_NOT_CONFIGURED";
  }
  if (/oauth client configuration is incomplete|oauth client credentials are not configured|google_drive_folder_id not configured|google_drive_token_encryption_key|ciphertext_invalid/.test(signals)) {
    return "GOOGLE_DRIVE_CONFIG_INCOMPLETE";
  }
  if (/resumable upload session expired/.test(signals)) {
    return "GOOGLE_DRIVE_UPLOAD_SESSION_EXPIRED";
  }
  return "GOOGLE_DRIVE_REQUEST_FAILED";
}

export function googleDriveErrorHttpStatus(code: SafeGoogleDriveErrorCode): number {
  return code === "GOOGLE_DRIVE_REQUEST_FAILED" ? 502 : 503;
}

export function googleDriveClientMessage(code: SafeGoogleDriveErrorCode): string {
  switch (code) {
    case "GOOGLE_DRIVE_AUTH_EXPIRED":
    case "GOOGLE_DRIVE_AUTH_NOT_CONFIGURED":
      return "Google Drive को Admin से दोबारा connect करना आवश्यक है।";
    case "GOOGLE_DRIVE_CONFIG_INCOMPLETE":
      return "Google Drive configuration अधूरी है। Admin configuration जाँचें।";
    case "GOOGLE_DRIVE_UPLOAD_SESSION_EXPIRED":
      return "Upload session समाप्त हो गया। नया upload शुरू करें।";
    default:
      return "Google Drive सेवा अभी उपलब्ध नहीं है। कृपया बाद में पुनः प्रयास करें।";
  }
}
