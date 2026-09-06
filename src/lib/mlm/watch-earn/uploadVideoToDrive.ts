/**
 * Uploads a file directly to Google Drive using the resumable upload protocol.
 * Handles mobile-network interruptions, retries, 308 resume responses,
 * completed-session recovery, and resumable session expiry.
 */

type UploadStatusResult = {
  uploadedBytes: number;
  driveFileId?: string;
};

export async function uploadVideoToDrive(
  file: File,
  uploadUrl: string,
  onProgress?: (uploadedBytes: number, totalBytes: number) => void
): Promise<string> {
  // 4MB keeps individual mobile requests smaller while remaining
  // a multiple of Google's required 256KB chunk size.
  const CHUNK_SIZE = 4 * 1024 * 1024;

  let uploadedBytes = 0;

  console.log("[DRIVE_DEBUG] UPLOAD_START", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    chunkSize: CHUNK_SIZE,
    uploadUrlPresent: !!uploadUrl,
  });

  const initialStatus = await queryUploadStatus(uploadUrl, file.size);

  if (initialStatus.driveFileId) {
    console.log("[DRIVE_DEBUG] ALREADY_COMPLETE", {
      driveFileId: initialStatus.driveFileId,
      fileSize: file.size,
    });
    onProgress?.(file.size, file.size);
    return initialStatus.driveFileId;
  }

  uploadedBytes = initialStatus.uploadedBytes;

  console.log("[DRIVE_DEBUG] INITIAL_STATUS_RESULT", {
    uploadedBytes,
    fileSize: file.size,
    percent: Math.round((uploadedBytes / file.size) * 100),
  });

  onProgress?.(uploadedBytes, file.size);

  while (uploadedBytes < file.size) {
    const start = uploadedBytes;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    console.log("[DRIVE_DEBUG] CHUNK_REQUEST", {
      uploadedBytes: start,
      end,
      chunkSize: chunk.size,
      fileSize: file.size,
      percent: Math.round((start / file.size) * 100),
      isFinalChunk: end === file.size,
      contentRange: `bytes ${start}-${end - 1}/${file.size}`,
    });

    let response: Response | null = null;
    let lastFetchError: unknown = null;

    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        response = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Range": `bytes ${start}-${end - 1}/${file.size}`,
            "Content-Type": file.type,
          },
          body: chunk,
        });

        console.log("[DRIVE_DEBUG] CHUNK_ATTEMPT_RESPONSE", {
          attempt,
          status: response.status,
          uploadedBytes: start,
          end,
          fileSize: file.size,
          isFinalChunk: end === file.size,
          online: typeof navigator !== "undefined" ? navigator.onLine : "unknown",
          visibility: typeof document !== "undefined" ? document.visibilityState : "unknown",
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
          connection: typeof navigator !== "undefined" && "connection" in navigator ? String((navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType ?? "unknown") : "unknown",
          cause: error instanceof Error && error.cause ? String(error.cause) : "none",
          uploadHost: (() => { try { return new URL(uploadUrl).host; } catch { return "invalid-url"; } })(),
        });

        break;
      } catch (error) {
        lastFetchError = error;

        console.error("[DRIVE_DEBUG] CHUNK_ATTEMPT_ERROR", {
          attempt,
          maxRetries: 5,
          name: error instanceof Error ? error.name : typeof error,
          message: error instanceof Error ? error.message : String(error),
          uploadedBytes: start,
          end,
          fileSize: file.size,
          isFinalChunk: end === file.size,
        });

        if (attempt < 5) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.min(2000 * attempt, 8000))
          );
        }
      }
    }

    if (!response) {
      console.warn("[DRIVE_DEBUG] CHUNK_FETCH_FAILED_STATUS_RECOVERY", {
        uploadedBytes: start,
        end,
        fileSize: file.size,
      });

      try {
        const recovered = await queryUploadStatus(uploadUrl, file.size);

        if (recovered.driveFileId) {
          console.log("[DRIVE_DEBUG] RECOVERED_COMPLETED_UPLOAD", {
            driveFileId: recovered.driveFileId,
          });
          onProgress?.(file.size, file.size);
          return recovered.driveFileId;
        }

        if (recovered.uploadedBytes > start) {
          uploadedBytes = recovered.uploadedBytes;
          onProgress?.(uploadedBytes, file.size);
          continue;
        }
      } catch (statusError) {
        console.error("[DRIVE_DEBUG] STATUS_AFTER_CHUNK_FAILURE_FAILED", {
          originalError:
            lastFetchError instanceof Error
              ? lastFetchError.message
              : String(lastFetchError),
          statusError:
            statusError instanceof Error
              ? statusError.message
              : String(statusError),
          uploadedBytes: start,
          end,
          fileSize: file.size,
        });
      }

      const errorName =
        lastFetchError instanceof Error
          ? lastFetchError.name
          : typeof lastFetchError;

      const errorMessage =
        lastFetchError instanceof Error
          ? lastFetchError.message
          : String(lastFetchError);

      const errorCause =
        lastFetchError instanceof Error && lastFetchError.cause
          ? String(lastFetchError.cause)
          : "none";

      const networkState =
        typeof navigator !== "undefined"
          ? `online=${navigator.onLine}`
          : "online=unknown";

      const visibilityState =
        typeof document !== "undefined"
          ? `visibility=${document.visibilityState}`
          : "visibility=unknown";

      const connectionType =
        typeof navigator !== "undefined" && "connection" in navigator
          ? String(
              (
                navigator as Navigator & {
                  connection?: { effectiveType?: string };
                }
              ).connection?.effectiveType ?? "unknown"
            )
          : "unknown";

      throw new Error(
        `Drive chunk upload failed after retries: ${errorMessage} | name=${errorName} | cause=${errorCause} | ${networkState} | ${visibilityState} | connection=${connectionType} | chunk=${start}-${end - 1}/${file.size}`
      );
    }

    console.log("[DRIVE_DEBUG] CHUNK_RESPONSE", {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      range: response.headers.get("Range"),
      uploadedBytes: start,
      end,
      fileSize: file.size,
      isFinalChunk: end === file.size,
    });

    if (response.status === 200 || response.status === 201) {
      let data: { id?: string } | null = null;

      try {
        data = await response.json();
      } catch (error) {
        console.error("[DRIVE_DEBUG] COMPLETE_RESPONSE_JSON_ERROR", {
          message: error instanceof Error ? error.message : String(error),
        });
      }

      if (data?.id) {
        console.log("[DRIVE_DEBUG] DRIVE_COMPLETE", {
          driveFileId: data.id,
          fileSize: file.size,
        });

        onProgress?.(file.size, file.size);
        return data.id;
      }

      // Completed response without a readable body:
      // query the resumable session to recover the completed metadata.
      const recovered = await queryUploadStatus(uploadUrl, file.size);

      if (recovered.driveFileId) {
        console.log("[DRIVE_DEBUG] DRIVE_COMPLETE_RECOVERED", {
          driveFileId: recovered.driveFileId,
        });

        onProgress?.(file.size, file.size);
        return recovered.driveFileId;
      }

      throw new Error(
        "Google Drive completed the upload but did not return a file ID."
      );
    }

    if (response.status === 308) {
      const range = response.headers.get("Range");

      if (range) {
        const match = range.match(/bytes=0-(\d+)/);

        if (match) {
          const nextOffset = parseInt(match[1], 10) + 1;

          if (nextOffset > uploadedBytes) {
            uploadedBytes = Math.min(nextOffset, file.size);
          }
        }
      }

      // Never assume the whole chunk arrived.
      // If Drive did not provide a Range, query the session.
      if (uploadedBytes === start) {
        const recovered = await queryUploadStatus(uploadUrl, file.size);

        if (recovered.driveFileId) {
          onProgress?.(file.size, file.size);
          return recovered.driveFileId;
        }

        uploadedBytes = recovered.uploadedBytes;
      }

      onProgress?.(uploadedBytes, file.size);
      continue;
    }

    if (response.status === 404) {
      throw new Error(
        "Google Drive resumable upload session expired. Please create a new upload session."
      );
    }

    // For 5xx and other unexpected responses, ask Drive for the
    // authoritative upload position before retrying.
    const recovered = await queryUploadStatus(uploadUrl, file.size);

    if (recovered.driveFileId) {
      onProgress?.(file.size, file.size);
      return recovered.driveFileId;
    }

    uploadedBytes = recovered.uploadedBytes;
    onProgress?.(uploadedBytes, file.size);
  }

  const finalStatus = await queryUploadStatus(uploadUrl, file.size);

  if (finalStatus.driveFileId) {
    onProgress?.(file.size, file.size);
    return finalStatus.driveFileId;
  }

  throw new Error("Upload reached the end without a Drive file ID.");
}

async function queryUploadStatus(
  uploadUrl: string,
  fileSize: number
): Promise<UploadStatusResult> {
  console.log("[DRIVE_DEBUG] STATUS_REQUEST", {
    fileSize,
    contentRange: `bytes */${fileSize}`,
  });

  const MAX_RETRIES = 5;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Range": `bytes */${fileSize}`,
        },
      });

      const range = response.headers.get("Range");

      console.log("[DRIVE_DEBUG] STATUS_RESPONSE", {
        status: response.status,
        ok: response.ok,
        range,
        attempt,
      });

      if (response.status === 200 || response.status === 201) {
        let data: { id?: string } | null = null;

        try {
          data = await response.json();
        } catch (error) {
          console.error("[DRIVE_DEBUG] STATUS_COMPLETE_JSON_ERROR", {
            message: error instanceof Error ? error.message : String(error),
          });
        }

        if (data?.id) {
          return {
            uploadedBytes: fileSize,
            driveFileId: data.id,
          };
        }

        throw new Error(
          "Drive reports the upload as complete but did not return a file ID."
        );
      }

      if (response.status === 308) {
        if (range) {
          const match = range.match(/bytes=0-(\d+)/);

          if (match) {
            return {
              uploadedBytes: Math.min(
                parseInt(match[1], 10) + 1,
                fileSize
              ),
            };
          }
        }

        return { uploadedBytes: 0 };
      }

      if (response.status === 404) {
        throw new Error(
          "Google Drive resumable upload session expired. Please create a new upload session."
        );
      }

      console.warn("[DRIVE_DEBUG] STATUS_RETRY", {
        attempt,
        status: response.status,
      });
    } catch (error) {
      console.error("[DRIVE_DEBUG] STATUS_FETCH_ERROR", {
        attempt,
        maxRetries: MAX_RETRIES,
        name: error instanceof Error ? error.name : typeof error,
        message: error instanceof Error ? error.message : String(error),
        fileSize,
      });

      if (attempt === MAX_RETRIES) {
        throw error;
      }
    }

    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(2000 * attempt, 8000))
    );
  }

  throw new Error("Google Drive upload status check failed after retries");
}
