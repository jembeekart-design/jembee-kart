/** Security policy for provider-sourced video thumbnails. */
export const MAX_THUMBNAIL_BYTES = 5 * 1024 * 1024;
export const THUMBNAIL_FETCH_TIMEOUT_MS = 8_000;

const ALLOWED_THUMBNAIL_HOSTS = [
  "drive.google.com",
  "lh3.googleusercontent.com",
  "googleusercontent.com",
] as const;

const ALLOWED_THUMBNAIL_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/** Accept only HTTPS URLs on Google Drive's known thumbnail host family. */
export function isAllowedThumbnailUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ALLOWED_THUMBNAIL_HOSTS.some(
      (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
    );
  } catch {
    return false;
  }
}

export function isAllowedThumbnailContentType(value: string): boolean {
  return ALLOWED_THUMBNAIL_CONTENT_TYPES.has(value.split(";")[0].trim().toLowerCase());
}

export function isThumbnailLengthAllowed(value: string | null): boolean {
  if (value === null || value.trim() === "") return true;
  const length = Number(value);
  return Number.isSafeInteger(length) && length >= 0 && length <= MAX_THUMBNAIL_BYTES;
}
