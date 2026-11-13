export type CreatorVideoSummaryInput = {
  id: string;
  status?: unknown;
  moderationStatus?: unknown;
  visibility?: unknown;
  createdAt?: unknown;
};

const text = (value: unknown, max = 40) =>
  typeof value === "string" ? value.trim().slice(0, max).toLowerCase() : "";

/** A bounded recent-window projection; it deliberately does not represent lifetime totals or money. */
export function projectCreatorDashboard(videos: CreatorVideoSummaryInput[]) {
  const summary = { sampledVideos: videos.length, published: 0, pending: 0, rejected: 0, other: 0 };
  for (const video of videos) {
    const status = text(video.status);
    const moderation = text(video.moderationStatus);
    if (status === "published" || status === "active" || video.visibility === "public") summary.published++;
    else if (status === "pending" || moderation === "pending" || moderation === "processing") summary.pending++;
    else if (status === "rejected" || moderation === "rejected") summary.rejected++;
    else summary.other++;
  }
  return {
    scope: "bounded_100_creator_video_sample",
    ...summary,
    earnings: { available: false, reason: "Settlement ledger integration has not been verified." },
  };
}

export function projectTeacherDashboard(application: unknown) {
  if (!application || typeof application !== "object") {
    return { status: "not_submitted", verified: false, referralEligible: false };
  }
  const record = application as Record<string, unknown>;
  const status = text(record.status, 24) || "not_submitted";
  const verified = status === "verified";
  return { status, verified, referralEligible: false };
}
