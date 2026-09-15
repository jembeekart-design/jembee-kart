import { google } from "googleapis";
import { Readable } from "node:stream";

function getOAuthClient() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim();
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN?.trim();

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Google OAuth client credentials are not configured"
    );
  }

  if (!refreshToken) {
    throw new Error(
      "GOOGLE_OAUTH_REFRESH_TOKEN is not configured"
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return oauth2Client;
}

function getDriveClient() {
  return google.drive({
    version: "v3",
    auth: getOAuthClient(),
  });
}

function getFolderId(): string {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();

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

  if (fileSize <= 0) {
    throw new Error("File size must be greater than zero");
  }

  if (fileSize > 100 * 1024 * 1024) {
    throw new Error("File size exceeds 100MB");
  }

  const client = getOAuthClient();
  

  const response = await client.request<{ location?: string }>({
    url:
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
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
    throw new Error(
      "Failed to obtain resumable upload URL"
    );
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

  if (!mimeType.toLowerCase().startsWith("video/")) {
    throw new Error("Only video MIME types are allowed");
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

export async function getDriveFileMetadata(
  fileId: string
): Promise<{
  mimeType: string;
  size: number;
  name: string;
  parents: string[];
}> {
  const drive = getDriveClient();

  const response = await drive.files.get({
    fileId: fileId.trim(),
    fields: "mimeType,size,name,parents",
  });

  if (
    !response.data.mimeType ||
    !response.data.size ||
    !response.data.name
  ) {
    throw new Error(
      "Could not fetch valid file metadata"
    );
  }

  return {
    mimeType: response.data.mimeType,
    size: parseInt(response.data.size, 10),
    name: response.data.name,
    parents: response.data.parents || [],
  };
}

export async function getDriveFileStream(
  fileId: string,
  range?: string
): Promise<{
  stream: Readable;
  mimeType: string;
  size: number;
}> {
  const trimmedFileId = fileId.trim();

  if (!trimmedFileId) {
    throw new Error("Drive file ID is required");
  }

  const drive = getDriveClient();
  const metadata =
    await getDriveFileMetadata(trimmedFileId);

  const response = await drive.files.get(
    {
      fileId: trimmedFileId,
      alt: "media",
    },
    {
      responseType: "stream",
      headers: range ? { Range: range } : {},
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
    size: metadata.size,
  };
}

export async function downloadDriveFile(
  fileId: string
): Promise<Readable> {
  const drive = getDriveClient();

  const response = await drive.files.get(
    {
      fileId: fileId.trim(),
      alt: "media",
    },
    {
      responseType: "stream",
    }
  );

  if (!response.data) {
    throw new Error(
      "Google Drive returned an empty file stream"
    );
  }

  return response.data as Readable;
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
