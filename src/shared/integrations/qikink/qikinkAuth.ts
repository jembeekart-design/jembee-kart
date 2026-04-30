// src/shared/integrations/qikink/qikinkAuth.ts

const BASE_URL = "https://api.qikink.com/v1"; // verify from docs

let tokenCache: { token: string; exp: number } | null = null;

const getAuthHeader = () => {
  const apiKey = process.env.QIKINK_API_KEY!;
  return { Authorization: `Bearer ${apiKey}` };
};

export const qikinkFetch = async (path: string, options: RequestInit = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Qikink API error");
  }

  return data;
};