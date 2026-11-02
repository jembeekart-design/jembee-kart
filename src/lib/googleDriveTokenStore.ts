import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { getAdminDb } from "@/firebase/admin";

const COLLECTION = "system_secrets";
const DOCUMENT = "google_drive_oauth";

function getEncryptionKey(): Buffer {
  const raw = process.env.GOOGLE_OAUTH_TOKEN_ENCRYPTION_KEY?.trim();
  if (!raw || !/^[a-fA-F0-9]{64}$/.test(raw)) {
    throw new Error("GOOGLE_OAUTH_TOKEN_ENCRYPTION_KEY must be a 32-byte hex key");
  }
  return Buffer.from(raw, "hex");
}

function encryptToken(token: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return [
    iv.toString("base64"),
    cipher.getAuthTag().toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}

function decryptToken(value: string): string {
  const [ivText, tagText, encryptedText, extra] = value.split(".");
  if (!ivText || !tagText || !encryptedText || extra !== undefined) {
    throw new Error("GOOGLE_DRIVE_TOKEN_CIPHERTEXT_INVALID");
  }
  const iv = Buffer.from(ivText, "base64");
  const tag = Buffer.from(tagText, "base64");
  const encrypted = Buffer.from(encryptedText, "base64");
  if (iv.length !== 12 || tag.length !== 16 || encrypted.length === 0) {
    throw new Error("GOOGLE_DRIVE_TOKEN_CIPHERTEXT_INVALID");
  }
  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export async function saveGoogleDriveRefreshToken(
  token: string,
  adminUid: string
): Promise<void> {
  if (!token.trim() || !adminUid.trim()) {
    throw new Error("Google Drive token and admin identity are required");
  }
  await getAdminDb().collection(COLLECTION).doc(DOCUMENT).set({
    tokenEncrypted: encryptToken(token),
    updatedBy: adminUid,
    updatedAt: new Date(),
    encryptionVersion: 1,
  });
}

export async function getGoogleDriveRefreshToken(): Promise<string> {
  const snapshot = await getAdminDb().collection(COLLECTION).doc(DOCUMENT).get();
  const encrypted = snapshot.data()?.tokenEncrypted;
  if (typeof encrypted === "string" && encrypted.length > 0) {
    return decryptToken(encrypted);
  }

  // Backward-compatible fallback during migration; keep this environment
  // variable server-only and remove it after encrypted storage is populated.
  const legacy = process.env.GOOGLE_OAUTH_REFRESH_TOKEN?.trim();
  if (legacy) return legacy;

  throw new Error("Google Drive refresh token is not configured");
}
