/** Validated, bounded creator-supplied metadata persisted with a Drive upload. */
export type UploadMetadataInput = {
  displayName?: unknown;
  photoURL?: unknown;
  username?: unknown;
  caption?: unknown;
  hashtags?: unknown;
  music?: unknown;
  sponsor?: unknown;
  originalVideoId?: unknown;
  originalAudioId?: unknown;
  isEnhanced?: unknown;
  videoFormat?: unknown;
  durationSeconds?: unknown;
  videoPrice?: unknown;
};

export type UploadMetadata = {
  displayName: string;
  photoURL: string;
  username: string;
  caption: string;
  hashtags: string[];
  music: string;
  sponsor: boolean;
  originalVideoId: string;
  originalAudioId: string;
  isEnhanced: boolean;
  videoFormat: "short" | "long";
  durationSeconds: number | null;
  videoPrice: 0;
};

const boundedString = (value: unknown, max: number): string | null => {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length <= max ? normalized : null;
};

export function validateUploadMetadata(input: UploadMetadataInput): UploadMetadata | null {
  const displayName = boundedString(input.displayName, 80);
  const photoURL = boundedString(input.photoURL, 2048);
  const username = boundedString(input.username, 40);
  const caption = boundedString(input.caption, 2200);
  const music = boundedString(input.music, 160);
  const originalVideoId = boundedString(input.originalVideoId, 200);
  const originalAudioId = boundedString(input.originalAudioId, 200);
  if ([displayName, photoURL, username, caption, music, originalVideoId, originalAudioId].some((value) => value === null)) return null;
  if (photoURL && !/^https:\/\//i.test(photoURL)) return null;

  let hashtags: string[] = [];
  if (input.hashtags !== undefined && input.hashtags !== null) {
    if (!Array.isArray(input.hashtags) || input.hashtags.length > 30) return null;
    if (input.hashtags.some((tag) => typeof tag !== "string" || tag.trim().length > 50)) return null;
    hashtags = [...new Set(input.hashtags.map((tag: string) => tag.trim().replace(/^#+/, "")).filter(Boolean))];
  }

  const videoFormat = input.videoFormat === "long" ? "long" : "short";
  const durationSeconds = input.durationSeconds === undefined || input.durationSeconds === null
    ? null
    : typeof input.durationSeconds === "number" && Number.isInteger(input.durationSeconds) && input.durationSeconds > 0 && input.durationSeconds <= 86400
      ? input.durationSeconds
      : null;
  if (input.durationSeconds !== undefined && input.durationSeconds !== null && durationSeconds === null) return null;
  if (input.videoPrice !== undefined && (typeof input.videoPrice !== "number" || !Number.isFinite(input.videoPrice) || input.videoPrice < 0 || input.videoPrice > 100000)) return null;

  return {
    displayName: displayName!, photoURL: photoURL!, username: username!, caption: caption!,
    hashtags, music: music!, sponsor: input.sponsor === true,
    originalVideoId: originalVideoId!, originalAudioId: originalAudioId!,
    isEnhanced: input.isEnhanced === true, videoFormat, durationSeconds, videoPrice: 0,
  };
}
