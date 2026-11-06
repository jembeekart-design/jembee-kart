import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_TTL_SECONDS = 15 * 60;

type PlaybackPayload = {
  v: 1;
  uid: string;
  videoId: string;
  iat: number;
  exp: number;
};

function getPlaybackSecret(): string {
  const secret = process.env.PLAYBACK_TOKEN_SECRET?.trim() || "";
  if (secret.length < 32) {
    throw new Error("PLAYBACK_TOKEN_SECRET_MISSING_OR_TOO_SHORT");
  }
  return secret;
}

export function playbackCookieName(videoId: string): string {
  const hash = createHash("sha256")
    .update(videoId, "utf8")
    .digest("hex")
    .slice(0, 24);

  return `jbs_playback_${hash}`;
}

export function createPlaybackToken(uid: string, videoId: string): string {
  if (!uid || uid.length > 128 || !videoId || videoId.length > 200) {
    throw new Error("INVALID_PLAYBACK_IDENTITY");
  }

  const now = Math.floor(Date.now() / 1000);

  const payload: PlaybackPayload = {
    v: 1,
    uid,
    videoId,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };

  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", getPlaybackSecret())
    .update(encoded, "utf8")
    .digest("base64url");

  return `${encoded}.${signature}`;
}

export function verifyPlaybackToken(token: string, videoId: string): boolean {
  try {
    if (
      !token ||
      token.length > 2048 ||
      !videoId ||
      videoId.length > 200
    ) {
      return false;
    }

    const parts = token.split(".");
    if (parts.length !== 2) return false;

    const [encoded, suppliedSignature] = parts;

    if (
      !/^[A-Za-z0-9_-]+$/.test(encoded) ||
      !/^[A-Za-z0-9_-]+$/.test(suppliedSignature)
    ) {
      return false;
    }

    const expectedSignature = createHmac("sha256", getPlaybackSecret())
      .update(encoded, "utf8")
      .digest();

    const suppliedBytes = Buffer.from(suppliedSignature, "base64url");

    if (
      suppliedBytes.length !== expectedSignature.length ||
      !timingSafeEqual(expectedSignature, suppliedBytes)
    ) {
      return false;
    }

    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as Partial<PlaybackPayload>;

    const now = Math.floor(Date.now() / 1000);

    return (
      payload.v === 1 &&
      typeof payload.uid === "string" &&
      payload.uid.length > 0 &&
      payload.uid.length <= 128 &&
      payload.videoId === videoId &&
      Number.isSafeInteger(payload.iat) &&
      Number.isSafeInteger(payload.exp) &&
      (payload.iat as number) <= now + 60 &&
      (payload.exp as number) > now &&
      (payload.exp as number) > (payload.iat as number) &&
      (payload.exp as number) - (payload.iat as number) <= TOKEN_TTL_SECONDS
    );
  } catch {
    return false;
  }
}
