// src/shared/security/rateLimiter.ts

type Entry = {
  count: number;
  time: number;
};

const store: Record<string, Entry> = {};

const LIMIT = 100; // requests
const WINDOW = 60 * 1000; // 1 min

export const rateLimit = (ip: string) => {
  const now = Date.now();

  if (!store[ip]) {
    store[ip] = { count: 1, time: now };
    return true;
  }

  const diff = now - store[ip].time;

  if (diff > WINDOW) {
    store[ip] = { count: 1, time: now };
    return true;
  }

  if (store[ip].count >= LIMIT) {
    return false;
  }

  store[ip].count++;
  return true;
};