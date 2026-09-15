import { google } from "googleapis";
import { Readable } from "node:stream";

type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
  project_id?: string;
};

function getDriveClient() {
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

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });

  return google.drive({
    version: "v3",
    auth,
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
