export const MAX_VIDEO_UPLOAD_BYTES = 500 * 1024 * 1024;

export type VideoUploadInput = { filename?: unknown; mimeType?: unknown; fileSize?: unknown };
export type VideoUploadValidation = { ok: true; filename: string; mimeType: string; fileSize: number } | { ok: false; reason: "invalid_metadata" | "invalid_mime" | "too_large" };

export function validateVideoUpload(input: VideoUploadInput): VideoUploadValidation {
  const filename = typeof input.filename === "string" ? input.filename.trim() : "";
  const mimeType = typeof input.mimeType === "string" ? input.mimeType.trim() : "";
  const fileSize = typeof input.fileSize === "number" ? input.fileSize : NaN;
  if (!filename || filename.length > 255 || !mimeType || mimeType.length > 127 || !Number.isSafeInteger(fileSize) || fileSize <= 0) return { ok: false, reason: "invalid_metadata" };
  if (!/^video\/[a-z0-9.+-]+$/i.test(mimeType)) return { ok: false, reason: "invalid_mime" };
  if (fileSize > MAX_VIDEO_UPLOAD_BYTES) return { ok: false, reason: "too_large" };
  return { ok: true, filename, mimeType, fileSize };
}
