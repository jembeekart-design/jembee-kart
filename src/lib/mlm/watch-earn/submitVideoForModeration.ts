import { auth } from "@/firebase/config";
export interface ModerationSubmissionMetadata {
  displayName?: string;
  photoURL?: string;
  username: string;
  caption: string;
  hashtags: string[];
  music: string;
  sponsor: boolean;
  originalVideoId?: string;
  originalAudioId?: string;
  isEnhanced: boolean;
}


export interface ModerationSubmissionResult {
  success: boolean;
  submissionId?: string;
  message?: string;
}

export async function submitVideoForModeration(
  file: File,
  metadata: ModerationSubmissionMetadata
): Promise<ModerationSubmissionResult> {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return {
      success: false,
      message: "Please login first",
    };
  }

  if (!file) {
    return {
      success: false,
      message: "Video file is required",
    };
  }

  if (!file.type.startsWith("video/")) {
    return {
      success: false,
      message: "Only video files are allowed",
    };
  }

  if (file.size > 100 * 1024 * 1024) {
    return {
      success: false,
      message: "Video exceeds the 100MB limit",
    };
  }

  const token = await currentUser.getIdToken();

  const formData = new FormData();

  formData.append(
    "file",
    file,
    file.name
  );

  formData.append(
    "username",
    metadata.username || ""
  );

  formData.append(
    "displayName",
    metadata.displayName || ""
  );

  formData.append(
    "photoURL",
    metadata.photoURL || ""
  );

  formData.append(
    "caption",
    metadata.caption || ""
  );

  formData.append(
    "hashtags",
    JSON.stringify(metadata.hashtags || [])
  );

  formData.append(
    "music",
    metadata.music || ""
  );

  formData.append(
    "sponsor",
    metadata.sponsor ? "true" : "false"
  );

  formData.append(
    "originalVideoId",
    metadata.originalVideoId || ""
  );

  formData.append(
    "originalAudioId",
    metadata.originalAudioId || ""
  );

  formData.append(
    "isEnhanced",
    metadata.isEnhanced ? "true" : "false"
  );

  const response = await fetch(
    "/api/creator/submit-video",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
    ) {
      return {
        success: false,
        message: (data as { message: string }).message,
      };
    }

    return {
      success: false,
      message: "Video moderation submission failed",
    };
  }

  if (
    !data ||
    typeof data !== "object" ||
    !("success" in data) ||
    (data as { success: unknown }).success !== true ||
    !("submissionId" in data) ||
    typeof (data as { submissionId: unknown }).submissionId !== "string"
  ) {
    return {
      success: false,
      message: "Invalid moderation response",
    };
  }

  return {
    success: true,
    submissionId: (data as { submissionId: string }).submissionId,
  };
}
