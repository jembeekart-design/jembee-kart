// src/shared/security/encryption.ts

import crypto from "crypto";

const ALGO = "aes-256-cbc";
const KEY = crypto
  .createHash("sha256")
  .update(process.env.ENCRYPTION_KEY || "secret")
  .digest();

const IV_LENGTH = 16;

export const encrypt = (text: string) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(text),
    cipher.final(),
  ]);

  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

export const decrypt = (data: string) => {
  const parts = data.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = Buffer.from(parts[1], "hex");

  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString();
};