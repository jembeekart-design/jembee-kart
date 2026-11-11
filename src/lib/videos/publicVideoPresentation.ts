import type { WatchVideo } from "@/lib/videos/watch-earn/fetchWatchVideos";

export function publicCreatorName(video: Pick<WatchVideo, "displayName" | "username">): string {
  const displayName = typeof video.displayName === "string" ? video.displayName.trim() : "";
  const username = typeof video.username === "string" ? video.username.trim() : "";
  if (displayName && !displayName.includes("@") && displayName.toLowerCase() !== "unknown user") return displayName;
  if (username && !username.includes("@") && username.toLowerCase() !== "unknown user") return username.startsWith("@") ? username : `@${username}`;
  return "JEMBEE PLAY Creator";
}

export function publicVideoThumbnail(video: Pick<WatchVideo, "id" | "thumbnail">): string {
  const candidate = typeof video.thumbnail === "string" ? video.thumbnail.trim() : "";
  return candidate.startsWith("https://") ? candidate : `/api/shorts/video-thumbnail/${encodeURIComponent(video.id)}`;
}

export function formatVideoDuration(durationSeconds?: number): string | null {
  if (typeof durationSeconds !== "number" || !Number.isFinite(durationSeconds) || durationSeconds <= 0) return null;
  const total = Math.floor(durationSeconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function publicVideoAge(createdAt?: number): string {
  if (!createdAt || !Number.isFinite(createdAt)) return "Recently uploaded";
  const elapsed = Math.max(0, Date.now() - createdAt);
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 60) return minutes < 2 ? "Just now" : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(createdAt));
}
