import crypto from 'crypto';

export interface PreviewTokenPayload {
  uid: string;
  driveFileId: string;
  exp: number;
}

/**
 * Generate a stateless, HMAC-SHA256 signed preview token.
 * Token is valid for 5 minutes.
 * Never expose the secret to the browser.
 */
export function generatePreviewToken(uid: string, driveFileId: string): string {
  const secret = process.env.MODERATION_PREVIEW_TOKEN_SECRET;

  if (!secret) {
    throw new Error('MODERATION_PREVIEW_TOKEN_SECRET is not configured');
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = now + 5 * 60; // 5 minutes from now

  const payload: PreviewTokenPayload = {
    uid,
    driveFileId,
    exp,
  };

  const payloadJson = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(payloadJson).toString('base64');

  // Create HMAC signature
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadBase64)
    .digest('base64');

  // Return: base64payload.base64signature
  return `${payloadBase64}.${signature}`;
}

/**
 * Verify and decode a preview token.
 * Returns the payload if valid, throws if invalid/expired.
 */
export function verifyPreviewToken(token: string): PreviewTokenPayload {
  const secret = process.env.MODERATION_PREVIEW_TOKEN_SECRET;

  if (!secret) {
    throw new Error('MODERATION_PREVIEW_TOKEN_SECRET is not configured');
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    throw new Error('Invalid token format');
  }

  const [payloadBase64, signatureBase64] = parts;

  // Verify signature using timing-safe comparison
  // First, compute the expected signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payloadBase64)
    .digest('base64');

  const expectedBuffer = Buffer.from(expectedSignature);
  const providedBuffer = Buffer.from(signatureBase64);

  // Compare buffer lengths first to avoid crashes in timingSafeEqual
  if (expectedBuffer.length !== providedBuffer.length) {
    throw new Error('Invalid token signature');
  }

  // Now safe to use timingSafeEqual since lengths match
  if (!crypto.timingSafeEqual(expectedBuffer, providedBuffer)) {
    throw new Error('Invalid token signature');
  }

  // Decode payload
  let payload: PreviewTokenPayload;
  try {
    const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    payload = JSON.parse(payloadJson);
  } catch {
    throw new Error('Failed to decode token payload');
  }

  // Validate payload structure
  if (!payload.uid || !payload.driveFileId || typeof payload.exp !== 'number') {
    throw new Error('Invalid token payload');
  }

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (now >= payload.exp) {
    throw new Error('Token expired');
  }

  return payload;
}
