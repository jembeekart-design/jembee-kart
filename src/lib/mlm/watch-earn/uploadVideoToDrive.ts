/**
 * Uploads a file directly to Google Drive using the resumable upload protocol.
 * This implementation handles chunking, 308 resumes, status queries, and session expiry.
 */
export async function uploadVideoToDrive(
  file: File,
  uploadUrl: string,
  onProgress?: (uploadedBytes: number, totalBytes: number) => void
): Promise<string> {
  const CHUNK_SIZE = 8 * 1024 * 1024; // 8MB, multiple of 256KB
  let uploadedBytes = 0;

  // 1. Initial Status Check: resume if previous session partially finished
  uploadedBytes = await queryUploadStatus(uploadUrl, file.size);

  // 2. Chunked Upload Loop
  while (uploadedBytes < file.size) {
    const end = Math.min(uploadedBytes + CHUNK_SIZE, file.size);
    const chunk = file.slice(uploadedBytes, end);

    try {
      const response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Range": `bytes ${uploadedBytes}-${end - 1}/${file.size}`,
          "Content-Type": file.type,
        },
        body: chunk,
      });

      if (response.status === 200 || response.status === 201) {
        // Upload complete, extract file ID
        const data = await response.json();
        return data.id;
      } else if (response.status === 308) {
        // Resume incomplete, update offset
        const range = response.headers.get("Range");
        if (range) {
          const match = range.match(/bytes=0-(\d+)/);
          if (match) {
            uploadedBytes = parseInt(match[1], 10) + 1;
          }
        }
        if (onProgress) onProgress(uploadedBytes, file.size);
      } else if (response.status === 404) {
        throw new Error("Google Drive resumable upload session expired. Please create a new upload session.");
      } else {
        // For other errors (5xx), query status to resume from last known safe point
        uploadedBytes = await queryUploadStatus(uploadUrl, file.size);
      }
    } catch (error) {
      // On network failure, query status to resume from last known safe point
      uploadedBytes = await queryUploadStatus(uploadUrl, file.size);
    }
  }

  throw new Error("Upload failed to complete");
}

/**
 * Queries the current status of the resumable upload to resume after failure.
 */
async function queryUploadStatus(uploadUrl: string, fileSize: number): Promise<number> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Range": `bytes */${fileSize}`,
    },
  });

  if (response.status === 200 || response.status === 201) {
    return fileSize; // Already complete
  } else if (response.status === 308) {
    const range = response.headers.get("Range");
    if (range) {
      const match = range.match(/bytes=0-(\d+)/);
      if (match) {
        return parseInt(match[1], 10) + 1;
      }
    }
  } else if (response.status === 404) {
    throw new Error("Google Drive resumable upload session expired. Please create a new upload session.");
  }
  
  return 0; // Fallback to beginning
}
