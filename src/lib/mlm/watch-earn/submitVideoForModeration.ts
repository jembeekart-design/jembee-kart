import { auth } from "@/firebase/config";
import { uploadVideoToDrive } from "./uploadVideoToDrive";

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
  driveFileId?: string;
  message?: string;
}

export async function submitVideoForModeration(
  file: File,
  metadata: ModerationSubmissionMetadata,
  onProgress?: (uploadedBytes: number, totalBytes: number) => void
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

  const token = await currentUser.getIdToken(true);

  console.log("[UPLOAD_DEBUG] SUBMIT_START", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    creatorId: currentUser.uid,
  });

  // 1. Initialize Drive Upload
  const startResponse = await fetch("/api/creator/start-drive-upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename: file.name,
      mimeType: file.type,
      fileSize: file.size,
      ...metadata,
    }),
  });

  const startData = await startResponse.json();

  console.log("[UPLOAD_DEBUG] START_RESPONSE", {
    status: startResponse.status,
    ok: startResponse.ok,
    success: startData?.success,
    submissionId: startData?.submissionId,
    uploadUrlPresent: !!startData?.uploadUrl,
    message: startData?.message,
  });

  if (!startResponse.ok || !startData.success || !startData.submissionId || !startData.uploadUrl) {
    return {
      success: false,
      message: startData.message || "Failed to initialize upload",
    };
  }

  const { submissionId, uploadUrl } = startData;

  console.log("[UPLOAD_DEBUG] DRIVE_UPLOAD_START", {
    submissionId,
    uploadUrlPresent: !!uploadUrl,
  });

  // 2. Direct-to-Drive Upload
  try {
    const driveFileId = await uploadVideoToDrive(file, uploadUrl, onProgress);

    console.log("[UPLOAD_DEBUG] DRIVE_UPLOAD_RETURNED", {
      submissionId,
      driveFileId,
    });

    // 3. Complete Submission
    console.log("[UPLOAD_DEBUG] COMPLETE_REQUEST_START", {
      submissionId,
      driveFileId,
    });

    const completeResponse = await fetch("/api/creator/complete-drive-upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        submissionId,
        driveFileId,
      }),
    });

    const completeData = await completeResponse.json().catch(() => null);

    console.log("[UPLOAD_DEBUG] COMPLETE_RESPONSE", {
      status: completeResponse.status,
      ok: completeResponse.ok,
      data: completeData,
    });

    if (!completeResponse.ok || !completeData || completeData.success !== true) {
      throw new Error(
        typeof completeData?.message === "string"
          ? completeData.message
          : "Failed to complete submission"
      );
    }

    return {
      success: true,
      submissionId,
      driveFileId,
    };
  } catch (error) {
    console.error("[UPLOAD_DEBUG] SUBMIT_ERROR", {
      name: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      submissionId,
    });

    // Recover the server-side Drive resumable session before cancelling.
    try {
      const recoveryResponse = await fetch(
        "/api/creator/recover-drive-upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ submissionId }),
        }
      );

      const recoveryData = await recoveryResponse.json().catch(() => null);

      console.log("[UPLOAD_DEBUG] RECOVERY_RESPONSE", {
        status: recoveryResponse.status,
        ok: recoveryResponse.ok,
        data: recoveryData,
      });

      if (
        recoveryResponse.ok &&
        recoveryData?.success === true &&
        recoveryData?.completed === true &&
        typeof recoveryData.driveFileId === "string" &&
        recoveryData.driveFileId
      ) {
        const recoveredDriveFileId = recoveryData.driveFileId;

        const recoveredCompleteResponse = await fetch(
          "/api/creator/complete-drive-upload",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              submissionId,
              driveFileId: recoveredDriveFileId,
            }),
          }
        );

        const recoveredCompleteData =
          await recoveredCompleteResponse.json().catch(() => null);

        console.log("[UPLOAD_DEBUG] RECOVERED_COMPLETE_RESPONSE", {
          status: recoveredCompleteResponse.status,
          ok: recoveredCompleteResponse.ok,
          data: recoveredCompleteData,
        });

        if (
          recoveredCompleteResponse.ok &&
          recoveredCompleteData?.success === true
        ) {
          onProgress?.(file.size, file.size);

          return {
            success: true,
            submissionId,
            driveFileId: recoveredDriveFileId,
          };
        }
      }

      // If Drive only accepted part of the upload, retry the resumable
      // upload using the same server-created session.
      if (
        recoveryResponse.ok &&
        recoveryData?.success === true &&
        Number(recoveryData?.uploadedBytes) > 0 &&
        Number(recoveryData?.uploadedBytes) < file.size
      ) {
        try {
          const resumedDriveFileId = await uploadVideoToDrive(
            file,
            uploadUrl,
            onProgress
          );

          const resumedCompleteResponse = await fetch(
            "/api/creator/complete-drive-upload",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                submissionId,
                driveFileId: resumedDriveFileId,
              }),
            }
          );

          const resumedCompleteData =
            await resumedCompleteResponse.json().catch(() => null);

          console.log("[UPLOAD_DEBUG] RESUMED_COMPLETE_RESPONSE", {
            status: resumedCompleteResponse.status,
            ok: resumedCompleteResponse.ok,
            data: resumedCompleteData,
          });

          if (
            resumedCompleteResponse.ok &&
            resumedCompleteData?.success === true
          ) {
            onProgress?.(file.size, file.size);

            return {
              success: true,
              submissionId,
              driveFileId: resumedDriveFileId,
            };
          }
        } catch (resumeError) {
          console.error("[UPLOAD_DEBUG] RESUME_AFTER_RECOVERY_FAILED", {
            name:
              resumeError instanceof Error
                ? resumeError.name
                : typeof resumeError,
            message:
              resumeError instanceof Error
                ? resumeError.message
                : String(resumeError),
            submissionId,
          });
        }
      }
    } catch (recoveryError) {
      console.error("[UPLOAD_DEBUG] RECOVERY_REQUEST_FAILED", {
        name:
          recoveryError instanceof Error
            ? recoveryError.name
            : typeof recoveryError,
        message:
          recoveryError instanceof Error
            ? recoveryError.message
            : String(recoveryError),
        submissionId,
      });
    }

    // Cleanup only after recovery/resume attempts fail.
    await fetch("/api/creator/cancel-video-moderation", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ submissionId }),
    });

    return {
      success: false,
      message: error instanceof Error ? error.message : "Video submission failed",
    };
  }
}
