/** Public creator profile projection. Never return private account or payout fields. */
export type CreatorProfileSource = Record<string, unknown>;

export type PublicCreatorProfile = {
  documentId: string;
  displayName: string;
  username: string;
  photoURL: string;
};

export function safeProfileString(value: unknown, maxLength = 500): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function isPublicCreatorVideo(video: CreatorProfileSource): boolean {
  return video.status === "approved" &&
    video.active === true &&
    video.moderation === "safe" &&
    video.videoAccess === "free";
}

export function projectPublicCreatorProfile(
  creatorId: string,
  user: CreatorProfileSource,
  video: CreatorProfileSource,
): PublicCreatorProfile {
  const displayName =
    safeProfileString(user.displayName) ||
    safeProfileString(user.name) ||
    [safeProfileString(user.firstName), safeProfileString(user.lastName)].filter(Boolean).join(" ") ||
    safeProfileString(user.username) ||
    safeProfileString(video.displayName) ||
    safeProfileString(video.username);

  return {
    documentId: safeProfileString(creatorId, 150),
    displayName,
    username: safeProfileString(user.username) || safeProfileString(user.userName) || safeProfileString(video.username),
    photoURL: safeProfileString(user.photoURL) || safeProfileString(user.photo) ||
      safeProfileString(user.profilePhoto) || safeProfileString(video.photoURL) || safeProfileString(video.photo),
  };
}
