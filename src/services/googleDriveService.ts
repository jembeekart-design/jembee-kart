import { google } from "googleapis";
import { Readable } from "node:stream";

type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
  project_id?: string;
};

function getAuthClient() {
  const rawCredentials =
    process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;

  if (!rawCredentials) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_CREDENTIALS not configured"
    );
  }

  let credentials: ServiceAccountCredentials;

  try {
    credentials = JSON.parse(rawCredentials);
  } catch {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_CREDENTIALS contains invalid JSON"
    );
  }

  if (!credentials.client_email || !credentials.private_key) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_CREDENTIALS is missing required fields"
    );
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });
}

function getDriveClient() {
  const auth = getAuthClient();
  return google.drive({
    version: "v3",
    auth,
  });
}

function getFolderId(): string {
  const folderId =
    process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();

  if (!folderId) {
    throw new Error(
      "GOOGLE_DRIVE_FOLDER_ID not configured"
    );
  }

  return folderId;
}

export async function createResumableUploadSession(
  filename: string,
  mimeType: string,
  fileSize: number
): Promise<string> {
  if (!mimeType.toLowerCase().startsWith("video/")) {
    throw new Error("Only video MIME types are allowed");
  }

  if (fileSize > 100 * 1024 * 1024) {
    throw new Error("File size exceeds 100MB");
  }

  const auth = getAuthClient();
  const client = await auth.getClient();

  const response = await client.request<{ location?: string }>({
    url: "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": mimeType,
      "X-Upload-Content-Length": fileSize.toString(),
    },
    data: {
      name: filename,
      parents: [getFolderId()],
    },
  });

  const uploadUrl = response.headers["location"];

  if (!uploadUrl) {
    throw new Error("Failed to obtain resumable upload URL");
  }

  return uploadUrl;
}

export async function uploadVideoToDrive(
  filename: string,
  stream: Readable,
  mimeType: string
): Promise<string> {
  if (!filename.trim()) {
    throw new Error("Drive filename is required");
  }

  if (
    !mimeType.toLowerCase().startsWith("video/")
  ) {
    throw new Error(
      "Only video MIME types are allowed"
    );
  }

  const drive = getDriveClient();

  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [getFolderId()],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: "id",
  });

  const fileId = response.data.id;

  if (!fileId) {
    throw new Error(
      "Google Drive upload completed without a file ID"
    );
  }

  return fileId;
}

export async function getDriveFileMetadata(fileId: string): Promise<{
  mimeType: string;
  size: number;
  name: string;
  parents: string[];
}> {
  const drive = getDriveClient();
  const response = await drive.files.get({
    fileId,
    fields: "mimeType,size,name,parents",
  });

  if (
    !response.data.mimeType ||
    !response.data.size ||
    !response.data.name
  ) {
    throw new Error("Could not fetch valid file metadata");
  }

  return {
    mimeType: response.data.mimeType,
    size: parseInt(response.data.size, 10),
    name: response.data.name,
    parents: response.data.parents || [],
  };
}

  export async function downloadDriveFile(
  fileId: string
  ): Promise<{

  stream: Readable;
  mimeType: string;
  filename: string;
}> {
  const trimmedFileId = fileId.trim();

  if (!trimmedFileId) {
    throw new Error("Drive file ID is required");
  }

  const drive = getDriveClient();

  const metadataResponse =
    await drive.files.get({
      fileId: trimmedFileId,
      fields: "name,mimeType,size",
    });

  const metadata = metadataResponse.data;

  if (
    !metadata.mimeType ||
    !metadata.mimeType
      .toLowerCase()
      .startsWith("video/")
  ) {
    throw new Error(
      "Drive file is not a video"
    );
  }

  const response =
    await drive.files.get(
      {
        fileId: trimmedFileId,
        alt: "media",
      },
      {
        responseType: "stream",
      }
    );

  if (!response.data) {
    throw new Error(
      "Google Drive returned an empty video stream"
    );
  }

  return {
    stream: response.data as Readable,
    mimeType: metadata.mimeType,
    filename:
      metadata.name?.trim() ||
      `moderation_${trimmedFileId}`,
  };
}

export async function deleteDriveFile(
  fileId: string
): Promise<void> {
  const trimmedFileId = fileId.trim();

  if (!trimmedFileId) {
    return;
  }

  const drive = getDriveClient();

  await drive.files.delete({
    fileId: trimmedFileId,
  });
}
